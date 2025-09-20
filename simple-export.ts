import dotenv from "dotenv";
import { read } from "./sheets";
import fs from 'fs';
dotenv.config();

async function exportData() {
  try {
    console.log("📤 KTL Production Data Exporter");
    console.log("===============================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    console.log(`📊 Loaded ${rows.length} records`);
    
    if (!rows[0]) {
      console.log("❌ No headers found");
      return;
    }
    
    // Export to CSV
    const timestamp = new Date().toISOString().split('T')[0];
    const csvFilename = `ktl-production-${timestamp}.csv`;
    
    const headers = rows[0];
    const csvContent = [
      headers.join(','),
      ...rows.slice(1).map(row => 
        headers.map((_, i) => `"${(row[i] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    fs.writeFileSync(csvFilename, csvContent);
    console.log(`📄 CSV exported to: ${csvFilename}`);
    
    // Export to JSON
    const jsonFilename = `ktl-production-${timestamp}.json`;
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
    
    fs.writeFileSync(jsonFilename, JSON.stringify(data, null, 2));
    console.log(`📄 JSON exported to: ${jsonFilename}`);
    
    console.log("✅ Export complete!");
    
  } catch (error: any) {
    console.error("❌ Error exporting data:", error);
  }
}

exportData();
