import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: string;
}

export default function WatchlistCard() {
  const [newSymbol, setNewSymbol] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const { data: watchlist = [] } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  const getMockPrice = (symbol: string) => {
    const prices: Record<string, number> = {
      AAPL: 178.32,
      MSFT: 378.91,
      TSLA: 242.84,
      NVDA: 495.32,
      GOOGL: 141.80,
      AMZN: 152.74,
      NFLX: 487.23,
      META: 342.56,
    };
    return prices[symbol] || 100;
  };

  const getMockChange = (symbol: string) => {
    const changes: Record<string, number> = {
      AAPL: 2.34,
      MSFT: -1.23,
      TSLA: 5.67,
      NVDA: 8.91,
      GOOGL: -0.45,
      AMZN: 3.21,
      NFLX: -2.15,
      META: 4.56,
    };
    return changes[symbol] || 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    setIsAdding(true);
    try {
      await apiJson("POST", "/api/watchlist", {
        symbol: newSymbol.toUpperCase(),
      });

      toast({
        title: "Added to Watchlist",
        description: `${newSymbol.toUpperCase()} has been added to your watchlist`,
      });

      setNewSymbol("");
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to watchlist",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string, symbol: string) => {
    try {
      await apiJson("DELETE", `/api/watchlist/${id}`, {});

      toast({
        title: "Removed from Watchlist",
        description: `${symbol} has been removed from your watchlist`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from watchlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass rounded-[28px] p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-extralight text-foreground">Watchlist</h3>
      </div>

      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-2">
          <Input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol (e.g., AAPL)"
            className="rounded-[28px] bg-white/5 border-white/10 text-foreground uppercase"
            maxLength={10}
            data-testid="input-watchlist-symbol"
          />
          <Button
            type="submit"
            disabled={isAdding || !newSymbol.trim()}
            className="rounded-full bg-primary hover:bg-primary/90 px-4"
            data-testid="button-add-watchlist"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {watchlist.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No stocks in your watchlist yet
          </p>
        ) : (
          watchlist.map((item) => {
            const price = getMockPrice(item.symbol);
            const change = getMockChange(item.symbol);
            const changePercent = ((change / price) * 100).toFixed(2);
            const isPositive = change >= 0;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 glass-hover rounded-[20px]"
                data-testid={`watchlist-item-${item.symbol}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-foreground">
                      {item.symbol}
                    </span>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-foreground">
                      ${price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {change.toFixed(2)} ({changePercent}%)
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.id, item.symbol)}
                  className="rounded-full h-8 w-8"
                  data-testid={`button-remove-watchlist-${item.symbol}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
