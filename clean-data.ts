import dotenv from "dotenv";
import { read, write } from "./sheets";
import { polish } from "./polish";
dotenv.config();

async function cleanData() {
  try {
    console.log("🧹 KTL Production Data Cleaner");
    console.log("==============================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    console.log(`📊 Reading data from range: ${range}`);
    
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    console.log(`📊 Loaded ${rows.length} rows`);
    
    // Clean the data
    console.log("🧹 Cleaning data...");
    const cleanedData = polish(rows);
    
    console.log(`📊 After cleaning: ${cleanedData.length} rows`);
    
    // Show some statistics
    const dataRows = cleanedData.slice(1);
    const validRows = dataRows.filter(row => 
      row && row.length > 10 && row[0] && row[1] && row[2]
    );
    
    console.log(`📊 Valid production rows: ${validRows.length}`);
    
    // Count empty or problematic rows
    const emptyRows = dataRows.filter(row => 
      !row || row.length <= 10 || !row[0] || !row[1] || !row[2]
    );
    
    console.log(`📊 Empty/problematic rows: ${emptyRows.length}`);
    
    if (emptyRows.length > 0) {
      console.log("⚠️  Found empty or problematic rows that will be cleaned");
    }
    
    // Write cleaned data back to sheet
    console.log("💾 Writing cleaned data back to sheet...");
    const filteredData = cleanedData.filter(row => row !== undefined) as string[][];
    await write(range, filteredData);
    
    console.log("✅ Data cleaning completed successfully!");
    console.log("\n📈 Summary:");
    console.log(`   Original rows: ${rows.length}`);
    console.log(`   Cleaned rows: ${cleanedData.length}`);
    console.log(`   Valid data rows: ${validRows.length}`);
    console.log(`   Empty/problematic rows cleaned: ${emptyRows.length}`);
    
  } catch (error: any) {
    console.error("❌ Error cleaning data:", error);
  }
}

cleanData();
