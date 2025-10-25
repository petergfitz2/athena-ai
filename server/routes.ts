import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { avatarPresets } from "./avatarPresets";
import { isAuthenticated } from "./replitAuth";
import { insertUserSchema, insertHoldingSchema, insertTradeSchema, type PortfolioSummary } from "@shared/schema";
import { generateAIResponse, generateTradeSuggestions } from "./openai";
import { processVoiceInput } from "./voice";
import { ConversationAnalyzer } from "./conversationAnalyzer";
import { getMarketIndices, getQuote, getBatchQuotes, getNews, getHistoricalData } from "./services/marketService";
import MarketStreamService from "./services/marketStream";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'client/public/avatars/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for avatar uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// In-memory storage for demo conversations
interface DemoMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface DemoConversation {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  messages: DemoMessage[];
}

// Store demo conversations in memory (resets on server restart)
const demoConversations: Map<string, DemoConversation> = new Map();

// Use isAuthenticated from replitAuth for protected routes

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

  // Authentication routes - using Replit Auth
  // Replit Auth handles login/callback/logout routes automatically
  
  // Development bypass route - ONLY for development
  app.post('/api/auth/dev-bypass', async (req: any, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Dev bypass not allowed in production' });
    }
    
    console.log('[DEV BYPASS] Creating fake user session');
    
    // Create a fake user session
    const fakeUser = {
      claims: {
        sub: 'dev-user-123',
        email: 'dev@athena.test',
        first_name: 'Dev',
        last_name: 'User',
        profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      },
      access_token: 'dev-token-' + Date.now(),
      refresh_token: 'dev-refresh-' + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
    };
    
    // Upsert the dev user in the database
    try {
      await storage.upsertUser({
        id: fakeUser.claims.sub,
        email: fakeUser.claims.email,
        firstName: fakeUser.claims.first_name,
        lastName: fakeUser.claims.last_name,
        profileImageUrl: fakeUser.claims.profile_image_url
      });
      
      // Log the user in
      req.login(fakeUser, (err: any) => {
        if (err) {
          console.error('[DEV BYPASS] Login error:', err);
          return res.status(500).json({ error: 'Failed to create dev session' });
        }
        console.log('[DEV BYPASS] User logged in successfully');
        res.json({ success: true, user: fakeUser.claims });
      });
    } catch (error) {
      console.error('[DEV BYPASS] Failed to create user:', error);
      res.status(500).json({ error: 'Failed to create dev user' });
    }
  });
  
  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Note: Logout is handled by Replit Auth at /api/logout
  
  app.get("/api/auth/me", (req: any, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user;
      res.json({
        id: user.claims.sub,
        email: user.claims.email,
        firstName: user.claims.first_name,
        lastName: user.claims.last_name,
        profileImageUrl: user.claims.profile_image_url,
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Portfolio/Holdings routes - Now accessible without login for demo
  app.get("/api/holdings", async (req, res) => {
    try {
      // If not authenticated, return demo holdings
      if (!req.user) {
        const demoHoldings = [
          { id: 'demo-1', userId: 'demo', symbol: 'AAPL', quantity: '50', averageCost: '150.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-2', userId: 'demo', symbol: 'MSFT', quantity: '25', averageCost: '320.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-3', userId: 'demo', symbol: 'GOOGL', quantity: '15', averageCost: '125.75', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-4', userId: 'demo', symbol: 'TSLA', quantity: '30', averageCost: '210.25', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-5', userId: 'demo', symbol: 'NVDA', quantity: '20', averageCost: '450.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-6', userId: 'demo', symbol: 'META', quantity: '35', averageCost: '300.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-7', userId: 'demo', symbol: 'AMZN', quantity: '40', averageCost: '140.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-8', userId: 'demo', symbol: 'JPM', quantity: '45', averageCost: '145.00', createdAt: new Date(), updatedAt: new Date() },
        ];
        return res.json(demoHoldings);
      }
      
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

  app.post("/api/holdings", isAuthenticated, async (req, res) => {
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

  app.patch("/api/holdings/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/holdings/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/trades", isAuthenticated, async (req, res) => {
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

  app.get("/api/trades/pending", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const trades = await storage.getPendingTrades(user.id);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending trades" });
    }
  });

  app.post("/api/trades", isAuthenticated, async (req, res) => {
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

  app.patch("/api/trades/:id/status", isAuthenticated, async (req, res) => {
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
  app.post("/api/trades/execute", isAuthenticated, async (req, res) => {
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

  // Conversation routes - Now accessible without login for demo
  app.get("/api/conversations", async (req, res) => {
    try {
      // If not authenticated, return demo conversations
      if (!req.user) {
        const conversations = Array.from(demoConversations.values()).map(conv => ({
          id: conv.id,
          userId: conv.userId,
          startedAt: conv.startedAt,
          endedAt: conv.endedAt
        }));
        
        // Always have at least one conversation for demo
        if (conversations.length === 0) {
          const initialConversation: DemoConversation = {
            id: 'demo-conversation-1',
            userId: 'demo',
            startedAt: new Date(Date.now() - 86400000),
            endedAt: null,
            messages: []
          };
          demoConversations.set(initialConversation.id, initialConversation);
          conversations.push({
            id: initialConversation.id,
            userId: initialConversation.userId,
            startedAt: initialConversation.startedAt,
            endedAt: initialConversation.endedAt
          });
        }
        
        return res.json(conversations);
      }
      
      const user = req.user as any;
      const conversations = await storage.getUserConversations(user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      // If not authenticated, create a demo conversation in memory
      if (!req.user) {
        const demoConversation: DemoConversation = {
          id: 'demo-conversation-' + Date.now(), 
          userId: 'demo', 
          startedAt: new Date(),
          endedAt: null,
          messages: []
        };
        demoConversations.set(demoConversation.id, demoConversation);
        
        return res.json({
          id: demoConversation.id,
          userId: demoConversation.userId,
          startedAt: demoConversation.startedAt,
          endedAt: demoConversation.endedAt
        });
      }
      
      const user = req.user as any;
      const conversation = await storage.createConversation({ userId: user.id });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      
      // If not authenticated, return demo messages from memory
      if (!req.user) {
        const conversation = demoConversations.get(id);
        if (!conversation) {
          // Create conversation if it doesn't exist
          const newConversation: DemoConversation = {
            id,
            userId: 'demo',
            startedAt: new Date(),
            endedAt: null,
            messages: [{
              id: 'demo-msg-welcome',
              conversationId: id,
              role: 'assistant',
              content: 'Welcome to Athena AI! I\'m here to help you explore our investment platform. What would you like to know about?',
              createdAt: new Date(Date.now() - 3600000)
            }]
          };
          demoConversations.set(id, newConversation);
          return res.json(newConversation.messages);
        }
        return res.json(conversation.messages || []);
      }
      
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const { role, content } = req.body;
      
      // If not authenticated, store demo message in memory
      if (!req.user) {
        let conversation = demoConversations.get(id);
        if (!conversation) {
          conversation = {
            id,
            userId: 'demo',
            startedAt: new Date(),
            endedAt: null,
            messages: []
          };
          demoConversations.set(id, conversation);
        }
        
        const demoMessage: DemoMessage = {
          id: 'demo-msg-' + Date.now(),
          conversationId: id,
          role: role as 'user' | 'assistant',
          content,
          createdAt: new Date()
        };
        
        conversation.messages.push(demoMessage);
        return res.json(demoMessage);
      }
      
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

  // Watchlist routes - Now accessible without login for demo
  app.get("/api/watchlist", async (req, res) => {
    try {
      // If not authenticated, return demo watchlist
      if (!req.user) {
        const demoWatchlist = [
          { id: 'demo-w1', userId: 'demo', symbol: 'SMR', addedAt: new Date() },
          { id: 'demo-w2', userId: 'demo', symbol: 'AAPL', addedAt: new Date() },
          { id: 'demo-w3', userId: 'demo', symbol: 'NVDA', addedAt: new Date() },
          { id: 'demo-w4', userId: 'demo', symbol: 'TSLA', addedAt: new Date() },
        ];
        return res.json(demoWatchlist);
      }
      
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

  app.post("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { symbol } = req.body;
      const item = await storage.addToWatchlist({ userId: user.id, symbol });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:id", isAuthenticated, async (req, res) => {
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

  // AI Chat endpoint - Now accessible without login for demo
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId, lastMessageTime } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Demo mode - no authentication required
      if (!req.user) {
        // Demo holdings for context
        const demoHoldings = [
          { id: 'demo-1', userId: 'demo', symbol: 'AAPL', quantity: '50', averageCost: '150.00', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-2', userId: 'demo', symbol: 'MSFT', quantity: '25', averageCost: '320.50', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-3', userId: 'demo', symbol: 'GOOGL', quantity: '15', averageCost: '125.75', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-4', userId: 'demo', symbol: 'TSLA', quantity: '30', averageCost: '210.25', createdAt: new Date(), updatedAt: new Date() },
          { id: 'demo-5', userId: 'demo', symbol: 'NVDA', quantity: '20', averageCost: '450.00', createdAt: new Date(), updatedAt: new Date() },
        ];

        // Generate AI response for demo user
        const aiResponse = await generateAIResponse(message, {
          userId: 'demo',
          holdings: demoHoldings,
          contextMode: null,
        });

        // Save messages to in-memory storage if conversation ID provided
        if (conversationId) {
          let conversation = demoConversations.get(conversationId);
          if (!conversation) {
            conversation = {
              id: conversationId,
              userId: 'demo',
              startedAt: new Date(),
              endedAt: null,
              messages: []
            };
            demoConversations.set(conversationId, conversation);
          }
          
          // Add user message
          const userMessage: DemoMessage = {
            id: 'demo-msg-user-' + Date.now(),
            conversationId,
            role: 'user',
            content: message,
            createdAt: new Date()
          };
          conversation.messages.push(userMessage);
          
          // Add AI response
          const aiMessage: DemoMessage = {
            id: 'demo-msg-ai-' + Date.now(),
            conversationId,
            role: 'assistant',
            content: aiResponse,
            createdAt: new Date()
          };
          conversation.messages.push(aiMessage);
        }

        // Detect intent and get quick replies
        const intent = await import("./athenaConversations").then(m => m.detectConversationIntent(message));
        const quickReplies = await import("./athenaConversations").then(m => m.generateQuickReplies(intent));
        
        // Return simplified response for demo mode with mock analysis
        return res.json({ 
          response: aiResponse,
          quickReplies,
          analysis: {
            hurriedScore: 30,
            analyticalScore: 50,
            conversationalScore: 60,
            recommendedMode: 'athena',
          }
        });
      }

      // Authenticated user flow
      const user = req.user as any;

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

      // Detect intent and get quick replies
      const intent = await import("./athenaConversations").then(m => m.detectConversationIntent(message));
      const quickReplies = await import("./athenaConversations").then(m => m.generateQuickReplies(intent));
      
      res.json({ response: aiResponse, quickReplies });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // AI Trade Suggestions endpoint
  app.get("/api/ai/trade-suggestions", isAuthenticated, async (req, res) => {
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

  app.get("/api/avatars/active", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const activeAvatar = await storage.getActiveAvatar(user.id);
      
      if (!activeAvatar) {
        // Return default Athena avatar if none selected
        return res.json({
          name: "Athena",
          imageUrl: "/avatars/athena-default.png",
          personalityProfile: {
            catchphrase: "Your AI Investment Advisor",
            traits: ["intelligent", "professional"],
            tradingStyle: "balanced",
            tone: "professional"
          }
        });
      }
      
      res.json(activeAvatar);
    } catch (error) {
      console.error("Error fetching active avatar:", error);
      res.status(500).json({ error: "Failed to fetch active avatar" });
    }
  });

  app.get("/api/avatars/history", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const history = await storage.getUserAvatarHistory(user.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching avatar history:", error);
      res.status(500).json({ error: "Failed to fetch avatar history" });
    }
  });

  app.post("/api/avatars/custom", isAuthenticated, upload.single('avatar'), async (req, res) => {
    try {
      const user = req.user as any;
      const { name, personality, tradingStyle, appearance } = req.body;
      
      // Get uploaded image URL or use default
      let imageUrl = "/avatars/custom-placeholder.svg";
      if (req.file) {
        // The file path relative to the public directory
        imageUrl = `/avatars/uploads/${req.file.filename}`;
      }
      
      // Generate personality prompt for AI
      const personalityPrompt = `You are ${name}, a custom investment advisor. ${personality} Your trading style is ${tradingStyle}. ${appearance ? `Visual style: ${appearance}.` : ''} Embody these characteristics naturally in your responses.`;
      
      // Extract traits from personality description (simple approach)
      const traits = [];
      if (personality.toLowerCase().includes('confident')) traits.push('confident');
      if (personality.toLowerCase().includes('analytical')) traits.push('analytical');
      if (personality.toLowerCase().includes('friendly')) traits.push('friendly');
      if (personality.toLowerCase().includes('experienced')) traits.push('experienced');
      if (personality.toLowerCase().includes('aggressive')) traits.push('aggressive');
      if (personality.toLowerCase().includes('conservative')) traits.push('conservative');
      if (personality.toLowerCase().includes('humor') || personality.toLowerCase().includes('funny')) traits.push('humorous');
      if (personality.toLowerCase().includes('serious')) traits.push('serious');
      if (traits.length === 0) traits.push('professional', 'knowledgeable');
      
      // Generate catchphrase based on personality
      let catchphrase = `Let's make smart ${tradingStyle} investments together!`;
      if (personality.toLowerCase().includes('wolf') || personality.toLowerCase().includes('aggressive')) {
        catchphrase = "Money never sleeps!";
      } else if (personality.toLowerCase().includes('conservative') || personality.toLowerCase().includes('safe')) {
        catchphrase = "Slow and steady wins the race.";
      } else if (personality.toLowerCase().includes('tech') || personality.toLowerCase().includes('startup')) {
        catchphrase = "Disrupting the market, one trade at a time.";
      } else if (personality.toLowerCase().includes('analytical') || personality.toLowerCase().includes('data')) {
        catchphrase = "The numbers never lie.";
      }
      
      // Create avatar record
      const avatar = await storage.createCustomAvatar({
        name: name || "Custom Avatar",
        imageUrl,
        personalityProfile: {
          traits,
          tradingStyle,
          tone: tradingStyle === 'aggressive' ? 'peer' : tradingStyle === 'conservative' ? 'mentor' : 'casual',
          backstory: personality,
          personalityPrompt,
          catchphrase,
          greeting: `Hey! I'm ${name}. ${personality.split('.')[0]}.`,
          jokeStyle: personality.toLowerCase().includes('humor') ? 'witty' : 'subtle',
          researchStyle: tradingStyle === 'analytical' ? 'data-driven with extensive metrics' : 'balanced with clear insights',
          encouragement: tradingStyle === 'aggressive' ? "That's what I'm talking about! Big moves!" : "Well done! Smart investing pays off."
        },
        voiceStyle: null,
        isPreset: false,
        generationParams: { prompt: personalityPrompt, style: tradingStyle, mood: appearance }
      } as any);
      
      // Create user avatar association  
      await storage.createUserAvatar({
        userId: user.id,
        avatarId: avatar.id,
        customPrompt: personalityPrompt,
        tradingStyle,
        isActive: false
      } as any);
      
      res.json(avatar);
    } catch (error) {
      console.error("Error creating custom avatar:", error);
      res.status(500).json({ error: "Failed to create custom avatar" });
    }
  });

  app.post("/api/avatars/:id/select", isAuthenticated, async (req, res) => {
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
  app.post("/api/voice/chat", isAuthenticated, async (req, res) => {
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

  // Context Analysis endpoints - Now accessible without login for demo
  app.get("/api/context/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Demo mode - return static context
      if (!req.user) {
        return res.json({
          hurriedScore: 30,
          analyticalScore: 50,
          conversationalScore: 60,
          recommendedMode: 'athena',
          messageCount: 5,
          avgResponseTimeSeconds: 2,
        });
      }
      
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

  app.get("/api/context/:conversationId/suggestion", async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Demo mode - return static suggestion
      if (!req.user) {
        return res.json({
          shouldSuggestChange: false,
          suggestedMode: 'athena',
          currentMode: 'athena',
          reason: 'Your current mode works well for exploring the platform.',
        });
      }
      
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

  app.get("/api/market/quotes", isAuthenticated, async (req, res) => {
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

  app.get("/api/market/historical/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const period = (req.query.period as '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | '5Y') || '1M';
      
      const historicalData = await getHistoricalData(symbol, period);
      res.json(historicalData);
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Portfolio summary route - Now accessible without login for demo
  app.get("/api/portfolio/summary", async (req, res) => {
    try {
      // If not authenticated, return demo summary
      if (!req.user) {
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
        });
      }
      
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
  app.post("/api/account/deposit", isAuthenticated, async (req, res) => {
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

  app.post("/api/account/withdraw", isAuthenticated, async (req, res) => {
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
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
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

  app.patch("/api/user/password", isAuthenticated, async (req, res) => {
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
  app.get("/api/portfolio/performance", isAuthenticated, async (req, res) => {
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

  app.get("/api/portfolio/sectors", isAuthenticated, async (req, res) => {
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

  app.get("/api/portfolio/risk-metrics", isAuthenticated, async (req, res) => {
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
  app.get("/api/analytics/correlation", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      // Always return realistic mock data for demo purposes
      const mockPairs = [
        { symbol1: 'AAPL', symbol2: 'MSFT', correlation: 0.82 },
        { symbol1: 'GOOGL', symbol2: 'META', correlation: 0.76 },
        { symbol1: 'NVDA', symbol2: 'AMD', correlation: 0.88 },
        { symbol1: 'SPY', symbol2: 'QQQ', correlation: 0.91 },
        { symbol1: 'JPM', symbol2: 'BAC', correlation: 0.84 },
        { symbol1: 'TSLA', symbol2: 'RIVN', correlation: 0.73 },
        { symbol1: 'XOM', symbol2: 'CVX', correlation: 0.79 }
      ];

      if (holdings.length < 2) {
        // Return demo data even without holdings
        return res.json({ 
          pairs: mockPairs.slice(0, 5), 
          concentrationRisk: 0.78 
        });
      }

      // Get quotes for all holdings
      const symbols = holdings.map(h => h.symbol);
      const quotes = await getBatchQuotes(symbols);

      // Calculate correlation pairs (simplified - in production would use historical data)
      const pairs = [];
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          // Check if we have mock data for this pair
          const mockPair = mockPairs.find(p => 
            (p.symbol1 === symbols[i] && p.symbol2 === symbols[j]) ||
            (p.symbol1 === symbols[j] && p.symbol2 === symbols[i])
          );
          
          const correlation = mockPair 
            ? mockPair.correlation 
            : 0.3 + Math.random() * 0.6; // Random correlation 0.3-0.9
            
          pairs.push({
            symbol1: symbols[i],
            symbol2: symbols[j],
            correlation: Number(correlation.toFixed(2)),
          });
        }
      }

      // Add some mock pairs if we don't have enough
      if (pairs.length < 5) {
        const additionalPairs = mockPairs.filter(mp => 
          !pairs.some(p => 
            (p.symbol1 === mp.symbol1 && p.symbol2 === mp.symbol2) ||
            (p.symbol1 === mp.symbol2 && p.symbol2 === mp.symbol1)
          )
        );
        pairs.push(...additionalPairs.slice(0, 5 - pairs.length));
      }

      // Calculate concentration risk (average of highest correlations)
      const highCorrelations = pairs.filter(p => p.correlation > 0.7);
      const concentrationRisk = highCorrelations.length > 0
        ? highCorrelations.reduce((sum, p) => sum + p.correlation, 0) / highCorrelations.length
        : 0.78; // Default mock value

      // Sort by correlation (highest first)
      pairs.sort((a, b) => b.correlation - a.correlation);

      res.json({
        pairs: pairs.slice(0, 6), // Return top 6 correlations
        concentrationRisk: Number(concentrationRisk.toFixed(2)),
      });
    } catch (error) {
      console.error("Correlation analysis error:", error);
      res.status(500).json({ error: "Failed to calculate correlations" });
    }
  });

  app.get("/api/analytics/factors", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      // Always return realistic factor data for demo
      const factors = [
        {
          factor: "Technology Momentum",
          exposure: 0.72,
          description: "Strong exposure to high-growth tech stocks with positive price momentum over the past 12 months.",
        },
        {
          factor: "Value",
          exposure: 0.45,
          description: "Moderate tilt toward undervalued companies trading below intrinsic value with strong cash flows.",
        },
        {
          factor: "Quality",
          exposure: 0.68,
          description: "High exposure to profitable companies with stable earnings, low debt, and consistent ROE above 15%.",
        },
        {
          factor: "Large Cap Bias",
          exposure: 0.85,
          description: "Portfolio heavily weighted toward mega-cap stocks ($100B+ market cap) with established moats.",
        },
        {
          factor: "Low Volatility",
          exposure: 0.38,
          description: "Below-average exposure to defensive stocks, suggesting higher portfolio volatility than market.",
        },
        {
          factor: "ESG Leaders",
          exposure: 0.61,
          description: "Moderate exposure to companies with strong environmental, social, and governance practices.",
        }
      ];

      res.json(factors);
    } catch (error) {
      console.error("Factor analysis error:", error);
      res.status(500).json({ error: "Failed to calculate factor exposures" });
    }
  });

  app.get("/api/analytics/regime", isAuthenticated, async (req, res) => {
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

  // Advanced portfolio analytics endpoints
  app.get("/api/analytics/performance-metrics", isAuthenticated, async (req, res) => {
    try {
      const { portfolioAnalytics } = await import("./services/portfolioAnalytics");
      const userId = (req.user as any).id;
      const metrics = await portfolioAnalytics.getPerformanceMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Performance metrics error:", error);
      res.status(500).json({ error: "Failed to calculate performance metrics" });
    }
  });

  app.get("/api/analytics/correlation-matrix", isAuthenticated, async (req, res) => {
    try {
      const { portfolioAnalytics } = await import("./services/portfolioAnalytics");
      const userId = (req.user as any).id;
      const correlations = await portfolioAnalytics.getCorrelationMatrix(userId);
      res.json(correlations);
    } catch (error) {
      console.error("Correlation matrix error:", error);
      res.status(500).json({ error: "Failed to calculate correlation matrix" });
    }
  });

  app.get("/api/analytics/risk-metrics", isAuthenticated, async (req, res) => {
    try {
      const { portfolioAnalytics } = await import("./services/portfolioAnalytics");
      const userId = (req.user as any).id;
      const riskMetrics = await portfolioAnalytics.getRiskMetrics(userId);
      res.json(riskMetrics);
    } catch (error) {
      console.error("Risk metrics error:", error);
      res.status(500).json({ error: "Failed to calculate risk metrics" });
    }
  });

  app.get("/api/analytics/stress-test", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const holdings = await storage.getUserHoldings(userId);

      // Always return realistic stress test data for demo
      const scenarios = [
        {
          scenario: "2008 Financial Crisis",
          portfolioImpact: -42.3,
          description: "Global banking collapse and liquidity crisis. Tech stocks fell 45%, financials dropped 60%. Portfolio beta of 1.2 would amplify losses.",
          year: "Sep 2008 - Mar 2009",
        },
        {
          scenario: "COVID-19 Pandemic",
          portfolioImpact: -31.7,
          description: "Fastest bear market in history followed by unprecedented fiscal stimulus. Technology outperformed, travel/energy severely impacted.",
          year: "Feb - Mar 2020",
        },
        {
          scenario: "Dot-com Bubble Burst",
          portfolioImpact: -58.2,
          description: "NASDAQ fell 78% from peak. High P/E tech stocks decimated. Your current tech concentration would face severe drawdowns.",
          year: "2000-2002",
        },
        {
          scenario: "Black Monday 1987",
          portfolioImpact: -22.6,
          description: "Single-day 22% market crash. Program trading and portfolio insurance failures. Rapid recovery within months.",
          year: "Oct 19, 1987",
        },
        {
          scenario: "Fed Rate Hike Cycle",
          portfolioImpact: -18.4,
          description: "Aggressive rate increases to combat inflation. Growth stocks underperform, value and financials outperform.",
          year: "2022 Scenario",
        },
        {
          scenario: "European Debt Crisis",
          portfolioImpact: -15.8,
          description: "Sovereign debt concerns spread contagion. US markets fell 19%, European banks particularly affected.",
          year: "2011-2012",
        }
      ];

      res.json(scenarios);
    } catch (error) {
      console.error("Stress test error:", error);
      res.status(500).json({ error: "Failed to run stress tests" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  // Initialize market streaming service
  const marketStream = new MarketStreamService(wss);

  // Cleanup on server shutdown
  process.on('SIGINT', () => {
    marketStream.cleanup();
    process.exit();
  });

  return httpServer;
}
