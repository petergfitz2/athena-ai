import OpenAI from "openai";
import { storage } from "./storage";
import type { Holding } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ConversationContext {
  userId: string;
  holdings: Holding[];
  recentTrades?: any[];
  contextMode?: string | null;
}

import * as athena from "./athenaConversations";

export async function generateAIResponse(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  // First, check if this matches one of Athena's core conversation flows
  const intent = athena.detectConversationIntent(userMessage);
  
  // Handle specific conversation flows with Athena's optimized responses
  if (intent === "stock_research") {
    // Extract ticker from message
    const tickers = ["NVDA", "AAPL", "TSLA", "MSFT", "GOOGL"];
    let ticker = "";
    for (const symbol of tickers) {
      if (userMessage.toUpperCase().includes(symbol)) {
        ticker = symbol;
        break;
      }
    }
    if (ticker) {
      return athena.generateStockResponse(ticker);
    }
  }
  
  if (intent === "portfolio_analysis") {
    return athena.generatePortfolioResponse(context.holdings);
  }
  
  if (intent === "market_overview") {
    return athena.generateMarketResponse();
  }
  
  if (intent === "trade_execution") {
    const tradeResponse = athena.generateTradeResponse(userMessage, 1);
    return tradeResponse.response;
  }
  
  // For general queries, fall back to OpenAI with Athena's personality
  // Fetch user's active avatar
  const activeAvatar = await storage.getActiveAvatar(context.userId);
  
  // Build enhanced portfolio context for the AI
  let portfolioSummary = "No holdings yet";
  let portfolioMetrics = "";
  
  if (context.holdings.length > 0) {
    // Calculate total value and P&L
    let totalValue = 0;
    let totalCost = 0;
    let topPerformer = { symbol: "", gain: -Infinity };
    let worstPerformer = { symbol: "", gain: Infinity };
    
    for (const holding of context.holdings) {
      const quantity = parseFloat(holding.quantity);
      const avgCost = parseFloat(holding.averageCost);
      // Use average cost as current price if not available (for demo)
      const currentPrice = avgCost * (1 + (Math.random() * 0.2 - 0.1)); // Simulate +/- 10% variation
      
      const currentValue = quantity * currentPrice;
      const cost = quantity * avgCost;
      const gainPercent = ((currentValue - cost) / cost) * 100;
      
      totalValue += currentValue;
      totalCost += cost;
      
      if (gainPercent > topPerformer.gain) {
        topPerformer = { symbol: holding.symbol, gain: gainPercent };
      }
      if (gainPercent < worstPerformer.gain) {
        worstPerformer = { symbol: holding.symbol, gain: gainPercent };
      }
    }
    
    const totalGain = totalValue - totalCost;
    const totalGainPercent = ((totalGain / totalCost) * 100).toFixed(1);
    
    // Build holdings summary
    portfolioSummary = context.holdings
      .slice(0, 5) // Top 5 holdings for brevity
      .map((h) => {
        const quantity = parseFloat(h.quantity);
        const avgCost = parseFloat(h.averageCost);
        const currentPrice = avgCost * (1 + (Math.random() * 0.2 - 0.1));
        const currentValue = quantity * currentPrice;
        const gain = ((currentValue - quantity * avgCost) / (quantity * avgCost) * 100).toFixed(1);
        const gainNum = parseFloat(gain);
        return `${h.symbol}: ${quantity} shares (${gainNum > 0 ? '+' : ''}${gain}%)`;
      })
      .join(", ");
    
    if (context.holdings.length > 5) {
      portfolioSummary += ` +${context.holdings.length - 5} more`;
    }
    
    // Build metrics summary
    portfolioMetrics = `
PORTFOLIO METRICS:
• Total Value: $${totalValue.toLocaleString()}
• Total P&L: ${totalGain >= 0 ? '+' : ''}$${totalGain.toLocaleString()} (${totalGain >= 0 ? '+' : ''}${totalGainPercent}%)
• Holdings: ${context.holdings.length} positions
• Top Performer: ${topPerformer.symbol} ${topPerformer.gain > 0 ? '+' : ''}${topPerformer.gain.toFixed(1)}%
• Worst Performer: ${worstPerformer.symbol} ${worstPerformer.gain > 0 ? '+' : ''}${worstPerformer.gain.toFixed(1)}%`;
  }

  // Build avatar personality context
  let avatarContext = "";
  let avatarName = "Athena";
  let temperature = 0.7; // Default temperature
  
  if (activeAvatar) {
    avatarName = activeAvatar.name;
    const profile = activeAvatar.personalityProfile as any;
    
    // Use the detailed personality prompt if available
    if (profile.personalityPrompt) {
      avatarContext = profile.personalityPrompt;
    } else {
      avatarContext = `
You are ${avatarName}, an investment advisor with the following characteristics:
- Personality traits: ${profile.traits?.join(', ') || 'professional, knowledgeable'}
- Trading style: ${profile.tradingStyle || 'balanced'}
- Communication tone: ${profile.tone || 'professional'}
${profile.backstory ? `- Background: ${profile.backstory}` : ''}

Embody these characteristics in your responses while maintaining professionalism and accuracy.
`;
    }
    
    // Add specific personality elements if available
    if (profile.greeting && userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      avatarContext += `\n\nYour typical greeting: "${profile.greeting}"`;
    }
    if (profile.jokeStyle) {
      avatarContext += `\n\nYour humor style: ${profile.jokeStyle}`;
    }
    if (profile.researchStyle) {
      avatarContext += `\n\nWhen analyzing companies: ${profile.researchStyle}`;
    }
    if (profile.encouragement) {
      avatarContext += `\n\nWhen celebrating wins: ${profile.encouragement}`;
    }
    if (profile.catchphrase) {
      avatarContext += `\n\nYour signature catchphrase: "${profile.catchphrase}"`;
    }
    
    // Adjust temperature based on trading style
    if (profile.tradingStyle === 'aggressive') {
      temperature = 0.8;
    } else if (profile.tradingStyle === 'conservative') {
      temperature = 0.5;
    } else if (profile.tradingStyle === 'analytical') {
      temperature = 0.6;
    }
  }

  // ENFORCE LEGAL COMPLIANCE AND CONCISE RESPONSES
  let contextInstructions = `

CRITICAL LEGAL COMPLIANCE RULES - MUST FOLLOW:

FORBIDDEN LANGUAGE (NEVER USE):
❌ "Crushing it" / "Killing it" / "On fire"
❌ "You should buy/sell" / "Great opportunity" 
❌ "Strong buy" / "Can't miss" / "Guaranteed"
❌ "Going to the moon" / "Will explode"
❌ Any predictions about future price

REQUIRED APPROACH:
✅ Present data and facts, not opinions
✅ Use "showing momentum" not "crushing it"
✅ Use "worth researching" not "great opportunity"
✅ Use "high volume" not "everyone's buying"
✅ Show risks alongside opportunities
✅ Use "if you're interested, here's the data" not "you should buy"

RESPONSE STRUCTURE:
1. Keep responses to 3-5 sentences MAX
2. Lead with facts and metrics
3. Provide context without hype
4. Never give buy/sell recommendations
5. Always stay neutral and informative`;

  let maxTokens = 200; // Reduced to enforce conciseness

  if (context.contextMode === "athena") {
    // Ultra-concise mode
    contextInstructions += `\n\nMODE: Quick chat mode. Keep it to 2-3 sentences MAX. Be super casual and friendly.`;
    temperature = 0.7;
    maxTokens = 150;
  } else if (context.contextMode === "terminal") {
    // Still concise but allows a bit more detail
    contextInstructions += `\n\nMODE: Terminal mode. You can go up to 5-6 sentences if needed for technical detail. Still keep it conversational.`;
    temperature = 0.5;
    maxTokens = 250;
  } else if (context.contextMode === "hybrid") {
    // Balanced but still concise
    contextInstructions += `\n\nMODE: Hybrid mode. 3-5 sentences with key metrics. Balance brevity with insight.`;
    temperature = 0.6;
    maxTokens = 200;
  }

  const systemPrompt = `${avatarContext || `You are ${avatarName}, an investment information assistant providing market data and analysis.`}

USER PORTFOLIO: ${portfolioSummary}
${portfolioMetrics}

YOUR APPROACH:
• Keep responses to 3-5 sentences MAX
• Lead with facts and data
• Be conversational but professional
• Focus on information, not recommendations

EXAMPLES OF COMPLIANT RESPONSES:
"NVDA is up 3.2% following earnings. Volume is 1.4x average. The AI sector continues showing momentum."

"Your portfolio value: $125k, up $3k today. Tech allocation at 65% vs typical 20-30%. Top performer: META (+35%)."

"S&P 500 up 0.8%, NASDAQ up 1.2%. Tech sector leading gains. Notable movers: NVDA +3.2%, TSLA -2.1%."

WHEN USER ASKS "SHOULD I BUY?":
"I provide data to inform your decisions. Here's what to consider: current price vs 52-week range, recent momentum, volume patterns, and risk factors."

NEVER:
• Give buy/sell recommendations
• Use hype language ("crushing it", "on fire", "moon")
• Predict future prices
• Say what someone "should" do
• Use promotional language${contextInstructions}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || "I apologize, I'm having trouble responding right now.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

interface TradeSuggestion {
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  reasoning: string;
  confidence: number;
}

export async function generateTradeSuggestions(
  userId: string,
  holdings: Holding[]
): Promise<TradeSuggestion[]> {
  const portfolioSummary = holdings.length > 0
    ? holdings
        .map((h) => `${h.symbol}: ${h.quantity} shares @ avg $${h.averageCost}`)
        .join(", ")
    : "No holdings yet";

  const prompt = `Based on current market conditions and this portfolio: ${portfolioSummary}

Generate 1-2 trade suggestions. For each suggestion, provide:
1. Symbol (stock ticker)
2. Action (BUY or SELL)
3. Quantity (number of shares)
4. Estimated price per share
5. Clear reasoning (2-3 sentences)
6. Confidence level (0-100)

Focus on opportunities that would improve portfolio diversification or capitalize on current market trends.

Respond in JSON format:
{
  "suggestions": [
    {
      "symbol": "AAPL",
      "action": "BUY",
      "quantity": 10,
      "price": 178.50,
      "reasoning": "Apple shows strong momentum...",
      "confidence": 85
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.suggestions || [];
  } catch (error) {
    console.error("Failed to generate trade suggestions:", error);
    return [];
  }
}
