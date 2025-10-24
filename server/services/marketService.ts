import type { MarketQuote, MarketIndex, NewsArticle, HistoricalData, HistoricalDataPoint } from "@shared/schema";
import * as yahooFinanceImport from 'yahoo-finance2';

// Handle different import styles for yahoo-finance2
const yahooFinance = (yahooFinanceImport as any).default || yahooFinanceImport;

// Cache for quotes to avoid excessive API calls
const quoteCache = new Map<string, { quote: MarketQuote; timestamp: number }>();
const indexCache = new Map<string, { index: MarketIndex; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

// Market indices symbols
const INDEX_SYMBOLS = {
  SP500: '^GSPC',
  NASDAQ: '^IXIC',
  DOW: '^DJI',
};

export async function getMarketIndices(): Promise<MarketIndex[]> {
  try {
    const symbols = Object.values(INDEX_SYMBOLS);
    const indices: MarketIndex[] = [];

    for (const symbol of symbols) {
      // Check cache first
      const cached = indexCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        indices.push(cached.index);
        continue;
      }

      try {
        // Try to fetch live data - will implement proper API later
        throw new Error('Using mock data temporarily');
      } catch (error) {
        // Use mock data for now
        const mockData: Record<string, MarketIndex> = {
          '^GSPC': {
            symbol: "^GSPC",
            name: "S&P 500",
            price: 5808.12 + Math.random() * 20 - 10,
            change: 45.23,
            changePercent: 0.78,
            timestamp: Date.now(),
          },
          '^IXIC': {
            symbol: "^IXIC", 
            name: "NASDAQ",
            price: 18342.45 + Math.random() * 30 - 15,
            change: -23.12,
            changePercent: -0.13,
            timestamp: Date.now(),
          },
          '^DJI': {
            symbol: "^DJI",
            name: "Dow Jones",
            price: 42932.73 + Math.random() * 50 - 25,
            change: 127.45,
            changePercent: 0.30,
            timestamp: Date.now(),
          }
        };
        
        if (mockData[symbol]) {
          const index = mockData[symbol];
          indexCache.set(symbol, { index, timestamp: Date.now() });
          indices.push(index);
        }
      }
    }

    // If we couldn't get any real data, return mock data as fallback
    if (indices.length === 0) {
      return [
        {
          symbol: "^GSPC",
          name: "S&P 500",
          price: 5808.12,
          change: 45.23,
          changePercent: 0.78,
          timestamp: Date.now(),
        },
        {
          symbol: "^IXIC",
          name: "NASDAQ",
          price: 18342.45,
          change: -23.12,
          changePercent: -0.13,
          timestamp: Date.now(),
        },
        {
          symbol: "^DJI",
          name: "Dow Jones",
          price: 42567.89,
          change: 128.45,
          changePercent: 0.30,
          timestamp: Date.now(),
        },
      ];
    }

    return indices;
  } catch (error) {
    console.error('Failed to fetch market indices:', error);
    // Return mock data as fallback
    return [
      {
        symbol: "^GSPC",
        name: "S&P 500",
        price: 5808.12,
        change: 45.23,
        changePercent: 0.78,
        timestamp: Date.now(),
      },
      {
        symbol: "^IXIC",
        name: "NASDAQ",
        price: 18342.45,
        change: -23.12,
        changePercent: -0.13,
        timestamp: Date.now(),
      },
      {
        symbol: "^DJI",
        name: "Dow Jones",
        price: 42567.89,
        change: 128.45,
        changePercent: 0.30,
        timestamp: Date.now(),
      },
    ];
  }
}

