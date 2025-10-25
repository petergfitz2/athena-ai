// Athena AI Conversation Engine with Core Flows
// Based on mission document specifications

interface StockSnapshot {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  marketCap: string;
  momentum: number;
  technicalSignal: string;
  volumeComparison: string;
  catalyst: string;
  risks: string[];
}

interface PortfolioSummary {
  totalValue: number;
  todayChange: number;
  todayChangePercent: number;
  allTimeGain: number;
  allTimeGainPercent: number;
  allocations: { sector: string; percentage: number; holdings: string[] }[];
  strength: string;
  riskArea: string;
  benchmarkComparison: {
    portfolio: number;
    sp500: number;
    nasdaq: number;
  };
}

interface MarketOverview {
  indices: {
    sp500: { value: number; change: number };
    nasdaq: { value: number; change: number };
    dow: { value: number; change: number };
  };
  movers: { ticker: string; change: number; reason: string }[];
  sentiment: "Bullish" | "Bearish" | "Mixed";
  sentimentReason: string;
  weekCatalysts: { event: string; day: string }[];
}

// Dummy data for demonstration
const STOCK_DATA: Record<string, StockSnapshot> = {
  NVDA: {
    ticker: "NVDA",
    price: 495.23,
    change: 15.42,
    changePercent: 3.2,
    fiftyTwoWeekLow: 392,
    fiftyTwoWeekHigh: 628,
    marketCap: "1.22T",
    momentum: 9.2,
    technicalSignal: "RSI at 68 - approaching overbought",
    volumeComparison: "1.4x above average",
    catalyst: "AI datacenter demand continues to exceed expectations with Q3 revenue beating by 12%",
    risks: ["China restrictions on advanced chips", "Competition from AMD's MI300 series"]
  },
  AAPL: {
    ticker: "AAPL",
    price: 178.50,
    change: 2.65,
    changePercent: 1.5,
    fiftyTwoWeekLow: 145,
    fiftyTwoWeekHigh: 199,
    marketCap: "2.78T",
    momentum: 7.5,
    technicalSignal: "Breaking out of consolidation pattern",
    volumeComparison: "0.9x average volume",
    catalyst: "Strong iPhone 15 demand in China, Services revenue growth accelerating",
    risks: ["Consumer spending concerns", "Regulatory pressures in EU"]
  },
  TSLA: {
    ticker: "TSLA",
    price: 242.15,
    change: -5.20,
    changePercent: -2.1,
    fiftyTwoWeekLow: 152,
    fiftyTwoWeekHigh: 299,
    marketCap: "770B",
    momentum: 6.8,
    technicalSignal: "Testing 50-day moving average support",
    volumeComparison: "1.2x above average",
    catalyst: "Cybertruck production ramping, but margin concerns persist",
    risks: ["Price competition in EV market", "Macro headwinds affecting demand"]
  },
  MSFT: {
    ticker: "MSFT",
    price: 372.45,
    change: 4.12,
    changePercent: 1.1,
    fiftyTwoWeekLow: 285,
    fiftyTwoWeekHigh: 384,
    marketCap: "2.77T",
    momentum: 8.1,
    technicalSignal: "Strong uptrend intact, above all moving averages",
    volumeComparison: "1.1x above average",
    catalyst: "Azure AI services driving cloud growth, Copilot adoption accelerating",
    risks: ["Cloud competition from AWS", "Enterprise spending slowdown"]
  },
  GOOGL: {
    ticker: "GOOGL",
    price: 139.25,
    change: 1.85,
    changePercent: 1.3,
    fiftyTwoWeekLow: 102,
    fiftyTwoWeekHigh: 155,
    marketCap: "1.75T",
    momentum: 7.3,
    technicalSignal: "Building bullish flag pattern",
    volumeComparison: "0.8x average volume",
    catalyst: "Gemini AI showing promise, YouTube revenue beating expectations",
    risks: ["Regulatory scrutiny", "Search market share concerns"]
  }
};

