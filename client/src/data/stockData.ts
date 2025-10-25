export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  type: "stock" | "etf" | "crypto";
  exchange?: string;
  sector?: string;
}

// Comprehensive list of major stocks from S&P 500, NASDAQ, NYSE and other indices
export const stockDatabase: StockData[] = [
  // Technology Sector
  { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.34, changePercent: 1.33, volume: 54234567, marketCap: 2.8e12, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 378.91, change: -1.23, changePercent: -0.32, volume: 23456789, marketCap: 2.9e12, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", price: 141.80, change: 0.56, changePercent: 0.40, volume: 18765432, marketCap: 1.8e12, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", price: 142.90, change: 0.68, changePercent: 0.48, volume: 15432109, marketCap: 1.8e12, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 322.45, change: -3.21, changePercent: -0.99, volume: 21345678, marketCap: 820e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 495.32, change: 12.45, changePercent: 2.58, volume: 45678901, marketCap: 1.2e12, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", price: 138.45, change: 3.21, changePercent: 2.37, volume: 54321098, marketCap: 224e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", price: 43.67, change: -0.89, changePercent: -2.00, volume: 34567890, marketCap: 183e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", price: 212.34, change: 1.45, changePercent: 0.69, volume: 6543210, marketCap: 206e9, type: "stock", exchange: "NYSE", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", price: 105.67, change: 0.34, changePercent: 0.32, volume: 8765432, marketCap: 290e9, type: "stock", exchange: "NYSE", sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", price: 47.89, change: -0.23, changePercent: -0.48, volume: 19876543, marketCap: 195e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", price: 589.23, change: 4.56, changePercent: 0.78, volume: 2345678, marketCap: 270e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "IBM", name: "International Business Machines Corp.", price: 142.56, change: -1.23, changePercent: -0.86, volume: 4567890, marketCap: 130e9, type: "stock", exchange: "NYSE", sector: "Technology" },
  { symbol: "QCOM", name: "QUALCOMM Inc.", price: 123.45, change: 2.34, changePercent: 1.93, volume: 7890123, marketCap: 138e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "TXN", name: "Texas Instruments Inc.", price: 167.89, change: 0.89, changePercent: 0.53, volume: 5432109, marketCap: 154e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  
  // Consumer Electronics
  { symbol: "TSLA", name: "Tesla Inc.", price: 242.84, change: 5.67, changePercent: 2.39, volume: 87654321, marketCap: 770e9, type: "stock", exchange: "NASDAQ", sector: "Consumer" },
  { symbol: "SONY", name: "Sony Group Corporation", price: 89.34, change: 0.67, changePercent: 0.76, volume: 1234567, marketCap: 110e9, type: "stock", exchange: "NYSE", sector: "Consumer Electronics" },
  
  // E-Commerce & Retail
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 147.34, change: 1.89, changePercent: 1.30, volume: 34567890, marketCap: 1.5e12, type: "stock", exchange: "NASDAQ", sector: "E-Commerce" },
  { symbol: "WMT", name: "Walmart Inc.", price: 162.89, change: 1.12, changePercent: 0.69, volume: 7654321, marketCap: 440e9, type: "stock", exchange: "NYSE", sector: "Retail" },
  { symbol: "HD", name: "The Home Depot Inc.", price: 345.67, change: 2.34, changePercent: 0.68, volume: 3456789, marketCap: 350e9, type: "stock", exchange: "NYSE", sector: "Retail" },
  { symbol: "TGT", name: "Target Corporation", price: 142.34, change: -1.23, changePercent: -0.86, volume: 2345678, marketCap: 66e9, type: "stock", exchange: "NYSE", sector: "Retail" },
  { symbol: "CVS", name: "CVS Health Corporation", price: 73.45, change: 0.45, changePercent: 0.62, volume: 5678901, marketCap: 95e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "COST", name: "Costco Wholesale Corporation", price: 567.89, change: 3.45, changePercent: 0.61, volume: 1876543, marketCap: 252e9, type: "stock", exchange: "NASDAQ", sector: "Retail" },
  { symbol: "EBAY", name: "eBay Inc.", price: 43.21, change: -0.34, changePercent: -0.78, volume: 5432109, marketCap: 23e9, type: "stock", exchange: "NASDAQ", sector: "E-Commerce" },
  { symbol: "SHOP", name: "Shopify Inc.", price: 67.89, change: 1.23, changePercent: 1.85, volume: 8765432, marketCap: 86e9, type: "stock", exchange: "NYSE", sector: "E-Commerce" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", price: 213.45, change: 1.67, changePercent: 0.79, volume: 3210987, marketCap: 125e9, type: "stock", exchange: "NYSE", sector: "Retail" },
  
  // Financial Sector
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 155.67, change: 0.89, changePercent: 0.57, volume: 9876543, marketCap: 450e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "BAC", name: "Bank of America Corporation", price: 32.45, change: -0.23, changePercent: -0.70, volume: 43215678, marketCap: 260e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "WFC", name: "Wells Fargo & Company", price: 43.21, change: 0.34, changePercent: 0.79, volume: 18765432, marketCap: 160e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "GS", name: "The Goldman Sachs Group Inc.", price: 342.56, change: 2.34, changePercent: 0.69, volume: 2345678, marketCap: 115e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "MS", name: "Morgan Stanley", price: 87.65, change: -0.45, changePercent: -0.51, volume: 7654321, marketCap: 140e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "C", name: "Citigroup Inc.", price: 48.76, change: 0.23, changePercent: 0.47, volume: 14567890, marketCap: 95e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "USB", name: "U.S. Bancorp", price: 42.34, change: -0.12, changePercent: -0.28, volume: 6543210, marketCap: 65e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "PNC", name: "PNC Financial Services Group Inc.", price: 145.67, change: 1.23, changePercent: 0.85, volume: 1876543, marketCap: 60e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "BLK", name: "BlackRock Inc.", price: 678.90, change: 4.56, changePercent: 0.68, volume: 456789, marketCap: 105e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "AXP", name: "American Express Company", price: 178.90, change: 1.45, changePercent: 0.82, volume: 3210987, marketCap: 135e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", price: 245.67, change: 1.89, changePercent: 0.78, volume: 6789012, marketCap: 510e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "MA", name: "Mastercard Inc.", price: 398.76, change: 2.34, changePercent: 0.59, volume: 2345678, marketCap: 380e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", price: 58.90, change: -0.67, changePercent: -1.12, volume: 8901234, marketCap: 62e9, type: "stock", exchange: "NASDAQ", sector: "Finance" },
  { symbol: "SQ", name: "Block Inc.", price: 67.45, change: 1.23, changePercent: 1.86, volume: 7654321, marketCap: 40e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  
  // Automotive
  { symbol: "F", name: "Ford Motor Company", price: 10.84, change: -0.12, changePercent: -1.09, volume: 52341234, marketCap: 43.2e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "GM", name: "General Motors Company", price: 38.92, change: 0.45, changePercent: 1.17, volume: 12345678, marketCap: 44.8e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "TM", name: "Toyota Motor Corporation", price: 165.43, change: 0.89, changePercent: 0.54, volume: 345678, marketCap: 230e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "HMC", name: "Honda Motor Co. Ltd.", price: 32.45, change: -0.23, changePercent: -0.70, volume: 567890, marketCap: 56e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "RACE", name: "Ferrari N.V.", price: 387.65, change: 3.45, changePercent: 0.90, volume: 234567, marketCap: 72e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "NIO", name: "NIO Inc.", price: 7.89, change: 0.34, changePercent: 4.50, volume: 45678901, marketCap: 13e9, type: "stock", exchange: "NYSE", sector: "Automotive" },
  { symbol: "RIVN", name: "Rivian Automotive Inc.", price: 18.34, change: -0.67, changePercent: -3.52, volume: 23456789, marketCap: 17e9, type: "stock", exchange: "NASDAQ", sector: "Automotive" },
  { symbol: "LCID", name: "Lucid Group Inc.", price: 3.21, change: -0.12, changePercent: -3.60, volume: 34567890, marketCap: 7e9, type: "stock", exchange: "NASDAQ", sector: "Automotive" },
  
  // Entertainment & Media
  { symbol: "DIS", name: "The Walt Disney Company", price: 92.34, change: -1.45, changePercent: -1.54, volume: 11234567, marketCap: 168e9, type: "stock", exchange: "NYSE", sector: "Entertainment" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 437.89, change: 5.67, changePercent: 1.31, volume: 4567890, marketCap: 195e9, type: "stock", exchange: "NASDAQ", sector: "Entertainment" },
  { symbol: "CMCSA", name: "Comcast Corporation", price: 41.23, change: -0.34, changePercent: -0.82, volume: 15678901, marketCap: 165e9, type: "stock", exchange: "NASDAQ", sector: "Entertainment" },
  { symbol: "WBD", name: "Warner Bros. Discovery Inc.", price: 12.45, change: -0.23, changePercent: -1.81, volume: 23456789, marketCap: 30e9, type: "stock", exchange: "NASDAQ", sector: "Entertainment" },
  { symbol: "PARA", name: "Paramount Global", price: 14.67, change: -0.45, changePercent: -2.98, volume: 8765432, marketCap: 10e9, type: "stock", exchange: "NASDAQ", sector: "Entertainment" },
  { symbol: "ROKU", name: "Roku Inc.", price: 63.45, change: 2.34, changePercent: 3.83, volume: 5432109, marketCap: 9e9, type: "stock", exchange: "NASDAQ", sector: "Entertainment" },
  { symbol: "SPOT", name: "Spotify Technology S.A.", price: 168.90, change: 3.45, changePercent: 2.08, volume: 1234567, marketCap: 33e9, type: "stock", exchange: "NYSE", sector: "Entertainment" },
  
  // Healthcare & Pharmaceuticals
  { symbol: "JNJ", name: "Johnson & Johnson", price: 156.78, change: 0.45, changePercent: 0.29, volume: 6543210, marketCap: 410e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", price: 28.90, change: -0.34, changePercent: -1.16, volume: 23456789, marketCap: 163e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", price: 145.67, change: 1.23, changePercent: 0.85, volume: 5678901, marketCap: 257e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co. Inc.", price: 102.34, change: 0.67, changePercent: 0.66, volume: 8765432, marketCap: 260e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly and Company", price: 567.89, change: 8.90, changePercent: 1.59, volume: 3210987, marketCap: 540e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", price: 523.45, change: 3.45, changePercent: 0.66, volume: 2345678, marketCap: 485e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "CVX", name: "Chevron Corporation", price: 145.67, change: -1.23, changePercent: -0.84, volume: 7654321, marketCap: 280e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "BMY", name: "Bristol-Myers Squibb Company", price: 51.23, change: 0.34, changePercent: 0.67, volume: 9876543, marketCap: 110e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen Inc.", price: 267.89, change: 1.45, changePercent: 0.54, volume: 2345678, marketCap: 145e9, type: "stock", exchange: "NASDAQ", sector: "Healthcare" },
  { symbol: "GILD", name: "Gilead Sciences Inc.", price: 81.23, change: -0.56, changePercent: -0.68, volume: 6543210, marketCap: 101e9, type: "stock", exchange: "NASDAQ", sector: "Healthcare" },
  { symbol: "MDT", name: "Medtronic plc", price: 83.45, change: 0.23, changePercent: 0.28, volume: 4567890, marketCap: 111e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  
  // Food & Beverage
  { symbol: "KO", name: "The Coca-Cola Company", price: 59.87, change: 0.23, changePercent: 0.39, volume: 13456789, marketCap: 259e9, type: "stock", exchange: "NYSE", sector: "Beverages" },
  { symbol: "PEP", name: "PepsiCo Inc.", price: 172.34, change: 0.89, changePercent: 0.52, volume: 4567890, marketCap: 238e9, type: "stock", exchange: "NASDAQ", sector: "Beverages" },
  { symbol: "MCD", name: "McDonald's Corporation", price: 278.90, change: 1.23, changePercent: 0.44, volume: 2345678, marketCap: 203e9, type: "stock", exchange: "NYSE", sector: "Restaurants" },
  { symbol: "SBUX", name: "Starbucks Corporation", price: 98.76, change: -0.45, changePercent: -0.45, volume: 6789012, marketCap: 113e9, type: "stock", exchange: "NASDAQ", sector: "Restaurants" },
  { symbol: "CMG", name: "Chipotle Mexican Grill Inc.", price: 2234.56, change: 23.45, changePercent: 1.06, volume: 234567, marketCap: 62e9, type: "stock", exchange: "NYSE", sector: "Restaurants" },
  { symbol: "YUM", name: "Yum! Brands Inc.", price: 128.90, change: 0.67, changePercent: 0.52, volume: 1234567, marketCap: 37e9, type: "stock", exchange: "NYSE", sector: "Restaurants" },
  { symbol: "KHC", name: "The Kraft Heinz Company", price: 36.78, change: -0.12, changePercent: -0.33, volume: 5432109, marketCap: 45e9, type: "stock", exchange: "NASDAQ", sector: "Food" },
  { symbol: "MDLZ", name: "Mondelez International Inc.", price: 68.90, change: 0.34, changePercent: 0.50, volume: 6543210, marketCap: 95e9, type: "stock", exchange: "NASDAQ", sector: "Food" },
  
  // Aerospace & Defense
  { symbol: "BA", name: "The Boeing Company", price: 185.67, change: 2.34, changePercent: 1.28, volume: 5432109, marketCap: 113e9, type: "stock", exchange: "NYSE", sector: "Aerospace" },
  { symbol: "LMT", name: "Lockheed Martin Corporation", price: 456.78, change: 1.23, changePercent: 0.27, volume: 876543, marketCap: 116e9, type: "stock", exchange: "NYSE", sector: "Defense" },
  { symbol: "RTX", name: "RTX Corporation", price: 89.34, change: -0.45, changePercent: -0.50, volume: 3210987, marketCap: 130e9, type: "stock", exchange: "NYSE", sector: "Defense" },
  { symbol: "GD", name: "General Dynamics Corporation", price: 234.56, change: 0.89, changePercent: 0.38, volume: 765432, marketCap: 65e9, type: "stock", exchange: "NYSE", sector: "Defense" },
  { symbol: "NOC", name: "Northrop Grumman Corporation", price: 467.89, change: 2.34, changePercent: 0.50, volume: 432109, marketCap: 71e9, type: "stock", exchange: "NYSE", sector: "Defense" },
  { symbol: "SPCE", name: "Virgin Galactic Holdings Inc.", price: 3.45, change: -0.23, changePercent: -6.25, volume: 8765432, marketCap: 1.3e9, type: "stock", exchange: "NYSE", sector: "Aerospace" },
  
  // Energy Sector
  { symbol: "XOM", name: "Exxon Mobil Corporation", price: 105.67, change: -0.89, changePercent: -0.84, volume: 15678901, marketCap: 425e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", price: 116.78, change: -1.23, changePercent: -1.04, volume: 6543210, marketCap: 140e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger Limited", price: 48.90, change: -0.34, changePercent: -0.69, volume: 8765432, marketCap: 69e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "EOG", name: "EOG Resources Inc.", price: 123.45, change: -1.45, changePercent: -1.16, volume: 2345678, marketCap: 72e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "OXY", name: "Occidental Petroleum Corporation", price: 58.67, change: -0.67, changePercent: -1.13, volume: 9876543, marketCap: 53e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "PSX", name: "Phillips 66", price: 107.89, change: -0.89, changePercent: -0.82, volume: 2345678, marketCap: 46e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "VLO", name: "Valero Energy Corporation", price: 128.34, change: -1.34, changePercent: -1.03, volume: 3456789, marketCap: 48e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "MPC", name: "Marathon Petroleum Corporation", price: 147.56, change: -1.56, changePercent: -1.05, volume: 3210987, marketCap: 58e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  
  // Telecommunications
  { symbol: "T", name: "AT&T Inc.", price: 17.89, change: 0.12, changePercent: 0.68, volume: 34567890, marketCap: 128e9, type: "stock", exchange: "NYSE", sector: "Telecom" },
  { symbol: "VZ", name: "Verizon Communications Inc.", price: 38.45, change: -0.23, changePercent: -0.59, volume: 18765432, marketCap: 161e9, type: "stock", exchange: "NYSE", sector: "Telecom" },
  { symbol: "TMUS", name: "T-Mobile US Inc.", price: 143.67, change: 1.23, changePercent: 0.86, volume: 3456789, marketCap: 169e9, type: "stock", exchange: "NASDAQ", sector: "Telecom" },
  
  // Industrial
  { symbol: "CAT", name: "Caterpillar Inc.", price: 245.67, change: 1.89, changePercent: 0.78, volume: 2345678, marketCap: 130e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  { symbol: "DE", name: "Deere & Company", price: 367.89, change: 2.34, changePercent: 0.64, volume: 1234567, marketCap: 108e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  { symbol: "GE", name: "General Electric Company", price: 115.67, change: 1.45, changePercent: 1.27, volume: 5432109, marketCap: 126e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  { symbol: "HON", name: "Honeywell International Inc.", price: 198.76, change: 0.89, changePercent: 0.45, volume: 2345678, marketCap: 131e9, type: "stock", exchange: "NASDAQ", sector: "Industrial" },
  { symbol: "MMM", name: "3M Company", price: 98.76, change: -0.45, changePercent: -0.45, volume: 2345678, marketCap: 54e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  { symbol: "UPS", name: "United Parcel Service Inc.", price: 145.67, change: 0.89, changePercent: 0.62, volume: 2345678, marketCap: 126e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  { symbol: "FDX", name: "FedEx Corporation", price: 248.90, change: 1.23, changePercent: 0.50, volume: 1234567, marketCap: 63e9, type: "stock", exchange: "NYSE", sector: "Industrial" },
  
  // Real Estate
  { symbol: "AMT", name: "American Tower Corporation", price: 198.76, change: 1.23, changePercent: 0.62, volume: 1876543, marketCap: 93e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  { symbol: "PLD", name: "Prologis Inc.", price: 118.90, change: 0.67, changePercent: 0.57, volume: 2345678, marketCap: 110e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  { symbol: "CCI", name: "Crown Castle Inc.", price: 108.45, change: 0.45, changePercent: 0.42, volume: 1234567, marketCap: 47e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  { symbol: "EQIX", name: "Equinix Inc.", price: 723.45, change: 4.56, changePercent: 0.63, volume: 234567, marketCap: 68e9, type: "stock", exchange: "NASDAQ", sector: "Real Estate" },
  { symbol: "SPG", name: "Simon Property Group Inc.", price: 115.67, change: 0.89, changePercent: 0.78, volume: 1876543, marketCap: 38e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  { symbol: "PSA", name: "Public Storage", price: 287.90, change: 1.45, changePercent: 0.51, volume: 765432, marketCap: 50e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  { symbol: "O", name: "Realty Income Corporation", price: 58.76, change: 0.23, changePercent: 0.39, volume: 3210987, marketCap: 35e9, type: "stock", exchange: "NYSE", sector: "Real Estate" },
  
  // Materials & Mining
  { symbol: "LIN", name: "Linde plc", price: 412.34, change: 2.34, changePercent: 0.57, volume: 876543, marketCap: 200e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "APD", name: "Air Products and Chemicals Inc.", price: 298.76, change: 1.45, changePercent: 0.49, volume: 765432, marketCap: 66e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "SHW", name: "The Sherwin-Williams Company", price: 267.89, change: 1.89, changePercent: 0.71, volume: 876543, marketCap: 69e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "FCX", name: "Freeport-McMoRan Inc.", price: 38.45, change: -0.45, changePercent: -1.16, volume: 10987654, marketCap: 55e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "NEM", name: "Newmont Corporation", price: 41.23, change: 0.34, changePercent: 0.83, volume: 6543210, marketCap: 33e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "NUE", name: "Nucor Corporation", price: 145.67, change: -1.23, changePercent: -0.84, volume: 1876543, marketCap: 38e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  { symbol: "VALE", name: "Vale S.A.", price: 13.45, change: -0.12, changePercent: -0.88, volume: 23456789, marketCap: 65e9, type: "stock", exchange: "NYSE", sector: "Materials" },
  
  // European & International Companies
  { symbol: "ASML", name: "ASML Holding N.V.", price: 678.90, change: 8.90, changePercent: 1.33, volume: 876543, marketCap: 270e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "SAP", name: "SAP SE", price: 145.67, change: 1.23, changePercent: 0.85, volume: 543210, marketCap: 170e9, type: "stock", exchange: "NYSE", sector: "Technology" },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company", price: 98.76, change: 1.45, changePercent: 1.49, volume: 8765432, marketCap: 510e9, type: "stock", exchange: "NYSE", sector: "Technology" },
  { symbol: "BABA", name: "Alibaba Group Holding Limited", price: 84.56, change: 1.23, changePercent: 1.48, volume: 12345678, marketCap: 215e9, type: "stock", exchange: "NYSE", sector: "E-Commerce" },
  { symbol: "TCEHY", name: "Tencent Holdings Limited", price: 42.34, change: 0.56, changePercent: 1.34, volume: 2345678, marketCap: 405e9, type: "stock", exchange: "OTC", sector: "Technology" },
  { symbol: "NVS", name: "Novartis AG", price: 98.76, change: 0.34, changePercent: 0.35, volume: 1234567, marketCap: 215e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "RHHBY", name: "Roche Holding AG", price: 35.67, change: 0.12, changePercent: 0.34, volume: 765432, marketCap: 250e9, type: "stock", exchange: "OTC", sector: "Healthcare" },
  { symbol: "SNY", name: "Sanofi", price: 48.90, change: -0.23, changePercent: -0.47, volume: 876543, marketCap: 123e9, type: "stock", exchange: "NASDAQ", sector: "Healthcare" },
  { symbol: "GSK", name: "GSK plc", price: 35.67, change: 0.23, changePercent: 0.65, volume: 2345678, marketCap: 72e9, type: "stock", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "AZN", name: "AstraZeneca PLC", price: 67.89, change: 0.45, changePercent: 0.67, volume: 3456789, marketCap: 210e9, type: "stock", exchange: "NASDAQ", sector: "Healthcare" },
  { symbol: "SHEL", name: "Shell plc", price: 64.32, change: -0.56, changePercent: -0.86, volume: 4567890, marketCap: 220e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "BP", name: "BP p.l.c.", price: 35.67, change: -0.34, changePercent: -0.95, volume: 8765432, marketCap: 100e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "TTE", name: "TotalEnergies SE", price: 61.23, change: -0.45, changePercent: -0.73, volume: 2345678, marketCap: 150e9, type: "stock", exchange: "NYSE", sector: "Energy" },
  { symbol: "UL", name: "Unilever PLC", price: 48.90, change: 0.23, changePercent: 0.47, volume: 3456789, marketCap: 125e9, type: "stock", exchange: "NYSE", sector: "Consumer Goods" },
  { symbol: "NESN", name: "Nestlé S.A.", price: 108.76, change: 0.45, changePercent: 0.42, volume: 876543, marketCap: 305e9, type: "stock", exchange: "OTC", sector: "Food" },
  { symbol: "BUD", name: "Anheuser-Busch InBev SA/NV", price: 58.90, change: 0.34, changePercent: 0.58, volume: 2345678, marketCap: 115e9, type: "stock", exchange: "NYSE", sector: "Beverages" },
  { symbol: "HSBC", name: "HSBC Holdings plc", price: 38.45, change: 0.23, changePercent: 0.60, volume: 3456789, marketCap: 150e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "TD", name: "The Toronto-Dominion Bank", price: 61.23, change: -0.34, changePercent: -0.55, volume: 1876543, marketCap: 110e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "RY", name: "Royal Bank of Canada", price: 98.76, change: 0.56, changePercent: 0.57, volume: 876543, marketCap: 140e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "MUFG", name: "Mitsubishi UFJ Financial Group Inc.", price: 8.90, change: 0.12, changePercent: 1.37, volume: 3456789, marketCap: 105e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  { symbol: "SMFG", name: "Sumitomo Mitsui Financial Group Inc.", price: 10.23, change: 0.15, changePercent: 1.49, volume: 1234567, marketCap: 68e9, type: "stock", exchange: "NYSE", sector: "Finance" },
  
  // German Industrial Companies
  { symbol: "SIEGY", name: "Siemens AG", price: 78.90, change: 0.67, changePercent: 0.86, volume: 234567, marketCap: 125e9, type: "stock", exchange: "OTC", sector: "Industrial" },
  { symbol: "BASFY", name: "BASF SE", price: 48.56, change: -0.34, changePercent: -0.70, volume: 123456, marketCap: 65e9, type: "stock", exchange: "OTC", sector: "Materials" },
  { symbol: "BAYRY", name: "Bayer AG", price: 14.23, change: -0.12, changePercent: -0.84, volume: 345678, marketCap: 35e9, type: "stock", exchange: "OTC", sector: "Healthcare" },
  { symbol: "VWAGY", name: "Volkswagen AG", price: 12.34, change: 0.23, changePercent: 1.90, volume: 456789, marketCap: 85e9, type: "stock", exchange: "OTC", sector: "Automotive" },
  { symbol: "BMWYY", name: "Bayerische Motoren Werke AG", price: 32.45, change: 0.45, changePercent: 1.41, volume: 234567, marketCap: 70e9, type: "stock", exchange: "OTC", sector: "Automotive" },
  { symbol: "DMLRY", name: "Daimler AG", price: 78.90, change: 1.23, changePercent: 1.58, volume: 123456, marketCap: 85e9, type: "stock", exchange: "OTC", sector: "Automotive" },
  { symbol: "ADDYY", name: "adidas AG", price: 98.76, change: 1.45, changePercent: 1.49, volume: 87654, marketCap: 35e9, type: "stock", exchange: "OTC", sector: "Consumer Goods" },
  { symbol: "HENKY", name: "Henkel AG & Co. KGaA", price: 67.89, change: 0.34, changePercent: 0.50, volume: 54321, marketCap: 28e9, type: "stock", exchange: "OTC", sector: "Consumer Goods" },
  { symbol: "TKAMY", name: "thyssenkrupp AG", price: 6.78, change: -0.12, changePercent: -1.74, volume: 123456, marketCap: 4.2e9, type: "stock", exchange: "OTC", sector: "Industrial" },
  
  // Crypto-related Stocks
  { symbol: "COIN", name: "Coinbase Global Inc.", price: 98.76, change: 3.45, changePercent: 3.62, volume: 6543210, marketCap: 23e9, type: "stock", exchange: "NASDAQ", sector: "Crypto" },
  { symbol: "MARA", name: "Marathon Digital Holdings Inc.", price: 18.90, change: 1.23, changePercent: 6.97, volume: 12345678, marketCap: 4.5e9, type: "stock", exchange: "NASDAQ", sector: "Crypto" },
  { symbol: "RIOT", name: "Riot Platforms Inc.", price: 11.23, change: 0.89, changePercent: 8.60, volume: 9876543, marketCap: 2.8e9, type: "stock", exchange: "NASDAQ", sector: "Crypto" },
  { symbol: "MSTR", name: "MicroStrategy Incorporated", price: 456.78, change: 23.45, changePercent: 5.41, volume: 876543, marketCap: 8.9e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  
  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", price: 445.67, change: 2.34, changePercent: 0.53, volume: 65432109, marketCap: 410e9, type: "etf", exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 376.89, change: 3.45, changePercent: 0.92, volume: 34567890, marketCap: 180e9, type: "etf", exchange: "NASDAQ" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", price: 189.34, change: 1.23, changePercent: 0.65, volume: 23456789, marketCap: 58e9, type: "etf", exchange: "NYSE" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", price: 345.67, change: 1.89, changePercent: 0.55, volume: 3456789, marketCap: 28e9, type: "etf", exchange: "NYSE" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", price: 223.45, change: 1.45, changePercent: 0.65, volume: 3210987, marketCap: 290e9, type: "etf", exchange: "NYSE" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", price: 410.23, change: 2.12, changePercent: 0.52, volume: 2345678, marketCap: 280e9, type: "etf", exchange: "NYSE" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", price: 39.87, change: 0.34, changePercent: 0.86, volume: 34567890, marketCap: 65e9, type: "etf", exchange: "NYSE" },
  { symbol: "XLF", name: "Financial Select Sector SPDR Fund", price: 37.89, change: 0.23, changePercent: 0.61, volume: 45678901, marketCap: 35e9, type: "etf", exchange: "NYSE" },
  { symbol: "XLK", name: "Technology Select Sector SPDR Fund", price: 176.54, change: 2.34, changePercent: 1.34, volume: 7654321, marketCap: 48e9, type: "etf", exchange: "NYSE" },
  { symbol: "GLD", name: "SPDR Gold Shares", price: 183.45, change: -0.67, changePercent: -0.36, volume: 6543210, marketCap: 56e9, type: "etf", exchange: "NYSE" },
  { symbol: "VNQ", name: "Vanguard Real Estate ETF", price: 87.65, change: 0.45, changePercent: 0.52, volume: 4567890, marketCap: 35e9, type: "etf", exchange: "NYSE" },
  { symbol: "ARKK", name: "ARK Innovation ETF", price: 45.67, change: 1.23, changePercent: 2.77, volume: 8765432, marketCap: 6.8e9, type: "etf", exchange: "NYSE" },
  
  // Additional Gaming & Entertainment
  { symbol: "EA", name: "Electronic Arts Inc.", price: 134.56, change: 1.23, changePercent: 0.92, volume: 1876543, marketCap: 37e9, type: "stock", exchange: "NASDAQ", sector: "Gaming" },
  { symbol: "TTWO", name: "Take-Two Interactive Software Inc.", price: 145.67, change: 2.34, changePercent: 1.63, volume: 876543, marketCap: 24e9, type: "stock", exchange: "NASDAQ", sector: "Gaming" },
  { symbol: "ATVI", name: "Activision Blizzard Inc.", price: 94.23, change: 0.12, changePercent: 0.13, volume: 5432109, marketCap: 74e9, type: "stock", exchange: "NASDAQ", sector: "Gaming" },
  { symbol: "RBLX", name: "Roblox Corporation", price: 38.90, change: 1.45, changePercent: 3.87, volume: 12345678, marketCap: 23e9, type: "stock", exchange: "NYSE", sector: "Gaming" },
  { symbol: "U", name: "Unity Software Inc.", price: 28.34, change: 0.89, changePercent: 3.24, volume: 6543210, marketCap: 11e9, type: "stock", exchange: "NYSE", sector: "Gaming" },
  
  // Airlines
  { symbol: "AAL", name: "American Airlines Group Inc.", price: 13.45, change: -0.23, changePercent: -1.68, volume: 23456789, marketCap: 8.8e9, type: "stock", exchange: "NASDAQ", sector: "Airlines" },
  { symbol: "DAL", name: "Delta Air Lines Inc.", price: 41.23, change: 0.34, changePercent: 0.83, volume: 8765432, marketCap: 26e9, type: "stock", exchange: "NYSE", sector: "Airlines" },
  { symbol: "UAL", name: "United Airlines Holdings Inc.", price: 48.56, change: 0.67, changePercent: 1.40, volume: 5432109, marketCap: 16e9, type: "stock", exchange: "NASDAQ", sector: "Airlines" },
  { symbol: "LUV", name: "Southwest Airlines Co.", price: 28.90, change: -0.45, changePercent: -1.53, volume: 6543210, marketCap: 17e9, type: "stock", exchange: "NYSE", sector: "Airlines" },
  { symbol: "ALK", name: "Alaska Air Group Inc.", price: 42.34, change: 0.23, changePercent: 0.55, volume: 1234567, marketCap: 5.4e9, type: "stock", exchange: "NYSE", sector: "Airlines" },
  { symbol: "JBLU", name: "JetBlue Airways Corporation", price: 6.78, change: -0.12, changePercent: -1.74, volume: 7654321, marketCap: 2.2e9, type: "stock", exchange: "NASDAQ", sector: "Airlines" },
  
  // Semiconductors & Chips
  { symbol: "MU", name: "Micron Technology Inc.", price: 71.23, change: 2.34, changePercent: 3.40, volume: 12345678, marketCap: 79e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom Inc.", price: 867.90, change: 12.34, changePercent: 1.44, volume: 2345678, marketCap: 360e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "LRCX", name: "Lam Research Corporation", price: 678.90, change: 8.90, changePercent: 1.33, volume: 876543, marketCap: 92e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "KLAC", name: "KLA Corporation", price: 489.23, change: 5.67, changePercent: 1.17, volume: 765432, marketCap: 70e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "AMAT", name: "Applied Materials Inc.", price: 142.34, change: 2.34, changePercent: 1.67, volume: 5432109, marketCap: 120e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "ADI", name: "Analog Devices Inc.", price: 189.76, change: 1.45, changePercent: 0.77, volume: 2345678, marketCap: 94e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MRVL", name: "Marvell Technology Inc.", price: 58.90, change: 1.23, changePercent: 2.13, volume: 8765432, marketCap: 50e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "SNPS", name: "Synopsys Inc.", price: 456.78, change: 3.45, changePercent: 0.76, volume: 543210, marketCap: 70e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "CDNS", name: "Cadence Design Systems Inc.", price: 245.67, change: 2.34, changePercent: 0.96, volume: 876543, marketCap: 68e9, type: "stock", exchange: "NASDAQ", sector: "Technology" },
  
  // Biotech
  { symbol: "BIIB", name: "Biogen Inc.", price: 267.89, change: 3.45, changePercent: 1.30, volume: 876543, marketCap: 39e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals Inc.", price: 389.23, change: 4.56, changePercent: 1.19, volume: 654321, marketCap: 100e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc.", price: 745.67, change: 6.78, changePercent: 0.92, volume: 234567, marketCap: 80e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
  { symbol: "ILMN", name: "Illumina Inc.", price: 198.76, change: 2.34, changePercent: 1.19, volume: 876543, marketCap: 31e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
  { symbol: "MRNA", name: "Moderna Inc.", price: 98.76, change: -1.23, changePercent: -1.23, volume: 5432109, marketCap: 38e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
  { symbol: "BNTX", name: "BioNTech SE", price: 105.67, change: -0.89, changePercent: -0.84, volume: 876543, marketCap: 25e9, type: "stock", exchange: "NASDAQ", sector: "Biotech" },
];