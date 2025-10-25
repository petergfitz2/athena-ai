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
  
  // Build portfolio context for the AI
  const portfolioSummary = context.holdings.length > 0
    ? context.holdings
        .map((h) => `${h.symbol}: ${h.quantity} shares @ avg $${h.averageCost}`)
        .join(", ")
    : "No holdings yet";

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

  // ENFORCE CONCISE RESPONSES - Critical change per user feedback
  let contextInstructions = `

CRITICAL RESPONSE RULES:
1. Keep responses to 3-5 sentences MAX for initial answers
2. Show only the most important information first  
3. Use progressive disclosure - let users ask for more if they want it
4. Talk like a smart friend, not a textbook
5. Use strategic emojis (not every message, but for emphasis)
6. Keep it conversational: "Here's the deal..." not "Here is what you need to know..."`;

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

  const systemPrompt = `${avatarContext || `You are ${avatarName}, a smart investment friend who happens to know a lot about markets.`}

USER PORTFOLIO: ${portfolioSummary}

YOUR PERSONALITY:
• Talk like a friend texting, not a professor lecturing
• Get to the point fast - 3-5 sentences MAX
• Lead with the most important thing
• Use emojis sparingly but effectively
• Say things like "Here's the deal..." or "NVDA's crushing it" not "Let me provide you with comprehensive analysis"

EXAMPLES OF GOOD RESPONSES:
"NVDA's on fire today 🚀 Up 3.2% on that AI earnings beat. Volume's crazy high too - everyone wants in."

"Your portfolio's up $3k today! Tech's carrying you hard. Maybe think about grabbing some defensive stocks though?"

"Market's looking good - S&P up 0.8%, tech leading. Perfect day to add to winners."

NEVER:
• Write paragraphs of analysis
• List 10 bullet points  
• Say "I can help you with..." just help
• Apologize or say what you can't do
• Be boring${contextInstructions}`;

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