// Athena's personality traits (from mission document)
const ATHENA_PERSONALITY = {
  core: {
    professional: true,
    friendly: true,
    smart: true,
    humble: true,
    helpful: true,
    maxResponseLength: 150 // words
  },
  communication: {
    concise: true,
    clear: true,
    structured: true,
    contextual: true,
    useEmojis: true
  },
  neverSay: [
    "I can't do that",
    "I'm just an AI",
    "I don't have access to",
    "Sorry, but"
  ],
  alwaysOffer: [
    "I can help you with X instead",
    "Here's what I can show you",
    "Let me find that information"
  ]
};

export function detectConversationIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Stock research patterns
  if (/\b(nvda|nvidia|aapl|apple|tsla|tesla|msft|microsoft|googl|google)\b/i.test(message) ||
      /what['']?s happening with|tell me about|how['']?s \w+ doing/i.test(message)) {
    return "stock_research";
  }
  
  // Portfolio analysis patterns
  if (/portfolio|how['']?[s]? (am i|my)|performance|p&l|allocation/i.test(message)) {
    return "portfolio_analysis";
  }
  
  // Trade execution patterns
  if (/\b(buy|sell|trade|purchase)\b/i.test(message)) {
    return "trade_execution";
  }
  
  // Market overview patterns
  if (/market|what['']?s moving|indices|trending|sentiment/i.test(message)) {
    return "market_overview";
  }
  
  return "general";
}

export function generateStockResponse(ticker: string): string {
  const stock = STOCK_DATA[ticker.toUpperCase()] || STOCK_DATA.NVDA;
  const isPositive = stock.change > 0;
  
  return `📊 ${stock.ticker} Quick Snapshot

Current: $${stock.price.toFixed(2)} (${isPositive ? '+' : ''}${stock.changePercent.toFixed(1)}% today)
52-week: $${stock.fiftyTwoWeekLow}-$${stock.fiftyTwoWeekHigh}
Market cap: $${stock.marketCap}

🎯 Key Signals:
• Momentum: ${stock.momentum}/10 (${getMomentumDescription(stock.momentum)})
• ${stock.technicalSignal}
• Volume ${stock.volumeComparison}

📈 Recent Catalyst:
${stock.catalyst}

⚠️ Things to Watch:
${stock.risks.map(r => `• ${r}`).join('\n')}`;
}

export function generatePortfolioResponse(holdings: any[]): string {
  // Calculate portfolio metrics
  const totalValue = 54120;
  const todayChange = 1285;
  const todayChangePercent = 2.4;
  const allTimeGain = 8120;
  const allTimeGainPercent = 17.6;
  
  return `📊 Portfolio Health Check

Total Value: $${totalValue.toLocaleString()}
Today: +$${todayChange.toLocaleString()} (+${todayChangePercent}%)
All-Time: +$${allTimeGain.toLocaleString()} (+${allTimeGainPercent}%)

🎯 Allocation Breakdown:
• Tech: 68% (AAPL, MSFT, NVDA, META)
• Auto: 13% (TSLA)
• Cash: 9% ($5,000)

⚡ Strength: Tech concentration has driven strong returns, outperforming S&P by 4.2%

⚠️ Risk Area: Heavy tech concentration (68%) exposes you to sector-specific volatility. Consider diversifying into healthcare or financials.

📈 Performance vs Benchmarks:
• You: +17.6% YTD
• S&P 500: +13.4%
• NASDAQ: +15.2%

You're beating both major indices - nice work! 🎯`;
}

export function generateMarketResponse(): string {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return `📊 Market Pulse - ${timeStr}

📈 Major Indices:
• S&P 500: 4,521 (+0.8%)
• NASDAQ: 14,168 (+1.2%)
• Dow Jones: 35,285 (-0.3%)

🔥 Today's Movers:
• NVDA: +3.2% - AI optimism continues
• TSLA: -2.1% - Profit taking after rally
• AAPL: +1.5% - iPhone 15 demand strong

⚡ Market Sentiment: Bullish
Tech leads as Fed signals pause on rate hikes. Risk-on sentiment returning to growth stocks.

📅 This Week's Catalysts:
• Fed Minutes - Wednesday
• CPI Data - Thursday
• Options Expiry - Friday`;
}

