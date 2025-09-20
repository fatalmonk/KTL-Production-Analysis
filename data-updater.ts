import dotenv from "dotenv";
import { read, write } from "./sheets";
import { polish } from "./polish";
dotenv.config();

interface UpdateOptions {
  operation: 'add' | 'update' | 'delete' | 'bulk-update';
  data?: any;
  rowIndex?: number;
  filters?: {
    item?: string;
    line?: string;
    date?: string;
  };
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

function calculateDerivedFields(row: any) {
  // Calculate derived fields based on input data
  const totalWorkingHours = row.workingHours + row.ot;
  const productionPH = row.totalProduced / Math.max(totalWorkingHours, 1);
  const efficiency = (productionPH / Math.max(row.targetProductionPH, 1)) * 100;
  
  return {
    ...row,
    totalWorkingHours,
    productionPH: parseFloat(productionPH.toFixed(2)),
    efficiency: parseFloat(efficiency.toFixed(2))
  };
}

async function updateData(options: UpdateOptions) {
  try {
    console.log("🔄 KTL Production Data Updater");
    console.log("==============================\n");
    
    const range = process.env.DATA_RANGE || "U1-1!A1:AV";
    const rows = await read(range);
    
    if (rows.length < 2) {
      console.log("❌ No data found");
      return;
    }
    
    const header = rows[0];
    const data = rows.slice(1).filter(row => row !== undefined);
    
    console.log(`📊 Loaded ${data.length} records`);
    
    switch (options.operation) {
      case 'add':
        if (options.data) {
          const newRow = calculateDerivedFields(options.data);
          const newRowArray = [
            newRow.date,
            newRow.line,
            newRow.item,
            newRow.manpower.toString(),
            newRow.machines.toString(),
            newRow.workingHours.toString(),
            newRow.ot.toString(),
            newRow.totalWorkingHours.toString(),
            newRow.smv.toString(),
            newRow.smvTarget.toString(),
            newRow.orderQuantity.toString(),
            newRow.targetProductionPH.toString(),
            newRow.targetProductionPD.toString(),
            newRow.targetProduction.toString(),
            newRow.dayProduction.toString(),
            newRow.totalProduced.toString(),
            newRow.productionPH.toString(),
            newRow.otCost.toString(),
            newRow.lineCost.toString(),
            newRow.totalCost.toString(),
            newRow.totalCMEarned.toString(),
            newRow.pl.toString(),
            newRow.cpd.toString(),
            newRow.targetCPD.toString(),
            newRow.dailyTargetCPD.toString(),
            newRow.dailyCPD.toString(),
            newRow.cmd.toString(),
            newRow.target.toString(),
            newRow.dailyLineCost.toString(),
            newRow.dailyCMEarning.toString(),
            newRow.monthlyLineCost.toString(),
            newRow.monthlyCMEarning.toString(),
            newRow.monthlyPL.toString(),
            newRow.monthlyProduction.toString(),
            newRow.totalWorkingHours2.toString(),
            newRow.avgProductionPH.toString(),
            newRow.totalHistoricalWorkingHours.toString(),
            newRow.totalHistoricalProduction.toString(),
            newRow.avgHistoricalProductionPH.toString()
          ];
          
          data.push(newRowArray);
          await write(range, [header, ...data.filter(row => row !== undefined)]);
          console.log("✅ New record added successfully");
        }
        break;
        
      case 'update':
        if (options.rowIndex && options.data) {
          const rowIndex = options.rowIndex + 1; // +1 for header
          if (rowIndex < data.length) {
            const updatedRow = calculateDerivedFields(options.data);
            const updatedRowArray = [
              updatedRow.date,
              updatedRow.line,
              updatedRow.item,
              updatedRow.manpower.toString(),
              updatedRow.machines.toString(),
              updatedRow.workingHours.toString(),
              updatedRow.ot.toString(),
              updatedRow.totalWorkingHours.toString(),
              updatedRow.smv.toString(),
              updatedRow.smvTarget.toString(),
              updatedRow.orderQuantity.toString(),
              updatedRow.targetProductionPH.toString(),
              updatedRow.targetProductionPD.toString(),
              updatedRow.targetProduction.toString(),
              updatedRow.dayProduction.toString(),
              updatedRow.totalProduced.toString(),
              updatedRow.productionPH.toString(),
              updatedRow.otCost.toString(),
              updatedRow.lineCost.toString(),
              updatedRow.totalCost.toString(),
              updatedRow.totalCMEarned.toString(),
              updatedRow.pl.toString(),
              updatedRow.cpd.toString(),
              updatedRow.targetCPD.toString(),
              updatedRow.dailyTargetCPD.toString(),
              updatedRow.dailyCPD.toString(),
              updatedRow.cmd.toString(),
              updatedRow.target.toString(),
              updatedRow.dailyLineCost.toString(),
              updatedRow.dailyCMEarning.toString(),
              updatedRow.monthlyLineCost.toString(),
              updatedRow.monthlyCMEarning.toString(),
              updatedRow.monthlyPL.toString(),
              updatedRow.monthlyProduction.toString(),
              updatedRow.totalWorkingHours2.toString(),
              updatedRow.avgProductionPH.toString(),
              updatedRow.totalHistoricalWorkingHours.toString(),
              updatedRow.totalHistoricalProduction.toString(),
              updatedRow.avgHistoricalProductionPH.toString()
            ];
            
            data[rowIndex - 1] = updatedRowArray;
            await write(range, [header, ...data.filter(row => row !== undefined)]);
            console.log(`✅ Record at index ${options.rowIndex} updated successfully`);
          } else {
            console.log("❌ Invalid row index");
          }
        }
        break;
        
      case 'delete':
        if (options.rowIndex !== undefined) {
          const rowIndex = options.rowIndex + 1; // +1 for header
          if (rowIndex < data.length) {
            data.splice(rowIndex - 1, 1);
            await write(range, [header, ...data.filter(row => row !== undefined)]);
            console.log(`✅ Record at index ${options.rowIndex} deleted successfully`);
          } else {
            console.log("❌ Invalid row index");
          }
        }
        break;
        
      case 'bulk-update':
        console.log("🔄 Performing bulk update...");
        // Clean and recalculate all data
        const cleanedData = polish([header, ...data.filter(row => row !== undefined)]);
        await write(range, cleanedData);
        console.log("✅ Bulk update completed - all data cleaned and recalculated");
        break;
    }
    
  } catch (error: any) {
    console.error("❌ Error updating data:", error);
  }
}

// Command line interface
const args = process.argv.slice(2);
const operation = args[0] as 'add' | 'update' | 'delete' | 'bulk-update' || 'bulk-update';

updateData({ operation });
