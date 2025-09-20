import dotenv from "dotenv";
import { read } from "./sheets";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';
import path from 'path';
dotenv.config();

interface ProductionData {
  date: string;
  line: string;
  item: string;
  manpower: number;
  machines: number;
  workingHours: number;
  ot: number;
  totalWorkingHours: number;
  smv: number;
  smvTarget: number;
  orderQuantity: number;
  targetProductionPH: number;
  targetProductionPD: number;
  targetProduction: number;
  dayProduction: number;
  totalProduced: number;
  productionPH: number;
  otCost: number;
  lineCost: number;
  totalCost: number;
  totalCMEarned: number;
  pl: number;
  cpd: number;
  targetCPD: number;
  dailyTargetCPD: number;
  dailyCPD: number;
  cmd: number;
  target: number;
  dailyLineCost: number;
  dailyCMEarning: number;
  monthlyLineCost: number;
  monthlyCMEarning: number;
  monthlyPL: number;
  monthlyProduction: number;
  totalWorkingHours2: number;
  avgProductionPH: number;
  totalHistoricalWorkingHours: number;
  totalHistoricalProduction: number;
  avgHistoricalProductionPH: number;
}

function parseRow(row: string[]): ProductionData | null {
  if (!row || row.length < 10) return null;
  
  return {
    date: row[0] || '',
    line: row[1] || '',
    item: row[2] || '',
    manpower: parseFloat(row[3] || '0') || 0,
    machines: parseFloat(row[4] || '0') || 0,
    workingHours: parseFloat(row[5] || '0') || 0,
    ot: parseFloat(row[6] || '0') || 0,
    totalWorkingHours: parseFloat(row[7] || '0') || 0,
    smv: parseFloat(row[8] || '0') || 0,
    smvTarget: parseFloat(row[9] || '0') || 0,
    orderQuantity: parseFloat(row[10] || '0') || 0,
    targetProductionPH: parseFloat(row[11] || '0') || 0,
    targetProductionPD: parseFloat(row[12] || '0') || 0,
    targetProduction: parseFloat(row[13] || '0') || 0,
    dayProduction: parseFloat(row[14] || '0') || 0,
    totalProduced: parseFloat(row[15] || '0') || 0,
    productionPH: parseFloat(row[16] || '0') || 0,
    otCost: parseFloat(row[17] || '0') || 0,
    lineCost: parseFloat(row[18] || '0') || 0,
    totalCost: parseFloat(row[19] || '0') || 0,
    totalCMEarned: parseFloat(row[20] || '0') || 0,
    pl: parseFloat(row[21] || '0') || 0,
    cpd: parseFloat(row[22] || '0') || 0,
    targetCPD: parseFloat(row[23] || '0') || 0,
    dailyTargetCPD: parseFloat(row[24] || '0') || 0,
    dailyCPD: parseFloat(row[25] || '0') || 0,
    cmd: parseFloat(row[26] || '0') || 0,
    target: parseFloat(row[27] || '0') || 0,
    dailyLineCost: parseFloat(row[28] || '0') || 0,
    dailyCMEarning: parseFloat(row[29] || '0') || 0,
    monthlyLineCost: parseFloat(row[30] || '0') || 0,
    monthlyCMEarning: parseFloat(row[31] || '0') || 0,
    monthlyPL: parseFloat(row[32] || '0') || 0,
    monthlyProduction: parseFloat(row[33] || '0') || 0,
    totalWorkingHours2: parseFloat(row[34] || '0') || 0,
    avgProductionPH: parseFloat(row[35] || '0') || 0,
    totalHistoricalWorkingHours: parseFloat(row[36] || '0') || 0,
    totalHistoricalProduction: parseFloat(row[37] || '0') || 0,
    avgHistoricalProductionPH: parseFloat(row[38] || '0') || 0,
  };
}

