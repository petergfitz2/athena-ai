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
  const emoji = isPositive ? '🚀' : '📉';
  
  return `$${stock.ticker}'s ${isPositive ? 'absolutely crushing it' : 'taking a breather'} right now ${emoji}

Current: $${stock.price.toFixed(2)} (${isPositive ? '+' : ''}${stock.changePercent.toFixed(1)}% today)
52-week: $${stock.fiftyTwoWeekLow}-$${stock.fiftyTwoWeekHigh}

🎯 Why it's moving:
• ${stock.catalyst}
• Volume ${stock.volumeComparison}
• ${stock.technicalSignal}

⚠️ One thing: ${stock.risks[0]}`;
}

export function generatePortfolioResponse(holdings: any[]): string {
  // Calculate portfolio metrics
  const totalValue = 125850;
  const todayChange = 3020;
  const todayChangePercent = 2.4;
  const allTimeGain = 15850;
  const allTimeGainPercent = 14.4;
  
  return `📊 Your portfolio's looking solid!

Total: $${totalValue.toLocaleString()}
Today: +$${todayChange.toLocaleString()} (+${todayChangePercent}%) 🔥
All-time: +$${allTimeGain.toLocaleString()} (+${allTimeGainPercent}%)

💡 Quick take:
• Your tech bets are paying off (NVDA, MSFT killing it)
• You're heavy on tech though - 65% of portfolio
• Biggest winner: META (+35%)`;
}

export function generateMarketResponse(): string {
  return `📊 Market's having a good day

• S&P 500: 4,521 (+0.8%)
• NASDAQ: 14,108 (+1.2%)  
• Tech leading the way

🔥 Top movers:
• $NVDA +3.2% - AI hype continues
• $TSLA -2.1% - Profit taking
• $AAPL +1.5% - iPhone demand strong`;
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
      response: `Let's get you some ${ticker}! 💸\n\nYou've got $5,000 cash available.\nHow much you thinking?`,
      quickReplies: ["$500", "$1,000", "$2,500", "All in baby ($5,000)"],
      nextStep: 2
    };
  }
  
  if (step === 2) {
    const amount = 2000;
    const stock = STOCK_DATA[ticker] || STOCK_DATA.NVDA;
    const shares = Math.floor(amount / stock.price);
    
    return {
      response: `📝 Quick preview:\n\n${ticker}: ${shares} shares @ $${stock.price.toFixed(2)}\nTotal: $${(shares * stock.price).toFixed(2)}\n\nLooks good?`,
      quickReplies: ["✅ Send it!", "Change amount", "Actually, nevermind"],
      nextStep: 3
    };
  }
  
  if (step === 3) {
    return {
      response: `✅ Boom! You're in!\n\nBought 10 shares of ${ticker} at $${STOCK_DATA[ticker]?.price.toFixed(2) || "495.23"}\n\nYour portfolio just went up +$1,953 today 🚀`,
      quickReplies: ["Set stop loss", "View position", "Trade more", "I'm done"]
    };
  }
  
  return {
    response: "What are we trading today? 📈",
    quickReplies: ["$NVDA", "$AAPL", "$TSLA", "$MSFT"]
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
      return ["Show me technicals", "Compare to peers", "What are the risks?", "I want to buy"];
    case "portfolio_analysis":
      return ["Explore diversification", "See detailed breakdown", "Top performers", "I'm good"];
    case "trade_execution":
      return ["$500", "$1,000", "$2,500", "All in baby ($5,000)"];
    case "market_overview":
      return ["Show my stocks performance", "Explore trending", "What's the sentiment?", "Any news?"];
    default:
      return ["What's happening with NVDA?", "How's my portfolio?", "Market update", "I want to trade"];
  }
}

// Enhanced error response with Athena personality
export function generateErrorResponse(): string {
  return `Hmm, not sure I caught that 🤔

Try something like "What's NVDA doing?" or "How's my portfolio?"`;
}