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

  // Adapt system prompt based on detected context mode
  let contextInstructions = "";
  let temperature = 0.7;
  let maxTokens = 500;

  if (context.contextMode === "amanda") {
    // User wants quick, conversational responses
    contextInstructions = `\n\nCONTEXT: The user is looking for quick, conversational answers. Keep responses concise (2-3 sentences max) and actionable. Focus on the most important point first.`;
    temperature = 0.6;
    maxTokens = 300;
  } else if (context.contextMode === "terminal") {
    // User wants deep, analytical responses
    contextInstructions = `\n\nCONTEXT: The user is in analytical mode. Provide detailed, data-driven insights with specific metrics, comparisons, and thorough reasoning. Use technical terminology appropriately.`;
    temperature = 0.5;
    maxTokens = 800;
  } else if (context.contextMode === "hybrid") {
    // Balanced approach
    contextInstructions = `\n\nCONTEXT: The user wants balanced responses - clear insights with supporting data, but not overly verbose. Aim for 3-5 sentences with key metrics.`;
    temperature = 0.6;
    maxTokens = 500;
  }

  const systemPrompt = `You are Athena, a professional AI investment advisor with deep expertise in financial markets, portfolio management, and investment strategies. You provide thoughtful, actionable advice to all investors regardless of their experience level or portfolio size.

CORE CAPABILITIES:
• Answer ALL investment questions comprehensively - from "what is a stock?" to advanced trading strategies
• Provide market analysis and insights on economic trends, earnings reports, and sector performance
• Offer personalized portfolio recommendations based on risk tolerance and investment goals
• Explain investment concepts clearly - P/E ratios, diversification, dollar-cost averaging, etc.
• Suggest specific stocks or ETFs with reasoning, even for beginners
• Guide users through investment decisions with pros/cons analysis
• Provide technical and fundamental analysis when relevant

USER CONTEXT:
Current Portfolio: ${portfolioSummary}
${context.holdings.length > 0 
  ? `The user has ${context.holdings.length} holdings. Analyze their portfolio and provide specific recommendations for optimization, rebalancing, or new opportunities.`
  : `The user is new to investing or hasn't added holdings yet. Be especially helpful by suggesting starter portfolios, explaining basics, recommending first investments, and providing educational guidance. Never just say "you don't have investments" - always be constructive and helpful.`}

RESPONSE STYLE:
• Be conversational but professional
• Provide specific, actionable advice
• Include numbers, percentages, and concrete examples
• Explain your reasoning clearly
• Always be helpful regardless of question complexity
• If asked about topics outside investing, briefly acknowledge but redirect to investment advice

Remember: You are a knowledgeable advisor who helps everyone from complete beginners asking "how do I start investing?" to experienced traders seeking advanced strategies. Every question deserves a thorough, helpful response.${contextInstructions}`;

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
