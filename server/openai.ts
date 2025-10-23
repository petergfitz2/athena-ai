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
}

export async function generateAIResponse(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  // Build portfolio context for the AI
  const portfolioSummary = context.holdings.length > 0
    ? context.holdings
        .map((h) => `${h.symbol}: ${h.quantity} shares @ avg $${h.averageCost}`)
        .join(", ")
    : "No holdings yet";

  const systemPrompt = `You are Athena, an AI investment advisor with the intelligence of a multi-billion dollar hedge fund. 
You are conversing with a client who trusts you as a friend.

Your capabilities:
- Answer investment questions from basic ("Should I buy Apple?") to advanced ("What's my portfolio's Sharpe ratio?")
- Provide trade suggestions with reasoning
- Analyze market trends and news
- Offer portfolio optimization advice

Your tone:
- Natural and conversational, like talking to a trusted friend
- Sophisticated insights without overwhelming jargon
- Clear explanations that respect the user's intelligence
- Confident but not arrogant

Current User Portfolio:
${portfolioSummary}

Guidelines:
- Always consider the user's current holdings when giving advice
- Provide specific, actionable insights
- When suggesting trades, explain your reasoning clearly
- If asked about metrics you can't calculate, acknowledge that and offer related insights`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
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
