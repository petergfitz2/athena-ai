import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { passport } from "./auth";
import bcrypt from "bcrypt";
import { insertUserSchema, insertHoldingSchema, insertTradeSchema, type PortfolioSummary } from "@shared/schema";
import { generateAIResponse, generateTradeSuggestions } from "./openai";
import { processVoiceInput } from "./voice";
import { ConversationAnalyzer } from "./conversationAnalyzer";
import { getMarketIndices, getQuote, getBatchQuotes, getNews } from "./services/marketService";
import { z } from "zod";

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

// Helper function to generate mode change reason
function getModeChangeReason(
  analysis: { hurriedScore: number | string; analyticalScore: number | string; conversationalScore: number | string; recommendedMode: string | null },
  currentMode: string
): string {
  const hurried = typeof analysis.hurriedScore === 'number' ? analysis.hurriedScore : Number(analysis.hurriedScore);
  const analytical = typeof analysis.analyticalScore === 'number' ? analysis.analyticalScore : Number(analysis.analyticalScore);
  const conversational = typeof analysis.conversationalScore === 'number' ? analysis.conversationalScore : Number(analysis.conversationalScore);

  // Handle null recommended mode
  if (!analysis.recommendedMode) {
    return `Your conversation style is balanced across modes. Feel free to switch based on your needs.`;
  }

  if (analysis.recommendedMode === 'terminal' && currentMode !== 'terminal') {
    return `You're diving deep into analysis (analytical score: ${analytical.toFixed(0)}). Terminal Mode offers multi-panel analytics perfect for this level of detail.`;
  }
  
  if (analysis.recommendedMode === 'amanda' && currentMode !== 'amanda') {
    if (hurried > 50) {
      return `You seem to be looking for quick answers (hurried score: ${hurried.toFixed(0)}). Amanda Mode provides a faster, more conversational experience.`;
    }
    return `Let's make this more personal (conversational score: ${conversational.toFixed(0)}). Amanda Mode offers a natural conversation flow.`;
  }
  
  if (analysis.recommendedMode === 'hybrid' && currentMode !== 'hybrid') {
    return `Hybrid Mode might work better - it balances conversation with data visualization.`;
  }

  return `Your current mode works well for this conversation style.`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName } = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Portfolio/Holdings routes
  app.get("/api/holdings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const holdings = await storage.getUserHoldings(user.id);
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  app.post("/api/holdings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const holdingData = insertHoldingSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const holding = await storage.createHolding(holdingData);
      res.json(holding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create holding" });
    }
  });

  app.patch("/api/holdings/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const holding = await storage.updateHolding(id, req.body);
      if (!holding) {
        return res.status(404).json({ error: "Holding not found" });
      }
      res.json(holding);
    } catch (error) {
      res.status(500).json({ error: "Failed to update holding" });
    }
  });

  app.delete("/api/holdings/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteHolding(id);
      if (!success) {
        return res.status(404).json({ error: "Holding not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete holding" });
    }
  });

  // Trade routes
  app.get("/api/trades", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const trades = await storage.getUserTrades(user.id);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/pending", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const trades = await storage.getPendingTrades(user.id);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending trades" });
    }
  });

  app.post("/api/trades", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const tradeData = insertTradeSchema.parse({
        ...req.body,
        userId: user.id,
        status: 'pending',
      });
      const trade = await storage.createTrade(tradeData);
      res.json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create trade" });
    }
  });

  app.patch("/api/trades/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['approved', 'executed', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const trade = await storage.updateTradeStatus(id, status);
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trade status" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const conversations = await storage.getUserConversations(user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const conversation = await storage.createConversation({ userId: user.id });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { role, content } = req.body;
      
      const message = await storage.createMessage({
        conversationId: id,
        role,
        content,
      });
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const watchlist = await storage.getUserWatchlist(user.id);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { symbol } = req.body;
      const item = await storage.addToWatchlist({ userId: user.id, symbol });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removeFromWatchlist(id);
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { message, conversationId, lastMessageTime } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Calculate response time if provided
      let responseTimeSeconds: number | undefined;
      if (lastMessageTime) {
        responseTimeSeconds = Math.floor((Date.now() - lastMessageTime) / 1000);
      }

      // Get user's holdings for context
      const holdings = await storage.getUserHoldings(user.id);

      // Get conversation context if available
      let contextMode: string | null = null;
      if (conversationId) {
        const context = await ConversationAnalyzer.getConversationContext(conversationId);
        if (context) {
          contextMode = context.recommendedMode;
        }
      }

      // Generate AI response (with context awareness)
      const aiResponse = await generateAIResponse(message, {
        userId: user.id,
        holdings,
        contextMode,
      });

      // Save messages and analyze if conversation ID provided
      let userMessageId: string | undefined;
      if (conversationId) {
        const userMsg = await storage.createMessage({
          conversationId,
          role: "user",
          content: message,
        });
        userMessageId = userMsg.id;

        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: aiResponse,
        });

        // Analyze the user message
        await ConversationAnalyzer.storeMessageMetrics(
          userMessageId,
          conversationId,
          message,
          responseTimeSeconds
        );

        // Update conversation analysis
        const analysis = await ConversationAnalyzer.updateConversationAnalysis(
          conversationId,
          user.id
        );

        // Return response with analysis
        res.json({ 
          response: aiResponse,
          analysis: analysis ? {
            hurriedScore: Number(analysis.hurriedScore),
            analyticalScore: Number(analysis.analyticalScore),
            conversationalScore: Number(analysis.conversationalScore),
            recommendedMode: analysis.recommendedMode,
          } : null
        });
        return;
      }

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // AI Trade Suggestions endpoint
  app.get("/api/ai/trade-suggestions", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const holdings = await storage.getUserHoldings(user.id);
      
      const suggestions = await generateTradeSuggestions(user.id, holdings);
      
      // Save suggestions as pending trades
      const savedTrades = await Promise.all(
        suggestions.map((s) =>
          storage.createTrade({
            userId: user.id,
            symbol: s.symbol,
            type: s.action.toLowerCase() as 'buy' | 'sell',
            quantity: s.quantity.toString(),
            price: s.price.toString(),
            reasoning: s.reasoning,
            confidence: s.confidence.toString(),
            status: 'pending',
          })
        )
      );

      res.json(savedTrades);
    } catch (error) {
      console.error("Trade suggestions error:", error);
      res.status(500).json({ error: "Failed to generate trade suggestions" });
    }
  });

  // Voice Chat endpoint
  app.post("/api/voice/chat", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { audio } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio is required" });
      }

      // Get user's holdings for context
      const holdings = await storage.getUserHoldings(user.id);

      // Process voice input
      const result = await processVoiceInput(audio, user.id, holdings);

      res.json(result);
    } catch (error) {
      console.error("Voice chat error:", error);
      res.status(500).json({ error: "Failed to process voice input" });
    }
  });

  // Context Analysis endpoints
  app.get("/api/context/:conversationId", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user as any;

      // Verify ownership
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const context = await ConversationAnalyzer.getConversationContext(conversationId);
      
      if (!context) {
        return res.status(404).json({ error: "No context found for this conversation" });
      }

      res.json({
        hurriedScore: Number(context.hurriedScore),
        analyticalScore: Number(context.analyticalScore),
        conversationalScore: Number(context.conversationalScore),
        recommendedMode: context.recommendedMode,
        messageCount: context.messageCount,
        avgResponseTimeSeconds: context.avgResponseTimeSeconds,
      });
    } catch (error) {
      console.error("Context fetch error:", error);
      res.status(500).json({ error: "Failed to fetch conversation context" });
    }
  });

  app.get("/api/context/:conversationId/suggestion", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user as any;
      
      // Verify ownership
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update analysis to get latest scores
      const analysis = await ConversationAnalyzer.updateConversationAnalysis(
        conversationId,
        user.id
      );

      if (!analysis) {
        return res.json({ shouldSuggest: false });
      }

      // Determine if we should suggest a mode change
      const currentMode = req.query.currentMode as string;
      const shouldSuggest = analysis.recommendedMode !== currentMode;

      res.json({
        shouldSuggest,
        recommendedMode: analysis.recommendedMode,
        reason: getModeChangeReason(analysis, currentMode),
        scores: {
          hurriedScore: analysis.hurriedScore,
          analyticalScore: analysis.analyticalScore,
          conversationalScore: analysis.conversationalScore,
        }
      });
    } catch (error) {
      console.error("Mode suggestion error:", error);
      res.status(500).json({ error: "Failed to generate mode suggestion" });
    }
  });

  // Market data routes
  app.get("/api/market/indices", async (_req, res) => {
    try {
      const indices = await getMarketIndices();
      res.json(indices);
    } catch (error) {
      console.error("Market indices error:", error);
      res.status(500).json({ error: "Failed to fetch market indices" });
    }
  });

  app.get("/api/market/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await getQuote(symbol);
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      console.error("Quote error:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.get("/api/market/quotes", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const holdings = await storage.getUserHoldings(user.id);
      const symbols = holdings.map(h => h.symbol);
      
      const quotes = await getBatchQuotes(symbols);
      
      res.json(Object.fromEntries(quotes));
    } catch (error) {
      console.error("Batch quotes error:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/market/quotes-batch", async (req, res) => {
    try {
      const symbolsParam = req.query.symbols as string;
      if (!symbolsParam) {
        return res.status(400).json({ error: "symbols parameter required" });
      }
      
      const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
      const quotes = await getBatchQuotes(symbols);
      
      res.json(Object.fromEntries(quotes));
    } catch (error) {
      console.error("Batch quotes error:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/market/news", async (req, res) => {
    try {
      const ticker = req.query.ticker as string | undefined;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const news = await getNews(ticker, limit);
      res.json(news);
    } catch (error) {
      console.error("News error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Portfolio summary route
  app.get("/api/portfolio/summary", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const holdings = await storage.getUserHoldings(user.id);
      
      if (holdings.length === 0) {
        return res.json({
          totalValue: 0,
          totalCost: 0,
          totalGain: 0,
          totalGainPercent: 0,
          cashBalance: Number(user.accountBalance || 0),
          holdingsCount: 0,
        } as PortfolioSummary);
      }

      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);
      
      let totalValue = 0;
      let totalCost = 0;
      const topHoldings: { symbol: string; value: number; percentOfPortfolio: number }[] = [];
      
      holdings.forEach(holding => {
        const quote = quotes.get(holding.symbol);
        if (quote) {
          const value = Number(holding.quantity) * quote.price;
          const cost = Number(holding.quantity) * Number(holding.averageCost);
          totalValue += value;
          totalCost += cost;
          
          topHoldings.push({
            symbol: holding.symbol,
            value,
            percentOfPortfolio: 0, // Will calculate after totalValue is known
          });
        }
      });
      
      // Calculate percentages
      topHoldings.forEach(h => {
        h.percentOfPortfolio = (h.value / totalValue) * 100;
      });
      
      // Sort by value and take top 5
      topHoldings.sort((a, b) => b.value - a.value);
      const top5 = topHoldings.slice(0, 5);
      
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
      
      const summary: PortfolioSummary = {
        totalValue,
        totalCost,
        totalGain,
        totalGainPercent,
        cashBalance: Number(user.accountBalance || 0),
        holdingsCount: holdings.length,
        topHoldings: top5,
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Portfolio summary error:", error);
      res.status(500).json({ error: "Failed to fetch portfolio summary" });
    }
  });

  // Account management routes
  app.post("/api/account/deposit", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        amount: z.string().or(z.number()),
      });
      const { amount } = schema.parse(req.body);
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const newBalance = Number(user.accountBalance || 0) + amountNum;
      await storage.updateUserBalance(userId, newBalance.toString());
      
      res.json({ 
        success: true,
        balance: newBalance,
        message: `Successfully deposited $${amountNum.toFixed(2)}`
      });
    } catch (error) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: "Failed to process deposit" });
    }
  });

  app.post("/api/account/withdraw", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        amount: z.string().or(z.number()),
      });
      const { amount } = schema.parse(req.body);
      const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const currentBalance = Number(user.accountBalance || 0);
      if (currentBalance < amountNum) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      
      const newBalance = currentBalance - amountNum;
      await storage.updateUserBalance(userId, newBalance.toString());
      
      res.json({ 
        success: true,
        balance: newBalance,
        message: `Successfully withdrew $${amountNum.toFixed(2)}`
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  // User profile routes
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
      });
      const updates = schema.parse(req.body);
      
      const userId = (req.user as any).id;
      await storage.updateUserProfile(userId, updates);
      
      res.json({ 
        success: true,
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/user/password", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      });
      const { currentPassword, newPassword } = schema.parse(req.body);
      
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Hash and update new password
      const newHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, newHash);
      
      res.json({ 
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      console.log("Received:", message.toString());
      // Handle WebSocket messages here
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return httpServer;
}
