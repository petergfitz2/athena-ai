import { WebSocket, WebSocketServer } from "ws";
import { getQuote, getBatchQuotes } from "./marketService";
import { storage } from "../storage";

interface StreamClient {
  ws: WebSocket;
  userId?: string;
  watchlist: Set<string>;
  holdings: Set<string>;
  subscribedChannels: Set<string>;
}

interface MarketUpdate {
  type: "price" | "index" | "news" | "sentiment";
  timestamp: string;
  data: any;
}

class MarketStreamService {
  private clients: Map<WebSocket, StreamClient> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private indexUpdateInterval: NodeJS.Timeout | null = null;
  private updateFrequency = 5000; // 5 seconds for demo, would be real-time in production

  constructor(private wss: WebSocketServer) {
    this.setupWebSocketHandlers();
    this.startMarketUpdates();
  }

  private setupWebSocketHandlers() {
    this.wss.on("connection", (ws) => {
      console.log("[MarketStream] Client connected");
      
      // Initialize client
      const client: StreamClient = {
        ws,
        watchlist: new Set(),
        holdings: new Set(),
        subscribedChannels: new Set(["market-indices"]) // Default subscription
      };
      
      this.clients.set(ws, client);

      // Send welcome message
      this.sendToClient(ws, {
        type: "connection",
        status: "connected",
        message: "Connected to Athena market stream"
      });

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleClientMessage(ws, data);
        } catch (error) {
          console.error("[MarketStream] Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        console.log("[MarketStream] Client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("[MarketStream] WebSocket error:", error);
        this.clients.delete(ws);
      });
    });
  }

  private async handleClientMessage(ws: WebSocket, message: any) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case "authenticate":
        client.userId = message.userId;
        await this.loadUserSymbols(client);
        break;
        
      case "subscribe":
        if (message.symbols) {
          message.symbols.forEach((symbol: string) => {
            client.watchlist.add(symbol.toUpperCase());
          });
        }
        if (message.channels) {
          message.channels.forEach((channel: string) => {
            client.subscribedChannels.add(channel);
          });
        }
        break;
        
      case "unsubscribe":
        if (message.symbols) {
          message.symbols.forEach((symbol: string) => {
            client.watchlist.delete(symbol.toUpperCase());
          });
        }
        if (message.channels) {
          message.channels.forEach((channel: string) => {
            client.subscribedChannels.delete(channel);
          });
        }
        break;
        
      case "ping":
        this.sendToClient(ws, { type: "pong", timestamp: new Date().toISOString() });
        break;
    }
  }

  private async loadUserSymbols(client: StreamClient) {
    if (!client.userId) return;
    
    try {
      // Load user's holdings
      const holdings = await storage.getUserHoldings(client.userId);
      holdings.forEach(holding => {
        if (holding.symbol) {
          client.holdings.add(holding.symbol);
        }
      });
      
      // Load user's watchlist
      const watchlist = await storage.getUserWatchlist(client.userId);
      watchlist.forEach(item => {
        if (item.symbol) {
          client.watchlist.add(item.symbol);
        }
      });
      
      // Send initial data
      await this.sendInitialData(client);
    } catch (error) {
      console.error("[MarketStream] Error loading user symbols:", error);
    }
  }

  private async sendInitialData(client: StreamClient) {
    // Send current prices for holdings
    if (client.holdings.size > 0) {
      const symbols = Array.from(client.holdings);
      try {
        const quotes = await getBatchQuotes(symbols);
        this.sendToClient(client.ws, {
          type: "initial-prices",
          data: quotes
        });
      } catch (error) {
        console.error("[MarketStream] Error fetching initial prices:", error);
      }
    }
  }

  private startMarketUpdates() {
    // Update prices periodically
    this.priceUpdateInterval = setInterval(async () => {
      await this.broadcastPriceUpdates();
    }, this.updateFrequency);

    // Update market indices
    this.indexUpdateInterval = setInterval(async () => {
      await this.broadcastIndexUpdates();
    }, this.updateFrequency * 2); // Less frequent for indices
  }

  private async broadcastPriceUpdates() {
    // Collect all unique symbols from all clients
    const allSymbols = new Set<string>();
    
    this.clients.forEach(client => {
      client.holdings.forEach(symbol => allSymbols.add(symbol));
      client.watchlist.forEach(symbol => allSymbols.add(symbol));
    });

    if (allSymbols.size === 0) return;

    try {
      const symbols = Array.from(allSymbols);
      const quotesMap = await getBatchQuotes(symbols);
      const quotesArray = Array.from(quotesMap.values());
      
      // Create price update with realistic variations
      const priceUpdate: MarketUpdate = {
        type: "price",
        timestamp: new Date().toISOString(),
        data: quotesArray.map(quote => ({
          ...quote,
          // Add some realistic price movement for demo
          change: quote.change + (Math.random() - 0.5) * 0.1,
          changePercent: quote.changePercent + (Math.random() - 0.5) * 0.05,
          // Add bid/ask spread
          bid: quote.price - 0.01,
          ask: quote.price + 0.01,
          volume: Math.floor((quote.volume || 0) + Math.random() * 10000),
          // Add intraday high/low
          dayHigh: Math.max(quote.price, quote.high || quote.price),
          dayLow: Math.min(quote.price, quote.low || quote.price),
        }))
      };

      // Send to relevant clients
      this.clients.forEach(client => {
        const relevantQuotes = priceUpdate.data.filter((quote: any) => 
          client.holdings.has(quote.symbol) || client.watchlist.has(quote.symbol)
        );
        
        if (relevantQuotes.length > 0) {
          this.sendToClient(client.ws, {
            ...priceUpdate,
            data: relevantQuotes
          });
        }
      });
    } catch (error) {
      console.error("[MarketStream] Error broadcasting price updates:", error);
    }
  }

  private async broadcastIndexUpdates() {
    try {
      // Mock market indices with realistic movements
      const indices = [
        { 
          symbol: "^DJI", 
          name: "Dow Jones", 
          price: 38654.42 + (Math.random() - 0.5) * 100,
          change: (Math.random() - 0.5) * 200,
          changePercent: (Math.random() - 0.5) * 1
        },
        { 
          symbol: "^GSPC", 
          name: "S&P 500", 
          price: 5078.18 + (Math.random() - 0.5) * 20,
          change: (Math.random() - 0.5) * 30,
          changePercent: (Math.random() - 0.5) * 0.8
        },
        { 
          symbol: "^IXIC", 
          name: "NASDAQ", 
          price: 15996.82 + (Math.random() - 0.5) * 50,
          change: (Math.random() - 0.5) * 80,
          changePercent: (Math.random() - 0.5) * 1.2
        },
        { 
          symbol: "^VIX", 
          name: "VIX", 
          price: 13.78 + (Math.random() - 0.5) * 2,
          change: (Math.random() - 0.5) * 1,
          changePercent: (Math.random() - 0.5) * 5
        }
      ];

      const indexUpdate: MarketUpdate = {
        type: "index",
        timestamp: new Date().toISOString(),
        data: indices
      };

      // Broadcast to clients subscribed to market indices
      this.clients.forEach(client => {
        if (client.subscribedChannels.has("market-indices")) {
          this.sendToClient(client.ws, indexUpdate);
        }
      });
    } catch (error) {
      console.error("[MarketStream] Error broadcasting index updates:", error);
    }
  }

  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  public broadcastToAll(data: any) {
    this.clients.forEach(client => {
      this.sendToClient(client.ws, data);
    });
  }

  public broadcastToUser(userId: string, data: any) {
    this.clients.forEach(client => {
      if (client.userId === userId) {
        this.sendToClient(client.ws, data);
      }
    });
  }

  public cleanup() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.indexUpdateInterval) {
      clearInterval(this.indexUpdateInterval);
    }
  }
}

export default MarketStreamService;