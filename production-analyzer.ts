import dotenv from "dotenv";
import { read, getSheetInfo } from "./sheets";
import { analyzeProductionData } from "./polish";
dotenv.config();

async function analyzeProductionSheet() {
  try {
    console.log("🏭 KTL Production Plan Analyzer");
    console.log("================================\n");
    
    // Get sheet information
    console.log("📋 Getting sheet information...");
    const sheetInfo = await getSheetInfo();
    console.log(`   Sheet Title: ${sheetInfo.properties?.title}`);
    console.log(`   Sheets: ${sheetInfo.sheets?.map(s => s.properties?.title).join(', ')}\n`);
    
    // Read the production data
    console.log("📊 Reading production data...");
    const range = process.env.DATA_RANGE || "Sheet1!A1:AV";
    const rows = await read(range);
    console.log(`   Read ${rows.length} rows from range: ${range}\n`);
    
    if (rows.length === 0) {
      console.log("❌ No data found in sheet");
      return;
    }
    
    // Show header information
    const header = rows[0];
    console.log("📋 Column Headers:");
    if (header) {
      header.forEach((col, i) => {
        if (col && col.trim()) {
          console.log(`   ${String.fromCharCode(65 + i)}: ${col}`);
        }
      });
    }
    console.log();
    
    // Analyze the production data
    const analysis = analyzeProductionData(rows);
    if (analysis) {
      console.log("📈 Production Analysis:");
      console.log("=====================");
      console.log(`   Total Data Rows: ${analysis.totalRows}`);
      console.log(`   Date Range: ${analysis.dateRange.start} to ${analysis.dateRange.end}`);
      console.log(`   Unique Items: ${analysis.items.length}`);
      console.log(`   Items: ${analysis.items.slice(0, 5).join(', ')}${analysis.items.length > 5 ? '...' : ''}`);
      console.log(`   Average Production Rate: ${analysis.avgProduction.toFixed(2)} units/hour`);
      console.log(`   Average Target Rate: ${analysis.avgTarget.toFixed(2)} units/hour`);
      console.log(`   Overall Efficiency: ${analysis.efficiency.toFixed(2)}%`);
      console.log();
    }
    
    // Show sample data
    console.log("📋 Sample Data (first 3 production rows):");
    console.log("==========================================");
    const dataRows = rows.slice(1, 4);
    dataRows.forEach((row, i) => {
      console.log(`Row ${i + 2}:`);
      console.log(`   Date: ${row[0] || 'N/A'}`);
      console.log(`   Line: ${row[1] || 'N/A'}`);
      console.log(`   Item: ${row[2] || 'N/A'}`);
      console.log(`   Manpower: ${row[3] || 'N/A'}`);
      console.log(`   Machines: ${row[4] || 'N/A'}`);
      console.log(`   Production: ${row[16] || 'N/A'}`);
      console.log();
    });
    
    console.log("✅ Analysis complete!");
    
  } catch (error: any) {
    console.error("❌ Error analyzing production sheet:", error);
    if (error.message?.includes('credentials')) {
      console.log("\n💡 Make sure you have:");
      console.log("   1. Downloaded credentials.json from Google Cloud Console");
      console.log("   2. Placed it in the project root directory");
      console.log("   3. Enabled Google Sheets API for your project");
    }
    process.exit(1);
  }
}

analyzeProductionSheet();
