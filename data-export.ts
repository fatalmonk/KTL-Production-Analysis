import dotenv from "dotenv";
import { read, write } from "./sheets";
import { polish } from "./polish";
import fs from 'fs';
dotenv.config();

interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  filter?: {
    item?: string | undefined;
    line?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
  };
  columns?: string[];
}

function parseRow(row: string[]) {
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

function filterData(data: any[], filter: ExportOptions['filter']) {
  if (!filter) return data;
  
  return data.filter(row => {
    if (filter.item && !row.item.toLowerCase().includes(filter.item.toLowerCase())) return false;
    if (filter.line && row.line !== filter.line) return false;
    if (filter.dateFrom && row.date < filter.dateFrom) return false;
    if (filter.dateTo && row.date > filter.dateTo) return false;
    return true;
  });
}

function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  fs.writeFileSync(filename, csvContent);
  console.log(`📄 CSV exported to: ${filename}`);
}

function exportToJSON(data: any[], filename: string) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`📄 JSON exported to: ${filename}`);
}

async function exportData(options: ExportOptions = { format: 'csv' }) {
  try {
    console.log("📤 KTL Production Data Exporter");
    console.log("===============================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    const header = rows[0];
    const data = rows.slice(1).map(parseRow).filter(Boolean);
    
    console.log(`📊 Loaded ${data.length} records`);
    
    // Apply filters
    const filteredData = filterData(data, options.filter);
    console.log(`🔍 After filtering: ${filteredData.length} records`);
    
    if (filteredData.length === 0) {
      console.log("❌ No data matches the filter criteria");
      return;
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `ktl-production-${timestamp}`;
    
    switch (options.format) {
      case 'csv':
        exportToCSV(filteredData, `${baseFilename}.csv`);
        break;
      case 'json':
        exportToJSON(filteredData, `${baseFilename}.json`);
        break;
      case 'excel':
        console.log("📊 Excel export would require additional dependencies (xlsx package)");
        console.log("💡 Use CSV format for now, or install: npm install xlsx");
        break;
    }
    
    console.log("✅ Export complete!");
    
  } catch (error: any) {
    console.error("❌ Error exporting data:", error);
  }
}

// Command line interface
const args = process.argv.slice(2);
const format = args[0] as 'csv' | 'json' | 'excel' || 'csv';
const item = args[1];
const line = args[2];

const filter: ExportOptions['filter'] = {};
if (item) filter.item = item;
if (line) filter.line = line;

exportData({
  format,
  filter: Object.keys(filter).length > 0 ? filter : undefined
});