async function createVisualizations() {
  try {
    console.log("📊 KTL Production Data Visualizer");
    console.log("==================================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    const data = rows.slice(1).map(parseRow).filter(row => row !== null) as ProductionData[];
    console.log(`📊 Loaded ${data.length} production records`);
    
    // Create output directory
    const outputDir = './visualizations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 1200, height: 800 });
    
    // 1. Production Rate Over Time
    console.log("📈 Creating Production Rate Over Time chart...");
    const productionChart = await chartJSNodeCanvas.renderToBuffer({
      type: 'line',
      data: {
        labels: data.map(d => d.date).slice(0, 20), // First 20 dates
        datasets: [{
          label: 'Production Rate (units/hour)',
          data: data.map(d => d.productionPH).slice(0, 20),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }, {
          label: 'Target Production Rate (units/hour)',
          data: data.map(d => d.targetProductionPH).slice(0, 20),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'KTL U1-1 Production Rate Over Time'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units per Hour'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    fs.writeFileSync(path.join(outputDir, 'production-rate-over-time.png'), productionChart);
    console.log("✅ Production Rate Over Time chart saved");
    
    // 2. Item Performance Comparison
    console.log("📊 Creating Item Performance Comparison chart...");
    const itemPerformance = data.reduce((acc, row) => {
      if (!acc[row.item]) {
        acc[row.item] = { totalProduction: 0, avgEfficiency: 0, count: 0 };
      }
      acc[row.item].totalProduction += row.totalProduced;
      acc[row.item].avgEfficiency += row.productionPH / Math.max(row.targetProductionPH, 1);
      acc[row.item].count += 1;
      return acc;
    }, {} as Record<string, any>);
    
    const items = Object.keys(itemPerformance).slice(0, 8); // Top 8 items
    const itemData = items.map(item => ({
      item: item.length > 20 ? item.substring(0, 20) + '...' : item,
      totalProduction: itemPerformance[item].totalProduction,
      avgEfficiency: (itemPerformance[item].avgEfficiency / itemPerformance[item].count * 100)
    }));
    
    const itemChart = await chartJSNodeCanvas.renderToBuffer({
      type: 'bar',
      data: {
        labels: itemData.map(i => i.item),
        datasets: [{
          label: 'Total Production',
          data: itemData.map(i => i.totalProduction),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'KTL U1-1 Item Production Comparison'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Production Units'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Items'
            }
          }
        }
      }
    });
    
    fs.writeFileSync(path.join(outputDir, 'item-performance-comparison.png'), itemChart);
    console.log("✅ Item Performance Comparison chart saved");
    
    // 3. Resource Utilization
    console.log("⚙️ Creating Resource Utilization chart...");
    const resourceChart = await chartJSNodeCanvas.renderToBuffer({
      type: 'doughnut',
      data: {
        labels: ['Manpower', 'Machines', 'Working Hours', 'Overtime'],
        datasets: [{
          data: [
            data.reduce((sum, d) => sum + d.manpower, 0) / data.length,
            data.reduce((sum, d) => sum + d.machines, 0) / data.length,
            data.reduce((sum, d) => sum + d.workingHours, 0) / data.length,
            data.reduce((sum, d) => sum + d.ot, 0) / data.length
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'KTL U1-1 Average Resource Utilization'
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });
    
    fs.writeFileSync(path.join(outputDir, 'resource-utilization.png'), resourceChart);
    console.log("✅ Resource Utilization chart saved");
    
    // 4. Cost Analysis
    console.log("💰 Creating Cost Analysis chart...");
    const costChart = await chartJSNodeCanvas.renderToBuffer({
      type: 'line',
      data: {
        labels: data.map(d => d.date).slice(0, 15), // First 15 dates
        datasets: [{
          label: 'Total Cost',
          data: data.map(d => d.totalCost).slice(0, 15),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }, {
          label: 'CM Earned',
          data: data.map(d => d.totalCMEarned).slice(0, 15),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }, {
          label: 'P/L',
          data: data.map(d => d.pl).slice(0, 15),
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'KTL U1-1 Cost Analysis Over Time'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cost ($)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    fs.writeFileSync(path.join(outputDir, 'cost-analysis.png'), costChart);
    console.log("✅ Cost Analysis chart saved");
    
    // 5. Efficiency Trend
    console.log("📈 Creating Efficiency Trend chart...");
    const efficiencyData = data.map(d => ({
      date: d.date,
      efficiency: d.targetProductionPH > 0 ? (d.productionPH / d.targetProductionPH * 100) : 0
    })).filter(d => d.efficiency > 0).slice(0, 20);
    
    const efficiencyChart = await chartJSNodeCanvas.renderToBuffer({
      type: 'line',
      data: {
        labels: efficiencyData.map(d => d.date),
        datasets: [{
          label: 'Efficiency %',
          data: efficiencyData.map(d => d.efficiency),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'KTL U1-1 Production Efficiency Trend'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 200,
            title: {
              display: true,
              text: 'Efficiency (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    fs.writeFileSync(path.join(outputDir, 'efficiency-trend.png'), efficiencyChart);
    console.log("✅ Efficiency Trend chart saved");
    
    // Create HTML report
    console.log("📄 Creating HTML report...");
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>KTL U1-1 Production Data Visualization Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #333; }
        .chart { margin: 20px 0; text-align: center; }
        .chart img { max-width: 100%; height: auto; border: 1px solid #ddd; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏭 KTL U1-1 Production Data Visualization Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
        <h2>📊 Data Summary</h2>
        <p>This report contains visualizations of ${data.length} production records from the U1-1 production line.</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${data.length}</div>
            <div class="stat-label">Total Records</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.reduce((sum, d) => sum + d.totalProduced, 0).toLocaleString()}</div>
            <div class="stat-label">Total Production</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${(data.reduce((sum, d) => sum + d.productionPH, 0) / data.length).toFixed(1)}</div>
            <div class="stat-label">Avg Production/Hour</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${[...new Set(data.map(d => d.item))].length}</div>
            <div class="stat-label">Unique Items</div>
        </div>
    </div>
    
    <div class="chart">
        <h2>📈 Production Rate Over Time</h2>
        <img src="production-rate-over-time.png" alt="Production Rate Over Time">
    </div>
    
    <div class="chart">
        <h2>📊 Item Performance Comparison</h2>
        <img src="item-performance-comparison.png" alt="Item Performance Comparison">
    </div>
    
    <div class="chart">
        <h2>⚙️ Resource Utilization</h2>
        <img src="resource-utilization.png" alt="Resource Utilization">
    </div>
    
    <div class="chart">
        <h2>💰 Cost Analysis</h2>
        <img src="cost-analysis.png" alt="Cost Analysis">
    </div>
    
    <div class="chart">
        <h2>📈 Efficiency Trend</h2>
        <img src="efficiency-trend.png" alt="Efficiency Trend">
    </div>
    
    <div class="summary">
        <h2>📋 Key Insights</h2>
        <ul>
            <li>Average production rate: ${(data.reduce((sum, d) => sum + d.productionPH, 0) / data.length).toFixed(2)} units/hour</li>
            <li>Average target rate: ${(data.reduce((sum, d) => sum + d.targetProductionPH, 0) / data.length).toFixed(2)} units/hour</li>
            <li>Overall efficiency: ${(data.reduce((sum, d) => sum + (d.targetProductionPH > 0 ? d.productionPH / d.targetProductionPH : 0), 0) / data.length * 100).toFixed(1)}%</li>
            <li>Total cost: $${data.reduce((sum, d) => sum + d.totalCost, 0).toLocaleString()}</li>
            <li>Total CM earned: $${data.reduce((sum, d) => sum + d.totalCMEarned, 0).toLocaleString()}</li>
        </ul>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputDir, 'report.html'), htmlReport);
    console.log("✅ HTML report saved");
    
    console.log("\n🎉 Visualization complete!");
    console.log("==========================");
    console.log(`📁 Charts saved in: ${path.resolve(outputDir)}`);
    console.log("📊 Generated charts:");
    console.log("   • production-rate-over-time.png");
    console.log("   • item-performance-comparison.png");
    console.log("   • resource-utilization.png");
    console.log("   • cost-analysis.png");
    console.log("   • efficiency-trend.png");
    console.log("   • report.html (complete report)");
    console.log(`\n🌐 Open report.html in your browser to view all visualizations!`);
    
  } catch (error: any) {
    console.error("❌ Error creating visualizations:", error);
  }
}

createVisualizations();
