import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { avatarPresets } from "./avatarPresets";
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
  
  if (analysis.recommendedMode === 'athena' && currentMode !== 'athena') {
    if (hurried > 50) {
      return `You seem to be looking for quick answers (hurried score: ${hurried.toFixed(0)}). Athena Mode provides a faster, more conversational experience.`;
    }
    return `Let's make this more personal (conversational score: ${conversational.toFixed(0)}). Athena Mode offers a natural conversation flow.`;
  }
  
  if (analysis.recommendedMode === 'hybrid' && currentMode !== 'hybrid') {
    return `Hybrid Mode might work better - it balances conversation with data visualization.`;
  }

  return `Your current mode works well for this conversation style.`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize preset avatars in database on server start
  storage.initializePresetAvatars(avatarPresets).then(() => {
    console.log('Preset avatars initialized');
  }).catch(err => {
    console.error('Error initializing preset avatars:', err);
  });

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

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Session destruction failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
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
      let holdings = await storage.getUserHoldings(user.id);
      
      // Add rich mock holdings if the user has none (for demo purposes)
      if (holdings.length === 0) {
        holdings = [
          { id: 'mock-1', userId: user.id, symbol: 'AAPL', quantity: '50', averageCost: '150.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-2', userId: user.id, symbol: 'MSFT', quantity: '25', averageCost: '320.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-3', userId: user.id, symbol: 'GOOGL', quantity: '15', averageCost: '125.75', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-4', userId: user.id, symbol: 'TSLA', quantity: '30', averageCost: '210.25', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-5', userId: user.id, symbol: 'NVDA', quantity: '20', averageCost: '450.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-6', userId: user.id, symbol: 'META', quantity: '35', averageCost: '300.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-7', userId: user.id, symbol: 'AMZN', quantity: '40', averageCost: '140.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-8', userId: user.id, symbol: 'JPM', quantity: '45', averageCost: '145.00', createdAt: new Date(), updatedAt: new Date() },
        ];
      }
      
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
      let trades = await storage.getUserTrades(user.id);
      
      // Add mock trades if the user has none (for demo purposes)
      if (trades.length === 0) {
        trades = [
          { 
            id: 'mock-t1', 
            userId: user.id, 
            symbol: 'AAPL', 
            type: 'buy' as const, 
            quantity: '10', 
            price: '178.50', 
            status: 'pending' as const,
            reasoning: 'Strong iPhone 15 sales and services growth. Technical breakout above resistance.',
            confidence: '85',
            createdAt: new Date(Date.now() - 3600000)
          },
          { 
            id: 'mock-t2', 
            userId: user.id, 
            symbol: 'NVDA', 
            type: 'buy' as const, 
            quantity: '5', 
            price: '495.00', 
            status: 'pending' as const,
            reasoning: 'AI chip demand continues to exceed supply. Data center growth accelerating.',
            confidence: '90',
            createdAt: new Date(Date.now() - 7200000)
          },
          { 
            id: 'mock-t3', 
            userId: user.id, 
            symbol: 'TSLA', 
            type: 'sell' as const, 
            quantity: '15', 
            price: '245.00', 
            status: 'executed' as const,
            reasoning: 'Taking profits after 30% gain. Valuation concerns near resistance level.',
            confidence: '75',
            createdAt: new Date(Date.now() - 86400000)
          },
        ];
      }
      
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

  // Execute trade (buy/sell with order types)
  app.post("/api/trades/execute", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const schema = z.object({
        symbol: z.string().min(1).max(10),
        action: z.enum(['buy', 'sell']),
        quantity: z.number().positive(),
        orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']),
        limitPrice: z.number().optional(),
        stopPrice: z.number().optional(),
        timeInForce: z.enum(['day', 'gtc', 'ioc', 'fok']),
      });

      const data = schema.parse(req.body);

      // Get current quote for the symbol
      const quote = await getQuote(data.symbol.toUpperCase());
      if (!quote) {
        return res.status(404).json({ error: `Quote not found for ${data.symbol}` });
      }

      // Determine execution price based on order type
      let executionPrice = quote.price;
      if (data.orderType === 'limit' && data.limitPrice) {
        executionPrice = data.limitPrice;
      }

      const totalCost = executionPrice * data.quantity;

      // Get user's current balance
      const currentUser = await storage.getUser(user.id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const accountBalance = parseFloat(currentUser.accountBalance || "0");

      // For buy orders, check sufficient funds
      if (data.action === 'buy') {
        if (totalCost > accountBalance) {
          return res.status(400).json({ 
            error: `Insufficient funds. Need $${totalCost.toFixed(2)}, have $${accountBalance.toFixed(2)}` 
          });
        }

        // Deduct from balance
        await storage.updateUserBalance(user.id, (accountBalance - totalCost).toString());
      }

      // For sell orders, verify user has the holding
      if (data.action === 'sell') {
        const holdings = await storage.getUserHoldings(user.id);
        const holding = holdings.find(h => h.symbol === data.symbol.toUpperCase());
        
        if (!holding) {
          return res.status(400).json({ error: `You don't own any shares of ${data.symbol}` });
        }

        const currentQuantity = parseFloat(holding.quantity);
        if (currentQuantity < data.quantity) {
          return res.status(400).json({ 
            error: `Insufficient shares. You have ${currentQuantity}, trying to sell ${data.quantity}` 
          });
        }

        // Add proceeds to balance
        await storage.updateUserBalance(user.id, (accountBalance + totalCost).toString());
      }

      // Create the trade record
      const trade = await storage.createTrade({
        userId: user.id,
        symbol: data.symbol.toUpperCase(),
        type: data.action,
        quantity: data.quantity.toString(),
        price: executionPrice.toString(),
        status: 'executed', // For market orders, execute immediately
      });

      // Update or create holding
      const holdings = await storage.getUserHoldings(user.id);
      const existingHolding = holdings.find(h => h.symbol === data.symbol.toUpperCase());

      if (data.action === 'buy') {
        if (existingHolding) {
          // Update existing holding
          const currentQuantity = parseFloat(existingHolding.quantity);
          const currentCost = parseFloat(existingHolding.averageCost);
          const newQuantity = currentQuantity + data.quantity;
          const newAverageCost = ((currentQuantity * currentCost) + (data.quantity * executionPrice)) / newQuantity;

          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
            averageCost: newAverageCost.toString(),
          });
        } else {
          // Create new holding
          await storage.createHolding({
            userId: user.id,
            symbol: data.symbol.toUpperCase(),
            quantity: data.quantity.toString(),
            averageCost: executionPrice.toString(),
          });
        }
      } else if (data.action === 'sell' && existingHolding) {
        const currentQuantity = parseFloat(existingHolding.quantity);
        const newQuantity = currentQuantity - data.quantity;

        if (newQuantity <= 0) {
          // Remove holding entirely
          await storage.deleteHolding(existingHolding.id);
        } else {
          // Update quantity
          await storage.updateHolding(existingHolding.id, {
            quantity: newQuantity.toString(),
          });
        }
      }

      res.json({
        success: true,
        trade,
        message: `Successfully ${data.action === 'buy' ? 'bought' : 'sold'} ${data.quantity} shares of ${data.symbol.toUpperCase()} at $${executionPrice.toFixed(2)}`,
      });
    } catch (error: any) {
      console.error("Trade execution error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to execute trade" });
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
      let watchlist = await storage.getUserWatchlist(user.id);
      
      // Add rich mock watchlist if the user has none (for demo purposes)
      if (watchlist.length === 0) {
        watchlist = [
          { id: 'mock-w1', userId: user.id, symbol: 'SPY', addedAt: new Date() },
          { id: 'mock-w2', userId: user.id, symbol: 'QQQ', addedAt: new Date() },
          { id: 'mock-w3', userId: user.id, symbol: 'VTI', addedAt: new Date() },
          { id: 'mock-w4', userId: user.id, symbol: 'AAPL', addedAt: new Date() },
          { id: 'mock-w5', userId: user.id, symbol: 'GOOGL', addedAt: new Date() },
          { id: 'mock-w6', userId: user.id, symbol: 'NVDA', addedAt: new Date() },
          { id: 'mock-w7', userId: user.id, symbol: 'BTC-USD', addedAt: new Date() },
        ];
      }
      
      res.json(watchlist);
    } catch (error) {
      console.error("Watchlist error:", error);
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

  // Avatar endpoints
  app.get("/api/avatars/presets", async (req, res) => {
    try {
      const presets = await storage.getPresetAvatars();
      res.json(presets);
    } catch (error) {
      console.error("Error fetching preset avatars:", error);
      res.status(500).json({ error: "Failed to fetch preset avatars" });
    }
  });

  app.get("/api/avatars/history", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const history = await storage.getUserAvatarHistory(user.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching avatar history:", error);
      res.status(500).json({ error: "Failed to fetch avatar history" });
    }
  });

  app.post("/api/avatars/custom", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { name, personality, tradingStyle, appearance } = req.body;
      
      // Generate prompt for AI
      const prompt = `Professional trader avatar: ${personality}. Style: ${tradingStyle}. Appearance: ${appearance}`;
      
      // Create avatar record
      const avatar = await storage.createCustomAvatar({
        name: name || "Custom Avatar",
        imageUrl: "/avatars/custom-placeholder.svg",
        personalityProfile: {
          traits: personality.split(',').map((t: string) => t.trim()),
          tradingStyle,
          tone: "professional",
          backstory: `A custom trader persona tailored to your preferences.`
        },
        voiceStyle: null,
        isPreset: false,
        generationParams: { prompt, style: tradingStyle, mood: appearance }
      } as any);
      
      // Create user avatar association
      await storage.createUserAvatar({
        userId: user.id,
        avatarId: avatar.id,
        customPrompt: prompt,
        tradingStyle,
        isActive: false
      } as any);
      
      res.json(avatar);
    } catch (error) {
      console.error("Error creating custom avatar:", error);
      res.status(500).json({ error: "Failed to create custom avatar" });
    }
  });

  app.post("/api/avatars/:id/select", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const avatarIdentifier = req.params.id;
      
      // Check if this is a persona key (for presets) or an avatar ID
      let avatar = await storage.getAvatarByPersonaKey(avatarIdentifier);
      let avatarId = avatar?.id;
      
      if (!avatar) {
        // Try to get by ID directly (for custom avatars)
        const avatarRecord = await storage.getPresetAvatars();
        avatar = avatarRecord.find(a => a.id === avatarIdentifier) || null;
        avatarId = avatarIdentifier;
      }
      
      if (!avatarId) {
        return res.status(404).json({ error: "Avatar not found" });
      }
      
      // Check if user has a userAvatar record for this avatar
      const userAvatarHistory = await storage.getUserAvatarHistory(user.id);
      const existingUserAvatar = userAvatarHistory.find(ua => ua.avatarId === avatarId);
      
      if (!existingUserAvatar) {
        // Create a userAvatar record for preset avatars
        await storage.createUserAvatar({
          userId: user.id,
          avatarId: avatarId,
          customPrompt: null,
          tradingStyle: avatar?.personalityProfile?.tradingStyle || null,
          isActive: false
        } as any);
      }
      
      // Now activate the avatar
      await storage.setActiveAvatar(user.id, avatarId);
      res.json({ success: true, avatarId });
    } catch (error) {
      console.error("Error selecting avatar:", error);
      res.status(500).json({ error: "Failed to select avatar" });
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
      let holdings = await storage.getUserHoldings(user.id);
      const isUsingMockData = holdings.length === 0;
      
      // Use mock holdings if database is empty
      if (isUsingMockData) {
        holdings = [
          { id: 'mock-1', userId: user.id, symbol: 'AAPL', quantity: '50', averageCost: '150.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-2', userId: user.id, symbol: 'MSFT', quantity: '25', averageCost: '320.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-3', userId: user.id, symbol: 'GOOGL', quantity: '15', averageCost: '125.75', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-4', userId: user.id, symbol: 'TSLA', quantity: '30', averageCost: '210.25', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-5', userId: user.id, symbol: 'NVDA', quantity: '20', averageCost: '450.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-6', userId: user.id, symbol: 'META', quantity: '35', averageCost: '300.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-7', userId: user.id, symbol: 'AMZN', quantity: '40', averageCost: '140.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'mock-8', userId: user.id, symbol: 'JPM', quantity: '45', averageCost: '145.00', createdAt: new Date(), updatedAt: new Date() },
        ];
        
        // Return mock summary data with correct $125,850 total value
        return res.json({
          totalValue: 125850,
          totalCost: 110000,
          totalGain: 15850,
          totalGainPercent: 14.41,
          cashBalance: 25000,
          holdingsCount: 8,
          topHoldings: [
            { symbol: 'AAPL', value: 8916, percentOfPortfolio: 7.08 },
            { symbol: 'MSFT', value: 9472.75, percentOfPortfolio: 7.52 },
            { symbol: 'NVDA', value: 9906.4, percentOfPortfolio: 7.87 },
            { symbol: 'META', value: 11375, percentOfPortfolio: 9.04 },
            { symbol: 'TSLA', value: 7285.2, percentOfPortfolio: 5.79 },
          ],
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
      const isValid = await bcrypt.compare(currentPassword, user.password);
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

  // Portfolio visualization routes
  app.get("/api/portfolio/performance", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      // Generate rich mock historical performance data
      const today = new Date();
      const performanceData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // More realistic growth pattern with volatility
      const growthPattern = [100000, 98500, 102000, 105500, 103000, 108000, 112000, 109000, 115000, 118500, 122000, 125000];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        
        performanceData.push({
          date: monthNames[date.getMonth()],
          value: growthPattern[11 - i] + Math.round(Math.random() * 2000 - 1000), // Add small random variation
        });
      }

      res.json(performanceData);
    } catch (error) {
      console.error("Portfolio performance error:", error);
      res.status(500).json({ error: "Failed to get portfolio performance" });
    }
  });

  app.get("/api/portfolio/sectors", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      let holdings = await storage.getUserHoldings(userId);

      // Always return meaningful sector data for demo purposes
      if (holdings.length === 0) {
        return res.json([
          { name: 'Technology', value: 45250, percentage: 36.2 },
          { name: 'Consumer', value: 28500, percentage: 22.8 },
          { name: 'Finance', value: 18750, percentage: 15.0 },
          { name: 'Healthcare', value: 15000, percentage: 12.0 },
          { name: 'Communications', value: 8750, percentage: 7.0 },
          { name: 'Energy', value: 5000, percentage: 4.0 },
          { name: 'Other', value: 3750, percentage: 3.0 },
        ]);
      }

      // Get quotes to calculate current values
      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);

      // Simplified sector mapping - in production would use real sector data
      const sectorMap: Record<string, string> = {
        'AAPL': 'Technology',
        'MSFT': 'Technology',
        'GOOGL': 'Technology',
        'NVDA': 'Technology',
        'TSLA': 'Consumer',
        'AMZN': 'Consumer',
        'META': 'Technology',
        'NFLX': 'Communications',
        'JPM': 'Finance',
        'JNJ': 'Healthcare',
        'V': 'Finance',
        'UNH': 'Healthcare',
      };

      // Calculate sector allocations
      const sectorTotals: Record<string, number> = {};
      let totalValue = 0;

      holdings.forEach(holding => {
        const quote = quotes.get(holding.symbol);
        if (quote) {
          const value = parseFloat(holding.quantity) * quote.price;
          const sector = sectorMap[holding.symbol] || 'Other';
          sectorTotals[sector] = (sectorTotals[sector] || 0) + value;
          totalValue += value;
        }
      });

      // Convert to array format with percentages
      const sectorData = Object.entries(sectorTotals).map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: (value / totalValue) * 100,
      }));

      // Sort by value descending
      sectorData.sort((a, b) => b.value - a.value);

      res.json(sectorData);
    } catch (error) {
      console.error("Sector allocation error:", error);
      res.status(500).json({ error: "Failed to get sector allocation" });
    }
  });

  app.get("/api/portfolio/risk-metrics", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      if (holdings.length === 0) {
        return res.json({
          concentrationScore: 0,
          diversificationScore: 0,
          volatility: 0,
          beta: 0,
          sharpeRatio: 0,
          alerts: [],
        });
      }

      // Get quotes for calculations
      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);

      // Calculate portfolio value distribution
      const values = holdings.map(holding => {
        const quote = quotes.get(holding.symbol);
        return quote ? parseFloat(holding.quantity) * quote.price : 0;
      });
      const totalValue = values.reduce((sum, v) => sum + v, 0);

      // Concentration Score (0-100, higher = more concentrated)
      // Using Herfindahl-Hirschman Index (HHI)
      const concentrations = values.map(v => (v / totalValue) ** 2);
      const hhi = concentrations.reduce((sum, c) => sum + c, 0);
      const concentrationScore = Math.min(100, hhi * 100 * holdings.length);

      // Diversification Score (0-100, higher = better diversified)
      const diversificationScore = Math.max(0, 100 - concentrationScore);

      // Simplified volatility calculation (mock - in production would use historical data)
      const volatility = 15 + Math.random() * 15; // 15-30% range

      // Beta calculation (mock - would use regression against market index)
      const beta = 0.8 + Math.random() * 0.6; // 0.8-1.4 range

      // Sharpe Ratio (mock - would use actual returns and risk-free rate)
      const mockReturn = 12 + Math.random() * 8; // 12-20% annual return
      const riskFreeRate = 4; // 4% risk-free rate
      const sharpeRatio = (mockReturn - riskFreeRate) / volatility;

      // Generate alerts based on metrics
      const alerts = [];

      if (concentrationScore > 70) {
        alerts.push({
          type: 'concentration' as const,
          severity: 'high' as const,
          message: `High concentration risk detected. Your top holdings represent ${concentrationScore.toFixed(0)}% of portfolio value. Consider diversifying.`,
        });
      }

      if (volatility > 25) {
        alerts.push({
          type: 'volatility' as const,
          severity: 'medium' as const,
          message: `Portfolio volatility is ${volatility.toFixed(1)}%, above the market average of 20%. This indicates higher price fluctuations.`,
        });
      }

      if (beta > 1.3) {
        alerts.push({
          type: 'exposure' as const,
          severity: 'medium' as const,
          message: `Portfolio beta of ${beta.toFixed(2)} indicates ${((beta - 1) * 100).toFixed(0)}% more volatile than the market.`,
        });
      }

      res.json({
        concentrationScore: Number(concentrationScore.toFixed(2)),
        diversificationScore: Number(diversificationScore.toFixed(2)),
        volatility: Number(volatility.toFixed(2)),
        beta: Number(beta.toFixed(2)),
        sharpeRatio: Number(sharpeRatio.toFixed(2)),
        alerts,
      });
    } catch (error) {
      console.error("Risk metrics error:", error);
      res.status(500).json({ error: "Failed to calculate risk metrics" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/correlation", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      if (holdings.length < 2) {
        return res.json({ pairs: [], concentrationRisk: 0 });
      }

      // Get quotes for all holdings
      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);

      // Calculate correlation pairs (simplified - in production would use historical data)
      const pairs = [];
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          // Simplified correlation based on sector/volatility patterns
          // In production, this would use historical price data
          const correlation = 0.3 + Math.random() * 0.6; // Mock correlation 0.3-0.9
          pairs.push({
            symbol1: symbols[i],
            symbol2: symbols[j],
            correlation: Number(correlation.toFixed(2)),
          });
        }
      }

      // Calculate concentration risk (average of highest correlations)
      const highCorrelations = pairs.filter(p => p.correlation > 0.7);
      const concentrationRisk = highCorrelations.length > 0
        ? highCorrelations.reduce((sum, p) => sum + p.correlation, 0) / highCorrelations.length
        : 0;

      // Sort by correlation (highest first)
      pairs.sort((a, b) => b.correlation - a.correlation);

      res.json({
        pairs: pairs.slice(0, 5), // Return top 5 correlations
        concentrationRisk: Number(concentrationRisk.toFixed(2)),
      });
    } catch (error) {
      console.error("Correlation analysis error:", error);
      res.status(500).json({ error: "Failed to calculate correlations" });
    }
  });

  app.get("/api/analytics/factors", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      if (holdings.length === 0) {
        return res.json([]);
      }

      // Get portfolio value to calculate factor exposures
      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);
      
      // Simplified factor analysis - in production would analyze actual stock characteristics
      const factors = [
        {
          factor: "Value",
          exposure: 0.4 + Math.random() * 0.3, // 0.4-0.7
          description: "Your portfolio tilts toward undervalued companies with strong fundamentals.",
        },
        {
          factor: "Momentum",
          exposure: 0.5 + Math.random() * 0.4, // 0.5-0.9
          description: "Significant exposure to stocks with strong recent price performance.",
        },
        {
          factor: "Quality",
          exposure: 0.6 + Math.random() * 0.3, // 0.6-0.9
          description: "High-quality companies with stable earnings and low debt.",
        },
        {
          factor: "Size (Large Cap)",
          exposure: 0.7 + Math.random() * 0.2, // 0.7-0.9
          description: "Portfolio weighted toward larger, established companies.",
        },
      ];

      res.json(factors.map(f => ({
        ...f,
        exposure: Number(f.exposure.toFixed(2)),
      })));
    } catch (error) {
      console.error("Factor analysis error:", error);
      res.status(500).json({ error: "Failed to calculate factor exposures" });
    }
  });

  app.get("/api/analytics/regime", requireAuth, async (req, res) => {
    try {
      // Get market indices to determine regime
      const indices = await getMarketIndices();
      const spx = indices.find(i => i.symbol === '^GSPC');

      // Simplified regime detection - in production would use VIX and trend analysis
      const mockVix = 15 + Math.random() * 20; // VIX between 15-35
      const marketTrend = spx ? spx.changePercent / 100 : 0;

      let regime: 'bull' | 'bear' | 'high-volatility' | 'neutral';
      let description: string;
      let confidence: number;

      if (mockVix > 30) {
        regime = 'high-volatility';
        confidence = 85;
        description = "Market volatility is elevated. Consider reducing position sizes and maintaining cash reserves. Risk-off strategies may be appropriate.";
      } else if (marketTrend > 0.015 && mockVix < 20) {
        regime = 'bull';
        confidence = 90;
        description = "Market conditions are favorable with low volatility and positive momentum. This environment supports growth-oriented strategies.";
      } else if (marketTrend < -0.015) {
        regime = 'bear';
        confidence = 80;
        description = "Market showing negative momentum. Focus on defensive positions, quality stocks, and capital preservation.";
      } else {
        regime = 'neutral';
        confidence = 75;
        description = "Market is range-bound without clear direction. Balanced approach recommended with both growth and defensive positions.";
      }

      res.json({
        regime,
        confidence,
        description,
        vix: Number(mockVix.toFixed(2)),
        marketTrend: Number(marketTrend.toFixed(4)),
      });
    } catch (error) {
      console.error("Regime analysis error:", error);
      res.status(500).json({ error: "Failed to determine market regime" });
    }
  });

  app.get("/api/analytics/stress-test", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      if (holdings.length === 0) {
        return res.json([]);
      }

      // Historical crisis scenarios - simplified impact estimation
      const scenarios = [
        {
          scenario: "2008 Financial Crisis",
          portfolioImpact: -38 - Math.random() * 12, // -38% to -50%
          description: "Severe banking crisis and credit crunch. Your tech-heavy portfolio would have faced significant drawdowns.",
          year: "2008",
        },
        {
          scenario: "COVID-19 Pandemic",
          portfolioImpact: -25 - Math.random() * 10, // -25% to -35%
          description: "Sharp market sell-off followed by rapid recovery. Tech stocks recovered faster than average.",
          year: "March 2020",
        },
        {
          scenario: "Dot-com Bubble Burst",
          portfolioImpact: -45 - Math.random() * 20, // -45% to -65%
          description: "Extreme tech sector collapse. High-growth stocks would have experienced severe losses.",
          year: "2000-2002",
        },
        {
          scenario: "Flash Crash",
          portfolioImpact: -8 - Math.random() * 4, // -8% to -12%
          description: "Rapid intraday sell-off with quick recovery. Diversified portfolio would have limited exposure.",
          year: "May 2010",
        },
      ];

      res.json(scenarios.map(s => ({
        ...s,
        portfolioImpact: Number(s.portfolioImpact.toFixed(1)),
      })));
    } catch (error) {
      console.error("Stress test error:", error);
      res.status(500).json({ error: "Failed to run stress tests" });
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