export function generateTradeResponse(message: string, step: number = 1): {
  response: string;
  quickReplies?: string[];
  nextStep?: number;
} {
  const lowerMessage = message.toLowerCase();
  
  // Extract ticker from message
  let ticker = "";
  for (const symbol of Object.keys(STOCK_DATA)) {
    if (lowerMessage.includes(symbol.toLowerCase())) {
      ticker = symbol;
      break;
    }
  }
  
  if (step === 1 && ticker) {
    return {
      response: `Got it! Let's build your ${ticker} trade.\n\nYour available cash: $5,000\n\nHow much would you like to invest?`,
      quickReplies: ["$500", "$1,000", "$2,500", "All $5,000"],
      nextStep: 2
    };
  }
  
  if (step === 2) {
    // Parse amount from message
    const amount = 2000; // Default for demo
    const stock = STOCK_DATA[ticker] || STOCK_DATA.NVDA;
    const shares = Math.floor(amount / stock.price);
    
    return {
      response: `Perfect. Here's your trade preview:

📝 Order Details:
• ${ticker}: BUY ${shares} shares @ $${stock.price.toFixed(2)}
• Total cost: $${(shares * stock.price).toFixed(2)}
• Order type: Market (executes immediately)

💼 Portfolio Impact:
• New ${ticker} position: ${((shares * stock.price / 54120) * 100).toFixed(1)}% of portfolio
• Tech allocation: 68% → 72%
• Cash after: $${(5000 - shares * stock.price).toFixed(2)}

Ready to execute?`,
      quickReplies: ["✅ Confirm Trade", "Edit Amount", "Cancel"],
      nextStep: 3
    };
  }
  
  if (step === 3) {
    return {
      response: `✅ Trade Executed!

• Bought ${10} shares of ${ticker}
• Avg price: $${STOCK_DATA[ticker]?.price.toFixed(2) || "495.23"}
• Total: $${(10 * (STOCK_DATA[ticker]?.price || 495.23)).toFixed(2)}
• Order #ATH-${Math.floor(Math.random() * 100000)}

📊 Updated Portfolio:
Value: $56,073 (+$1,953)
Today's P&L: +$3,238 (+6.1%)`,
      quickReplies: ["Set Stop Loss", "View Position", "Trade Something Else", "Done"]
    };
  }
  
  return {
    response: "I can help you place a trade. Which stock would you like to trade?",
    quickReplies: ["NVDA", "AAPL", "TSLA", "MSFT", "GOOGL"]
  };
}

function getMomentumDescription(momentum: number): string {
  if (momentum >= 9) return "extremely bullish";
  if (momentum >= 7.5) return "very strong";
  if (momentum >= 6) return "positive";
  if (momentum >= 4) return "neutral";
  if (momentum >= 2) return "weak";
  return "bearish";
}

export function generateQuickReplies(intent: string): string[] {
  switch (intent) {
    case "stock_research":
      return ["Buy this stock", "Compare to peers", "Show me other tech stocks", "View detailed analysis"];
    case "portfolio_analysis":
      return ["Show top performers", "Explore diversification", "Check risk score", "View transactions"];
    case "trade_execution":
      return ["$500", "$1,000", "$2,500", "Custom amount"];
    case "market_overview":
      return ["Show my holdings", "Explore trending stocks", "Check sector performance", "View news"];
    default:
      return ["What's happening with NVDA?", "How's my portfolio?", "Show trending stocks", "Help me build a trade"];
  }
}

// Enhanced error response with Athena personality
export function generateErrorResponse(): string {
  return `🤔 I'm not quite sure what you mean.

I can help you with:
• Stock research ("Tell me about AAPL")
• Portfolio analysis ("How am I doing?")
• Trade execution ("Buy 10 shares of NVDA")
• Market overview ("What's moving today?")

Try rephrasing, or pick one of the options above!`;
}