import dotenv from "dotenv";
import { getSheetInfo, read } from "./sheets";
import { getSpreadsheetId, getDataRange } from "./config";

dotenv.config();

async function testConnection() {
  try {
    console.log("🔍 Testing KTL Production Analyzer Connection");
    console.log("============================================\n");
    
    console.log("📋 Configuration:");
    console.log(`   Spreadsheet ID: ${getSpreadsheetId()}`);
    console.log(`   Data Range: ${getDataRange()}`);
    console.log();
    
    // Test 1: Get sheet information
    console.log("📊 Testing sheet access...");
    const sheetInfo = await getSheetInfo();
    console.log(`   ✅ Sheet Title: ${sheetInfo.properties?.title}`);
    console.log(`   ✅ Available Sheets: ${sheetInfo.sheets?.map(s => s.properties?.title).join(', ')}`);
    console.log();
    
    // Test 2: Read data
    console.log("📖 Testing data reading...");
    const data = await read();
    console.log(`   ✅ Successfully read ${data.length} rows`);
    
    if (data.length > 0) {
      console.log(`   ✅ First row (headers): ${data[0]?.slice(0, 5).join(' | ')}`);
      console.log(`   ✅ Sample data row: ${data[1]?.slice(0, 5).join(' | ')}`);
    }
    
    console.log("\n🎉 Connection test successful!");
    console.log("✅ You can now run the production analysis tools.");
    
  } catch (error: any) {
    console.error("❌ Connection test failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Make sure you have credentials.json in the project root");
    console.log("2. Ensure the service account has access to the spreadsheet");
    console.log("3. Check that Google Sheets API is enabled");
    console.log("4. Verify the spreadsheet ID is correct");
    console.log("\n📖 See SETUP.md for detailed instructions");
  }
}

testConnection();
