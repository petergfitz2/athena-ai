import type { MarketQuote, MarketIndex, NewsArticle } from "@shared/schema";
import yahooFinance from 'yahoo-finance2';

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
        const quote = await yahooFinance.quote(symbol);
        
        const index: MarketIndex = {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          timestamp: Date.now(),
        };

        indexCache.set(symbol, { index, timestamp: Date.now() });
        indices.push(index);
      } catch (error) {
        console.error(`Failed to fetch index ${symbol}:`, error);
        // Return cached data if available, even if expired
        const cached = indexCache.get(symbol);
        if (cached) {
          indices.push(cached.index);
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
    const quote = await yahooFinance.quote(symbol);
    console.log(`[Yahoo Finance] Received data for ${symbol}:`, {
      symbol: quote?.symbol,
      price: quote?.regularMarketPrice,
      hasData: !!quote
    });
    
    if (!quote || !quote.regularMarketPrice) {
      console.warn(`[Yahoo Finance] No valid quote data for ${symbol}`);
      return null;
    }

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
