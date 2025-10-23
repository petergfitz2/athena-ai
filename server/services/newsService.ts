import type { NewsArticle } from "@shared/schema";
import memoize from "memoizee";

// Mock news data until Alpha Vantage API is integrated
const mockNews: NewsArticle[] = [
  {
    id: "news-1",
    title: "15 Hedge Funds Initiate Positions in NVDA",
    summary: "According to the latest 13F filings, 15 major hedge funds including Point72 Asset Management and Citadel Advisors have initiated significant positions in NVIDIA Corp (NVDA). The moves come as AI chip demand continues to surge, with NVIDIA's data center revenue expected to reach $50B in fiscal year 2024.",
    url: "https://www.sec.gov/cgi-bin/browse-edgar",
    source: "SEC 13F Filings",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    tickers: ["NVDA"],
    sentimentScore: 0.85,
    sentimentLabel: "Bullish",
  },
  {
    id: "news-2",
    title: "Apple CEO Tim Cook Purchases $2M in Company Shares",
    summary: "Apple Inc. CEO Tim Cook has purchased $2 million worth of company shares in a Form 4 filing reported today. The insider purchase signals confidence in Apple's upcoming product launches, including the highly anticipated Vision Pro headset and new iPhone lineup. Cook's purchase price averaged $178.50 per share.",
    url: "https://www.sec.gov/cgi-bin/browse-edgar",
    source: "SEC Form 4",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    tickers: ["AAPL"],
    sentimentScore: 0.72,
    sentimentLabel: "Positive",
  },
  {
    id: "news-3",
    title: "Microsoft Q4 Earnings Beat Estimates on Cloud Growth",
    summary: "Microsoft Corporation reported Q4 earnings that exceeded Wall Street expectations, with revenue of $56.2 billion (up 8% YoY) and EPS of $2.69 versus consensus of $2.55. Azure cloud revenue grew 29% year-over-year, driven by increased AI and machine learning workload adoption. The company raised full-year guidance citing strong enterprise demand.",
    url: "https://example.com/msft-earnings",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    tickers: ["MSFT"],
    sentimentScore: 0.88,
    sentimentLabel: "Very Bullish",
    imageUrl: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=800",
  },
  {
    id: "news-4",
    title: "Federal Reserve Holds Rates Steady, Signals Patient Approach",
    summary: "The Federal Open Market Committee voted unanimously to maintain the federal funds rate at 5.25%-5.50%, citing balanced risks to its dual mandate of maximum employment and price stability. Chair Jerome Powell emphasized a data-dependent approach to future policy decisions, noting that inflation has moderated but remains above the 2% target. Markets rallied on the dovish tone.",
    url: "https://example.com/fed-decision",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    tickers: ["^GSPC", "^DJI", "^IXIC"],
    sentimentScore: 0.55,
    sentimentLabel: "Neutral",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
  },
  {
    id: "news-5",
    title: "Tesla Announces Major Expansion of Supercharger Network",
    summary: "Tesla Inc. revealed plans to expand its Supercharger network by 50% over the next 12 months, adding over 10,000 new charging stalls globally. The expansion includes opening the network to non-Tesla EVs through a new adapter program, potentially generating $2B in annual revenue. The move addresses range anxiety and strengthens Tesla's competitive moat.",
    url: "https://example.com/tesla-supercharger",
    source: "TechCrunch",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    tickers: ["TSLA"],
    sentimentScore: 0.78,
    sentimentLabel: "Bullish",
  },
  {
    id: "news-6",
    title: "Amazon Web Services Launches New AI Infrastructure",
    summary: "Amazon.com Inc.'s AWS division announced a suite of new AI infrastructure services including custom Trainium2 chips and expanded SageMaker capabilities. The offerings target enterprise customers building large language models and generative AI applications. AWS expects AI services to contribute $10B+ in annual revenue by 2025.",
    url: "https://example.com/aws-ai",
    source: "CNBC",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    tickers: ["AMZN"],
    sentimentScore: 0.82,
    sentimentLabel: "Very Bullish",
  },
];

/**
 * Get all market news (with 5-minute caching)
 */
const getMarketNewsUncached = async (): Promise<NewsArticle[]> => {
  // TODO: Replace with Alpha Vantage API when API key is available
  // const response = await fetch(
  //   `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
  // );
  
  return mockNews;
};

export const getMarketNews = memoize(getMarketNewsUncached, { 
  promise: true,
  maxAge: 5 * 60 * 1000, // 5 minutes
});

/**
 * Get news for specific tickers
 */
export const getNewsForTickers = async (tickers: string[]): Promise<NewsArticle[]> => {
  const allNews = await getMarketNews();
  
  return allNews.filter(article => 
    article.tickers && article.tickers.some(ticker => 
      tickers.includes(ticker)
    )
  );
};

/**
 * Get a single news article by ID
 */
export const getNewsArticleById = async (id: string): Promise<NewsArticle | null> => {
  const allNews = await getMarketNews();
  return allNews.find(article => article.id === id) || null;
};
