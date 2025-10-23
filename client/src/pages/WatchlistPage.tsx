import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, TrendingUp, TrendingDown, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MarketQuote } from "@shared/schema";
import Navigation from "@/components/Navigation";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import { useLocation } from "wouter";

interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
}

function WatchlistPageContent() {
  const { toast } = useToast();
  const [newSymbol, setNewSymbol] = useState("");
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [buyModalSymbol, setBuyModalSymbol] = useState<string | null>(null);
  const [updatedSymbols, setUpdatedSymbols] = useState<Set<string>>(new Set());
  const prevQuotesRef = useRef<Record<string, MarketQuote>>({});

  // Fetch watchlist
  const { data: watchlist = [], isLoading: watchlistLoading, error: watchlistError } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  // Fetch quotes for watchlist symbols
  const symbols = watchlist.map(item => item.symbol);
  const { data: quotes = {}, error: quotesError } = useQuery<Record<string, MarketQuote>>({
    queryKey: ["/api/market/quotes-batch", symbols],
    queryFn: async () => {
      if (symbols.length === 0) return {};
      const response = await fetch(`/api/market/quotes-batch?symbols=${symbols.join(',')}`);
      if (!response.ok) throw new Error("Failed to fetch quotes");
      return response.json();
    },
    enabled: symbols.length > 0,
    refetchInterval: 60000, // Refresh every minute
  });

  // Detect price changes and trigger glow animation
  useEffect(() => {
    const newUpdatedSymbols = new Set<string>();
    
    Object.keys(quotes).forEach(symbol => {
      const currentQuote = quotes[symbol];
      const prevQuote = prevQuotesRef.current[symbol];
      
      // Check if price changed
      if (prevQuote && currentQuote.price !== prevQuote.price) {
        newUpdatedSymbols.add(symbol);
        
        // Remove the glow after animation completes
        setTimeout(() => {
          setUpdatedSymbols(prev => {
            const next = new Set(prev);
            next.delete(symbol);
            return next;
          });
        }, 800); // Match animation duration
      }
    });
    
    if (newUpdatedSymbols.size > 0) {
      setUpdatedSymbols(prev => new Set([...Array.from(prev), ...Array.from(newUpdatedSymbols)]));
    }
    
    // Update prev quotes reference
    prevQuotesRef.current = quotes;
  }, [quotes]);

  // Add to watchlist
  const addMutation = useMutation({
    mutationFn: async (symbol: string) => {
      return apiRequest("POST", "/api/watchlist", { symbol: symbol.toUpperCase() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to Watchlist",
        description: `${newSymbol.toUpperCase()} has been added to your watchlist.`,
      });
      setNewSymbol("");
      setIsAddingStock(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add stock to watchlist",
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/watchlist/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from Watchlist",
        description: "Stock has been removed from your watchlist.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove stock",
        variant: "destructive",
      });
    },
  });

  const handleAddStock = () => {
    if (!newSymbol.trim()) return;
    addMutation.mutate(newSymbol.trim());
  };

  if (watchlistLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <p className="text-muted-foreground">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (watchlistError) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load watchlist</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] })} className="rounded-full">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground mb-2">
              Watchlist
            </h1>
            <p className="text-muted-foreground font-light">
              Monitor stocks you're interested in
            </p>
          </div>
          <Button
            onClick={() => setIsAddingStock(!isAddingStock)}
            className="rounded-full gap-2"
            data-testid="button-toggle-add-stock"
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </Button>
        </div>

        {/* Add Stock Form */}
        {isAddingStock && (
          <div className="glass rounded-[28px] p-8 mb-8">
            <h3 className="text-xl font-light text-foreground mb-4">Add to Watchlist</h3>
            <div className="flex gap-4">
              <Input
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddStock()}
                placeholder="Stock Symbol (e.g., AAPL)"
                className="rounded-[28px] bg-white/5 border-white/10 text-foreground"
                disabled={addMutation.isPending}
                data-testid="input-stock-symbol"
              />
              <Button
                onClick={handleAddStock}
                disabled={!newSymbol.trim() || addMutation.isPending}
                className="rounded-full px-8"
                data-testid="button-add-to-watchlist"
              >
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingStock(false);
                  setNewSymbol("");
                }}
                className="rounded-full"
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Watchlist Grid */}
        {watchlist.length === 0 ? (
          <div className="glass rounded-[28px] p-16 text-center">
            <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-light text-foreground mb-2">Your Watchlist is Empty</h3>
            <p className="text-muted-foreground mb-6">
              Add stocks to monitor their performance and stay updated
            </p>
            <Button
              onClick={() => setIsAddingStock(true)}
              className="rounded-full gap-2"
              data-testid="button-add-first-stock"
            >
              <Plus className="w-5 h-5" />
              Add Your First Stock
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => {
              const quote = quotes[item.symbol];
              const isPositive = quote && quote.changePercent >= 0;

              return (
                <div
                  key={item.id}
                  className={`glass rounded-[28px] p-8 hover-elevate transition-all ${
                    updatedSymbols.has(item.symbol) ? 'animate-data-glow' : ''
                  }`}
                  data-testid={`watchlist-item-${item.symbol}`}
                >
                  {/* Header with symbol and remove button */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-3xl font-light text-foreground mb-1">
                        {item.symbol}
                      </h3>
                      {quote && (
                        <p className="text-xs text-muted-foreground">
                          Vol: {quote.volume?.toLocaleString() || "N/A"}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(item.id)}
                      disabled={removeMutation.isPending}
                      className="rounded-full -mt-2 -mr-2"
                      data-testid={`button-remove-${item.symbol}`}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Price & Change */}
                  {quote ? (
                    <div className="mb-6">
                      <p className="text-4xl font-light text-foreground mb-2">
                        ${quote.price.toFixed(2)}
                      </p>
                      <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span className="text-lg font-light">
                          {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-muted-foreground">Loading price...</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  {quote && (
                    <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">High</p>
                        <p className="text-sm font-light text-foreground">
                          ${quote.high?.toFixed(2) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Low</p>
                        <p className="text-sm font-light text-foreground">
                          ${quote.low?.toFixed(2) || "N/A"}
                        </p>
                      </div>
                      {quote.marketCap && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                          <p className="text-sm font-light text-foreground">
                            ${(quote.marketCap / 1e9).toFixed(2)}B
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBuyModalSymbol(item.symbol)}
                      className="rounded-full flex-1 gap-2"
                      data-testid={`button-buy-${item.symbol}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Buy Modal */}
      <ExecuteTradeModal
        open={!!buyModalSymbol}
        onOpenChange={(open) => !open && setBuyModalSymbol(null)}
        action="buy"
        prefilledSymbol={buyModalSymbol || undefined}
      />
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistPageContent />
    </ProtectedRoute>
  );
}
