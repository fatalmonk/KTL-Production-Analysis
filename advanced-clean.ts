import dotenv from "dotenv";
import { read, write } from "./sheets";
import { polish } from "./polish";
dotenv.config();

async function advancedClean() {
  try {
    console.log("🧹 KTL Advanced Data Cleaner");
    console.log("============================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    console.log(`📊 Reading data from range: ${range}`);
    
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    console.log(`📊 Loaded ${rows.length} rows`);
    
    // Clean the data first
    const cleanedData = polish(rows);
    
    // Filter out empty or problematic rows
    const header = cleanedData[0];
    const dataRows = cleanedData.slice(1);
    
    console.log("🔍 Analyzing data quality...");
    
    // Keep only valid production rows
    const validRows = dataRows.filter(row => {
      if (!row || row.length < 10) return false;
      
      // Must have date, line, and item
      const hasDate = row[0] && row[0].trim() !== '';
      const hasLine = row[1] && row[1].trim() !== '';
      const hasItem = row[2] && row[2].trim() !== '';
      
      return hasDate && hasLine && hasItem;
    });
    
    const emptyRows = dataRows.length - validRows.length;
    
    console.log(`📊 Valid production rows: ${validRows.length}`);
    console.log(`📊 Empty/problematic rows to remove: ${emptyRows}`);
    
    if (emptyRows > 0) {
      console.log("🧹 Removing empty and problematic rows...");
      
      // Create cleaned dataset
      const finalData = [header, ...validRows];
      
      console.log(`📊 Final dataset: ${finalData.length} rows`);
      
      // Write cleaned data back to sheet
      console.log("💾 Writing cleaned data back to sheet...");
      const filteredFinalData = finalData.filter(row => row !== undefined) as string[][];
      await write(range, filteredFinalData);
      
      console.log("✅ Advanced data cleaning completed successfully!");
      console.log("\n📈 Summary:");
      console.log(`   Original rows: ${rows.length}`);
      console.log(`   After basic cleaning: ${cleanedData.length}`);
      console.log(`   Valid production rows: ${validRows.length}`);
      console.log(`   Removed empty/problematic rows: ${emptyRows}`);
      console.log(`   Final dataset: ${finalData.length} rows`);
      
      // Show some sample cleaned data
      console.log("\n📋 Sample of cleaned data:");
      console.log("==========================");
      validRows.slice(0, 3).forEach((row, i) => {
        if (row) {
          console.log(`Row ${i + 2}: ${row[0]} | ${row[1]} | ${row[2]} | ${row[16] || 'N/A'} units/hour`);
        }
      });
      
    } else {
      console.log("✅ Data is already clean - no empty rows found!");
    }
    
  } catch (error: any) {
    console.error("❌ Error cleaning data:", error);
  }
}

advancedClean();
