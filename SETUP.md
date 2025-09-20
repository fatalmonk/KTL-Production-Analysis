# KTL Production Analyzer Setup Guide

## Prerequisites
- Node.js (version 16 or higher)
- Google account with access to the KTL Production spreadsheet
- Google Cloud Console access

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Google Cloud Setup

### 2.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 2.2 Enable Google Sheets API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 2.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: `ktl-production-analyzer`
   - Description: `Service account for KTL production data analysis`
4. Click "Create and Continue"
5. Skip the role assignment for now
6. Click "Done"

### 2.4 Create and Download Credentials
1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the file and rename it to `credentials.json`
7. Place `credentials.json` in the project root directory (`/Users/mac.alvi/src/`)

### 2.5 Share Spreadsheet with Service Account
1. Open your Google Sheets document: https://docs.google.com/spreadsheets/d/1-o6z05FH5FA2iWSVs-YDtBp-uo1ghSDWdcbo0NLYS4o/edit
2. Click "Share" button
3. Add the service account email (found in credentials.json as "client_email")
4. Give it "Editor" permissions
5. Click "Send"

## Step 3: Environment Configuration

Create a `.env` file in the project root with:
```env
SPREADSHEET_ID=1-o6z05FH5FA2iWSVs-YDtBp-uo1ghSDWdcbo0NLYS4o
DATA_RANGE=U1-1!A1:AV
```

## Step 4: Test the Setup
```bash
npm run analyze
```

## Available Commands
- `npm run analyze` - Run production analysis
- `npm run insights` - Generate detailed insights
- `npm run export` - Export data to CSV/JSON
- `npm run update` - Update/clean data
- `npm start` - Run main application

## Troubleshooting

### Common Issues:
1. **"credentials.json not found"** - Make sure the file is in the project root
2. **"Permission denied"** - Ensure the service account has access to the spreadsheet
3. **"API not enabled"** - Enable Google Sheets API in Google Cloud Console
4. **"Invalid range"** - Check the DATA_RANGE in config.ts

### File Structure:
```
/Users/mac.alvi/src/
├── credentials.json          # Google Cloud credentials (you need to add this)
├── .env                      # Environment variables (you need to add this)
├── package.json              # Dependencies
├── config.ts                 # Configuration
├── sheets.ts                 # Google Sheets integration
├── production-analyzer.ts    # Main analyzer
├── production-insights.ts    # Insights generator
├── data-export.ts           # Data export
├── data-updater.ts          # Data updates
└── polish.ts                # Data cleaning
```