export async function getQuote(symbol: string): Promise<MarketQuote | null> {
  // Check cache first
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[CACHE HIT] Returning cached quote for ${symbol}`);
    return cached.quote;
  }

  try {
    console.log(`[Yahoo Finance] Fetching quote for ${symbol}...`);
    
    // Use mock data temporarily - will implement proper API later
    const mockQuotes: Record<string, any> = {
      'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', regularMarketPrice: 233.85 + Math.random() * 2, regularMarketChange: 1.25, regularMarketChangePercent: 0.54, regularMarketVolume: 52354200, marketCap: 3553000000000 },
      'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', regularMarketPrice: 428.32 + Math.random() * 3, regularMarketChange: -2.10, regularMarketChangePercent: -0.49, regularMarketVolume: 18765400, marketCap: 3186000000000 },
      'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', regularMarketPrice: 167.89 + Math.random() * 1.5, regularMarketChange: 0.87, regularMarketChangePercent: 0.52, regularMarketVolume: 23456700, marketCap: 2089000000000 },
      'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', regularMarketPrice: 246.38 + Math.random() * 5, regularMarketChange: 5.23, regularMarketChangePercent: 2.17, regularMarketVolume: 98765400, marketCap: 784000000000 },
      'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corp.', regularMarketPrice: 134.12 + Math.random() * 2, regularMarketChange: 3.45, regularMarketChangePercent: 2.64, regularMarketVolume: 234567800, marketCap: 3302000000000 },
      'META': { symbol: 'META', name: 'Meta Platforms', regularMarketPrice: 563.41 + Math.random() * 4, regularMarketChange: -4.32, regularMarketChangePercent: -0.76, regularMarketVolume: 12345600, marketCap: 1435000000000 },
      'AMZN': { symbol: 'AMZN', name: 'Amazon.com', regularMarketPrice: 188.65 + Math.random() * 2, regularMarketChange: 2.18, regularMarketChangePercent: 1.17, regularMarketVolume: 34567800, marketCap: 1965000000000 },
      'JPM': { symbol: 'JPM', name: 'JPMorgan Chase', regularMarketPrice: 205.37 + Math.random() * 1.5, regularMarketChange: 0.95, regularMarketChangePercent: 0.46, regularMarketVolume: 8765400, marketCap: 590000000000 },
      'SMR': { symbol: 'SMR', name: 'NuScale Power Corp.', regularMarketPrice: 24.75 + Math.random() * 0.5, regularMarketChange: 1.82, regularMarketChangePercent: 7.94, regularMarketVolume: 156234500, marketCap: 5420000000 },
      '^GSPC': { symbol: '^GSPC', name: 'S&P 500', regularMarketPrice: 5808.12 + Math.random() * 20, regularMarketChange: 45.23, regularMarketChangePercent: 0.78, regularMarketVolume: 2345678900, marketCap: 0 },
      '^IXIC': { symbol: '^IXIC', name: 'NASDAQ', regularMarketPrice: 18342.45 + Math.random() * 30, regularMarketChange: -23.12, regularMarketChangePercent: -0.13, regularMarketVolume: 3456789000, marketCap: 0 },
      '^DJI': { symbol: '^DJI', name: 'Dow Jones', regularMarketPrice: 42932.73 + Math.random() * 50, regularMarketChange: 127.45, regularMarketChangePercent: 0.30, regularMarketVolume: 456789000, marketCap: 0 },
    };
    
    let quote = mockQuotes[symbol] || mockQuotes[symbol.toUpperCase()];
    if (!quote) {
      // Generate generic mock data for unknown symbols
      const randomPrice = 50 + Math.random() * 200;
      const randomChange = (Math.random() - 0.5) * 10;
      quote = {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Corp.`,
        regularMarketPrice: randomPrice,
        regularMarketChange: randomChange,
        regularMarketChangePercent: (randomChange / randomPrice) * 100,
        regularMarketVolume: Math.floor(Math.random() * 10000000),
        marketCap: Math.floor(randomPrice * 1000000000),
        regularMarketDayHigh: randomPrice + Math.abs(randomChange),
        regularMarketDayLow: randomPrice - Math.abs(randomChange),
        regularMarketOpen: randomPrice - randomChange/2,
        regularMarketPreviousClose: randomPrice - randomChange,
      };
    }
    
    // Add high/low/open/close if not present
    if (!quote.regularMarketDayHigh) quote.regularMarketDayHigh = quote.regularMarketPrice * 1.02;
    if (!quote.regularMarketDayLow) quote.regularMarketDayLow = quote.regularMarketPrice * 0.98;
    if (!quote.regularMarketOpen) quote.regularMarketOpen = quote.regularMarketPrice - quote.regularMarketChange * 0.5;
    if (!quote.regularMarketPreviousClose) quote.regularMarketPreviousClose = quote.regularMarketPrice - quote.regularMarketChange;
    
    console.log(`[Mock Data] Using mock data for ${symbol}`);

    const marketQuote: MarketQuote = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || 0,
      high: quote.regularMarketDayHigh || quote.regularMarketPrice,
      low: quote.regularMarketDayLow || quote.regularMarketPrice,
      open: quote.regularMarketOpen || quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      timestamp: Date.now(),
    };

    quoteCache.set(symbol, { quote: marketQuote, timestamp: Date.now() });
    return marketQuote;
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    
    // Return cached data if available, even if expired
    const cached = quoteCache.get(symbol);
    if (cached) {
      return cached.quote;
    }
    
    return null;
  }
}

