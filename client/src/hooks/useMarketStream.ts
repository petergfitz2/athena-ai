import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MarketUpdate {
  type: "price" | "index" | "news" | "sentiment";
  timestamp: string;
  data: any;
}

interface StreamStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}

interface MarketStreamOptions {
  symbols?: string[];
  channels?: string[];
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useMarketStream(options: MarketStreamOptions = {}) {
  const { 
    symbols = [], 
    channels = ["market-indices"], 
    autoReconnect = true, 
    reconnectInterval = 5000 
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [status, setStatus] = useState<StreamStatus>({
    connected: false,
    reconnecting: false,
    error: null
  });
  
  const [latestPrices, setLatestPrices] = useState<Map<string, any>>(new Map());
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log("[MarketStream] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[MarketStream] Connected");
        setStatus({ connected: true, reconnecting: false, error: null });
        
        // Authenticate if user is logged in
        if (user) {
          ws.send(JSON.stringify({
            type: "authenticate",
            userId: user.id
          }));
        }
        
        // Subscribe to symbols and channels
        if (symbols.length > 0 || channels.length > 0) {
          ws.send(JSON.stringify({
            type: "subscribe",
            symbols: symbols,
            channels: channels
          }));
        }
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("[MarketStream] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[MarketStream] WebSocket error:", error);
        setStatus(prev => ({ ...prev, error: "Connection error" }));
      };

      ws.onclose = () => {
        console.log("[MarketStream] Disconnected");
        setStatus({ connected: false, reconnecting: autoReconnect, error: null });
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[MarketStream] Attempting to reconnect...");
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error("[MarketStream] Failed to connect:", error);
      setStatus({ connected: false, reconnecting: false, error: "Failed to connect" });
    }
  }, [user, symbols, channels, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus({ connected: false, reconnecting: false, error: null });
  }, []);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case "connection":
        console.log("[MarketStream]", message.message);
        break;
        
      case "initial-prices":
      case "price":
        // Update price data
        setLatestPrices(prev => {
          const newPrices = new Map(prev);
          if (Array.isArray(message.data)) {
            message.data.forEach((quote: any) => {
              newPrices.set(quote.symbol, quote);
            });
          }
          return newPrices;
        });
        setLastUpdate(message.timestamp || new Date().toISOString());
        break;
        
      case "index":
        // Update market indices
        setMarketIndices(message.data || []);
        setLastUpdate(message.timestamp || new Date().toISOString());
        break;
        
      case "news":
        // Handle news updates (could emit events or update state)
        console.log("[MarketStream] News update:", message.data);
        break;
        
      case "sentiment":
        // Handle sentiment updates
        console.log("[MarketStream] Sentiment update:", message.data);
        break;
        
      case "pong":
        // Heartbeat response
        break;
        
      default:
        console.log("[MarketStream] Unknown message type:", message.type);
    }
  }, []);

  const subscribe = useCallback((newSymbols: string[], newChannels?: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "subscribe",
        symbols: newSymbols,
        channels: newChannels
      }));
    }
  }, []);

  const unsubscribe = useCallback((removeSymbols: string[], removeChannels?: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "unsubscribe",
        symbols: removeSymbols,
        channels: removeChannels
      }));
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Re-subscribe when symbols or channels change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      subscribe(symbols, channels);
    }
  }, [symbols, channels, subscribe]);

  return {
    status,
    latestPrices,
    marketIndices,
    lastUpdate,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
}