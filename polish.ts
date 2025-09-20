import dayjs from "dayjs";

export function polish(rows: string[][]) {
  if (!rows.length) return rows;
  const header = rows[0];
  const out = [header];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row) {
      const r = [...row].map(c => typeof c === "string" ? c.trim() : c);
      out.push(r);
    }
  }
  return out;
}

export function analyzeProductionData(rows: string[][]) {
  if (rows.length < 2) return null;
  
  const dataRows = rows.slice(1);
  const validRows = dataRows.filter(row => row.length > 10 && row[0] && row[1] && row[2]);
  
  if (validRows.length === 0) return null;
  
  // Extract dates
  const dates = validRows.map(row => row[0]).filter(date => date && date.trim());
  const dateRange = {
    start: dates.length > 0 ? dates[0] : 'N/A',
    end: dates.length > 0 ? dates[dates.length - 1] : 'N/A'
  };
  
  // Extract unique items
  const items = [...new Set(validRows.map(row => row[2]).filter(item => item && item.trim()))];
  
  // Calculate production metrics
  const productionRates = validRows.map(row => {
    const production = parseFloat(row[16] || '0') || 0;
    const target = parseFloat(row[11] || '0') || 0;
    return { production, target };
  }).filter(rate => rate.production > 0 || rate.target > 0);
  
  const avgProduction = productionRates.length > 0 
    ? productionRates.reduce((sum, rate) => sum + rate.production, 0) / productionRates.length 
    : 0;
    
  const avgTarget = productionRates.length > 0 
    ? productionRates.reduce((sum, rate) => sum + rate.target, 0) / productionRates.length 
    : 0;
    
  const efficiency = avgTarget > 0 ? (avgProduction / avgTarget) * 100 : 0;
  
  return {
    totalRows: validRows.length,
    dateRange,
    items,
    avgProduction,
    avgTarget,
    efficiency
  };
}