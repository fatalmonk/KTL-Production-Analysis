# 🏭 KTL Production Analysis System

A comprehensive production data analysis and visualization system for KTL (Knit Textile Limited) manufacturing operations.

## 📊 Features

- **Real-time Data Integration** - Connects directly to Google Sheets
- **Production Analytics** - Comprehensive analysis of production metrics
- **Data Visualization** - Interactive charts and graphs
- **Data Cleaning** - Automated data quality improvement
- **Export Capabilities** - CSV, JSON, and HTML report generation
- **Performance Insights** - Efficiency tracking and optimization recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- Google Cloud account with Sheets API enabled
- Access to KTL Production Google Sheet

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ktl-production-analysis.git
cd ktl-production-analysis

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google Sheets configuration
```

### Configuration

1. **Google Cloud Setup:**
   - Create a Google Cloud project
   - Enable Google Sheets API
   - Create a service account
   - Download credentials.json
   - Share your Google Sheet with the service account

2. **Environment Variables:**
   ```env
   SPREADSHEET_ID=your_spreadsheet_id
   DATA_RANGE=U1-1!A1:AV
   ```

## 📋 Usage

### Basic Commands

```bash
# Test connection to Google Sheets
npx ts-node test-connection.ts

# Run production analysis
npm run analyze

# Generate detailed insights
npm run insights

# Clean production data
npx ts-node clean-data.ts

# Create data visualizations
npx ts-node visualize-data.ts

# Export data
npx ts-node simple-export.ts
```

### Available Scripts

- `npm run analyze` - Run production data analysis
- `npm run insights` - Generate detailed insights
- `npm run export` - Export data to CSV/JSON
- `npm run update` - Update/clean data
- `npm start` - Run main application

## 📊 Data Analysis

The system analyzes various production metrics:

- **Production Rates** - Units per hour, daily targets vs actual
- **Efficiency Metrics** - Performance against targets
- **Resource Utilization** - Manpower, machines, working hours
- **Cost Analysis** - Total costs, CM earned, P/L tracking
- **Item Performance** - Comparison across different products
- **Trend Analysis** - Historical performance patterns

## 📈 Visualizations

Generate comprehensive charts and reports:

- Production rate trends over time
- Item performance comparisons
- Resource utilization breakdowns
- Cost analysis and P/L tracking
- Efficiency trend analysis
- Interactive HTML reports

## 🗂️ Project Structure

```
ktl-production-analysis/
├── src/
│   ├── sheets.ts              # Google Sheets integration
│   ├── production-analyzer.ts # Main analysis engine
│   ├── production-insights.ts # Detailed insights
│   ├── visualize-data.ts      # Data visualization
│   ├── clean-data.ts          # Data cleaning utilities
│   ├── simple-export.ts       # Data export
│   ├── config.ts              # Configuration management
│   └── polish.ts              # Data processing utilities
├── visualizations/            # Generated charts and reports
├── exports/                   # Exported data files
├── package.json
├── README.md
└── .env.example
```

## 🔧 Configuration

### Google Sheets Integration

The system connects to Google Sheets using service account authentication:

1. **Service Account Setup:**
   - Create service account in Google Cloud Console
   - Download credentials.json
   - Share spreadsheet with service account email

2. **Spreadsheet Structure:**
   - Expected columns: Date, Line No., Item Description, etc.
   - Data range: U1-1!A1:AV (configurable)

### Data Range Configuration

Modify the data range in `config.ts` or `.env`:

```typescript
export const config = {
  spreadsheetId: 'your_spreadsheet_id',
  dataRange: 'U1-1!A1:AV', // Adjust as needed
  // ... other configurations
};
```

## 📊 Sample Output

### Production Analysis
```
🏭 KTL Production Plan Analyzer
================================
📊 Total Data Rows: 144
📅 Date Range: 6/4/25 to 12/9/25
🏭 Production Lines: U1-1, U1-2, U1-3, U2-1, U2-2, U2-3
📦 Items Produced: 10 different items
📈 Average Production Rate: 73.82 units/hour
🎯 Average Target Rate: 78.20 units/hour
⚡ Overall Efficiency: 94.39%
```

### Generated Visualizations
- Production rate over time charts
- Item performance comparisons
- Resource utilization breakdowns
- Cost analysis trends
- Efficiency tracking graphs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Changelog

### v1.0.0
- Initial release
- Google Sheets integration
- Production data analysis
- Data visualization capabilities
- Export functionality
- Data cleaning utilities

---

**Built with ❤️ for KTL Production Team**
