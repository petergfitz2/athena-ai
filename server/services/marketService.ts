import type { MarketQuote, MarketIndex, NewsArticle } from "@shared/schema";

// Mock market data - will be replaced with real API later
const MOCK_INDICES: MarketIndex[] = [
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

// Cache for quotes to avoid excessive API calls
const quoteCache = new Map<string, { quote: MarketQuote; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

export async function getMarketIndices(): Promise<MarketIndex[]> {
  // TODO: Replace with real API (Polygon, Alpaca, or Yahoo Finance)
  return MOCK_INDICES.map(index => ({
    ...index,
    timestamp: Date.now(),
  }));
}

export async function getQuote(symbol: string): Promise<MarketQuote | null> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.quote;
  }

  // TODO: Replace with real API call
  const mockQuote: MarketQuote = {
    symbol: symbol.toUpperCase(),
    price: 150 + Math.random() * 50,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    high: 160 + Math.random() * 40,
    low: 140 + Math.random() * 40,
    open: 145 + Math.random() * 50,
    previousClose: 148 + Math.random() * 50,
    timestamp: Date.now(),
  };

  quoteCache.set(symbol, { quote: mockQuote, timestamp: Date.now() });
  return mockQuote;
}

export async function getBatchQuotes(symbols: string[]): Promise<Map<string, MarketQuote>> {
  const quotes = new Map<string, MarketQuote>();
  
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
  // TODO: Replace with Alpha Vantage or other news API
  const mockNews: NewsArticle[] = [
    {
      id: "1",
      title: `${ticker || 'Market'} shows strong momentum amid positive earnings`,
      summary: "Analysts remain bullish on the stock's outlook for the coming quarter.",
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
      title: "Market volatility expected to continue",
      summary: "Experts warn investors to brace for continued market swings.",
      url: "https://example.com/news/2",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      imageUrl: undefined,
      tickers: ticker ? [ticker] : ["SPY", "QQQ"],
      sentimentScore: -0.25,
      sentimentLabel: "Somewhat Bearish",
    },
  ];

  return mockNews.slice(0, limit);
}
