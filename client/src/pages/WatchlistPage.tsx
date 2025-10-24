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
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import { TickerLink } from "@/components/TickerLink";
import { EnhancedStockCard } from "@/components/EnhancedStockCard";
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
  
  const handleOpenTradeModal = (action: 'buy' | 'sell', symbol: string) => {
    setBuyModalSymbol(symbol);
  };

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
      <NavigationBreadcrumbs />
      <div className="px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-2">
                Watchlist
              </h1>
              <p className="text-muted-foreground font-normal">
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
        </div>

        {/* Add Stock Form */}
        {isAddingStock && (
          <div className="glass rounded-[28px] p-8 mb-8 border border-white/10">
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
          <div className="glass rounded-[28px] p-16 border border-white/10 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((item) => (
              <div key={item.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMutation.mutate(item.id)}
                  disabled={removeMutation.isPending}
                  className="absolute top-2 right-2 z-10 rounded-full bg-black/50 hover:bg-black/70"
                  data-testid={`button-remove-${item.symbol}`}
                >
                  <X className="w-4 h-4" />
                </Button>
                <EnhancedStockCard
                  symbol={item.symbol}
                  quote={quotes[item.symbol]} // Pass batched quote to avoid N+1 queries
                  onBuy={(symbol) => setBuyModalSymbol(symbol)}
                  className={updatedSymbols.has(item.symbol) ? 'animate-data-glow' : ''}
                />
              </div>
            ))}
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
