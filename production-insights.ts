import dotenv from "dotenv";
import { read } from "./sheets";
import { analyzeProductionData } from "./polish";
dotenv.config();

interface ProductionRow {
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

function parseRow(row: string[]): ProductionRow | null {
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

async function generateInsights() {
  try {
    console.log("🔍 KTL Production Insights Generator");
    console.log("====================================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    const rawData = rows.slice(1);
    console.log(`📊 Raw data rows: ${rawData.length}`);
    console.log(`📊 First row sample: ${rawData[0]?.slice(0, 5).join(' | ')}`);
    
    const data = rawData.map(parseRow).filter(row => row !== null) as ProductionRow[];
    console.log(`📊 Parsed data rows: ${data.length}`);
    console.log(`📊 First parsed row: ${data[0] ? `${data[0].date} | ${data[0].item} | ${data[0].productionPH}` : 'None'}\n`);
    
    // 1. Performance by Item
    console.log("📈 TOP PERFORMING ITEMS:");
    console.log("========================");
    const itemPerformance = data.reduce((acc, row) => {
      if (!acc[row.item]) {
        acc[row.item] = { totalProduction: 0, avgEfficiency: 0, count: 0, totalCost: 0 };
      }
      acc[row.item].totalProduction += row.totalProduced;
      acc[row.item].avgEfficiency += row.productionPH / Math.max(row.targetProductionPH, 1);
      acc[row.item].count += 1;
      acc[row.item].totalCost += row.totalCost;
      return acc;
    }, {} as Record<string, any>);
    
    Object.entries(itemPerformance)
      .map(([item, stats]) => ({
        item,
        avgEfficiency: (stats.avgEfficiency / stats.count * 100).toFixed(1),
        totalProduction: stats.totalProduction,
        avgCost: (stats.totalCost / stats.count).toFixed(2)
      }))
      .sort((a, b) => parseFloat(b.avgEfficiency) - parseFloat(a.avgEfficiency))
      .slice(0, 5)
      .forEach((item, i) => {
        console.log(`${i + 1}. ${item.item}`);
        console.log(`   Efficiency: ${item.avgEfficiency}% | Total Production: ${item.totalProduction} | Avg Cost: $${item.avgCost}`);
      });
    
    console.log();
    
    // 2. Cost Analysis
    console.log("💰 COST ANALYSIS:");
    console.log("=================");
    const totalCost = data.reduce((sum, row) => sum + row.totalCost, 0);
    const totalCMEarned = data.reduce((sum, row) => sum + row.totalCMEarned, 0);
    const totalPL = data.reduce((sum, row) => sum + row.pl, 0);
    const avgCostPerUnit = data.reduce((sum, row) => sum + (row.totalCost / Math.max(row.totalProduced, 1)), 0) / data.length;
    
    console.log(`Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`Total CM Earned: $${totalCMEarned.toFixed(2)}`);
    console.log(`Total P/L: $${totalPL.toFixed(2)}`);
    console.log(`Average Cost per Unit: $${avgCostPerUnit.toFixed(2)}`);
    console.log(`Profit Margin: ${((totalPL / totalCost) * 100).toFixed(2)}%`);
    console.log();
    
    // 3. Resource Utilization
    console.log("⚙️ RESOURCE UTILIZATION:");
    console.log("========================");
    const avgManpower = data.reduce((sum, row) => sum + row.manpower, 0) / data.length;
    const avgMachines = data.reduce((sum, row) => sum + row.machines, 0) / data.length;
    const avgWorkingHours = data.reduce((sum, row) => sum + row.workingHours, 0) / data.length;
    const avgOT = data.reduce((sum, row) => sum + row.ot, 0) / data.length;
    
    console.log(`Average Manpower: ${avgManpower.toFixed(1)} people`);
    console.log(`Average Machines: ${avgMachines.toFixed(1)} units`);
    console.log(`Average Working Hours: ${avgWorkingHours.toFixed(1)} hours`);
    console.log(`Average Overtime: ${avgOT.toFixed(1)} hours`);
    console.log(`Overtime Rate: ${((avgOT / avgWorkingHours) * 100).toFixed(1)}%`);
    console.log();
    
    // 4. Production Trends
    console.log("📊 PRODUCTION TRENDS:");
    console.log("=====================");
    const recentData = data.slice(-10); // Last 10 entries
    const recentAvgProduction = recentData.reduce((sum, row) => sum + row.productionPH, 0) / recentData.length;
    const earlyData = data.slice(0, 10); // First 10 entries
    const earlyAvgProduction = earlyData.reduce((sum, row) => sum + row.productionPH, 0) / earlyData.length;
    
    const trend = recentAvgProduction > earlyAvgProduction ? "📈 IMPROVING" : "📉 DECLINING";
    console.log(`Recent Average Production: ${recentAvgProduction.toFixed(2)} units/hour`);
    console.log(`Early Average Production: ${earlyAvgProduction.toFixed(2)} units/hour`);
    console.log(`Trend: ${trend}`);
    console.log();
    
    // 5. Line Performance
    console.log("🏭 LINE PERFORMANCE:");
    console.log("====================");
    const linePerformance = data.reduce((acc, row) => {
      if (!acc[row.line]) {
        acc[row.line] = { totalProduction: 0, count: 0, avgEfficiency: 0 };
      }
      acc[row.line].totalProduction += row.totalProduced;
      acc[row.line].count += 1;
      acc[row.line].avgEfficiency += row.productionPH / Math.max(row.targetProductionPH, 1);
      return acc;
    }, {} as Record<string, any>);
    
    Object.entries(linePerformance)
      .map(([line, stats]) => ({
        line,
        avgEfficiency: (stats.avgEfficiency / stats.count * 100).toFixed(1),
        totalProduction: stats.totalProduction,
        avgProduction: (stats.totalProduction / stats.count).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.avgEfficiency) - parseFloat(a.avgEfficiency))
      .forEach((line, i) => {
        console.log(`${i + 1}. ${line.line}: ${line.avgEfficiency}% efficiency | ${line.avgProduction} avg units/day`);
      });
    
    console.log();
    console.log("✅ Insights generation complete!");
    
  } catch (error: any) {
    console.error("❌ Error generating insights:", error);
  }
}

generateInsights();