export async function getBatchQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
  const quotes = new Map<string, MarketQuote>();
  
  // Process in parallel for speed
  await Promise.all(
    symbols.map(async (symbol) => {
      const quote = await getQuote(symbol);
      if (quote) {
        quotes.set(symbol, quote);
      }
    })
  );

  return quotes;
}

export async function getHistoricalData(
  symbol: string, 
  period: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | '5Y' = '1M'
): Promise<HistoricalData> {
  try {
    console.log(`[Yahoo Finance] Fetching historical data for ${symbol}, period: ${period}`);
    
    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();
    let interval: '1d' | '1h' | '5m' = '1d';
    
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        interval = '5m';
        break;
      case '5D':
        startDate.setDate(endDate.getDate() - 5);
        interval = '1h';
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        interval = '1d';
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        interval = '1d';
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        interval = '1d';
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        interval = '1d';
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        interval = '1d';
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        interval = '1d';
        break;
    }

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval,
    };

    // Generate mock historical data
    const numPoints = period === '1D' ? 78 : period === '5D' ? 40 : 30;
    const basePrice = 100 + Math.random() * 200;
    const data: HistoricalDataPoint[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(startDate.getTime() + (i / numPoints) * (endDate.getTime() - startDate.getTime()));
      const volatility = 0.02;
      const trend = 0.001;
      const randomWalk = (Math.random() - 0.5) * basePrice * volatility;
      const trendComponent = i * basePrice * trend / numPoints;
      const close = basePrice + randomWalk + trendComponent;
      
      data.push({
        date: date.toISOString(),
        open: close * (1 + (Math.random() - 0.5) * 0.01),
        high: close * (1 + Math.random() * 0.02),
        low: close * (1 - Math.random() * 0.02),
        close: close,
        volume: Math.floor(Math.random() * 10000000),
      });
    }

    console.log(`[Mock Data] Generated ${data.length} historical data points for ${symbol}`);

    return {
      symbol,
      period,
      data,
    };
  } catch (error) {
    console.error(`Failed to fetch historical data for ${symbol}:`, error);
    
    // Return empty data as fallback
    return {
      symbol,
      period,
      data: [],
    };
  }
}

export async function getNews(ticker?: string, limit: number = 10): Promise<NewsArticle[]> {
  // TODO: Integrate a real news API (Alpha Vantage News API, Finnhub, or similar)
  // For now, returning mock news with realistic structure
  const mockNews: NewsArticle[] = [
    {
      id: "1",
      title: `${ticker || 'Market'} shows strong momentum amid positive earnings`,
      summary: "Analysts remain bullish on the stock's outlook for the coming quarter with increased revenue projections.",
      url: "https://example.com/news/1",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["AAPL", "MSFT", "GOOGL"],
      sentimentScore: 0.65,
      sentimentLabel: "Bullish",
    },
    {
      id: "2",
      title: "Market volatility expected to continue as Fed signals rate decisions",
      summary: "Experts warn investors to brace for continued market swings following recent economic indicators.",
      url: "https://example.com/news/2",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["SPY", "QQQ"],
      sentimentScore: -0.25,
      sentimentLabel: "Somewhat Bearish",
    },
    {
      id: "3",
      title: `${ticker || 'Tech sector'} leads market gains on strong quarterly results`,
      summary: "Technology stocks continue to outperform broader market indices with impressive growth numbers.",
      url: "https://example.com/news/3",
      source: "CNBC",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["NVDA", "AMD", "INTC"],
      sentimentScore: 0.80,
      sentimentLabel: "Very Bullish",
    },
    {
      id: "4",
      title: "Investors eye economic data releases for market direction",
      summary: "Key employment and inflation data expected to drive market sentiment in coming sessions.",
      url: "https://example.com/news/4",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["SPY", "DIA", "QQQ"],
      sentimentScore: 0.10,
      sentimentLabel: "Neutral",
    },
    {
      id: "5",
      title: `${ticker || 'Energy sector'} faces headwinds from supply concerns`,
      summary: "Oil prices fluctuate as global supply dynamics create uncertainty for energy stocks.",
      url: "https://example.com/news/5",
      source: "Wall Street Journal",
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["XOM", "CVX", "COP"],
      sentimentScore: -0.40,
      sentimentLabel: "Bearish",
    },
    {
      id: "6",
      title: "Federal Reserve maintains dovish stance in latest statement",
      summary: "Markets rally as Fed signals patient approach to monetary policy adjustments.",
      url: "https://example.com/news/6",
      source: "MarketWatch",
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      imageUrl: undefined,
      tickers: ["SPY", "TLT", "GLD"],
      sentimentScore: 0.55,
      sentimentLabel: "Bullish",
    },
  ];

  return mockNews.slice(0, limit);
}
