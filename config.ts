// KTL Production Analyzer Configuration
export const config = {
  // Google Sheets Configuration
  spreadsheetId: '1-o6z05FH5FA2iWSVs-YDtBp-uo1ghSDWdcbo0NLYS4o',
  dataRange: 'U1-1!A1:AV',
  
  // Alternative ranges for different sheets
  ranges: {
    main: 'U1-1!A1:AV',
    summary: 'Sheet1!A1:Z',
    allSheets: 'A1:AV'
  },
  
  // Export settings
  export: {
    defaultFormat: 'csv' as 'csv' | 'json' | 'excel',
    outputDir: './exports',
    includeTimestamp: true
  },
  
  // Analysis settings
  analysis: {
    minDataRows: 2,
    efficiencyThreshold: 80,
    costThreshold: 1000
  }
};

// Environment variables (fallback to config if .env not available)
export const getEnvVar = (key: string, defaultValue?: string): string => {
  return process.env[key] || defaultValue || '';
};

export const getSpreadsheetId = (): string => {
  return getEnvVar('SPREADSHEET_ID', config.spreadsheetId);
};

export const getDataRange = (): string => {
  return getEnvVar('DATA_RANGE', config.dataRange);
};
