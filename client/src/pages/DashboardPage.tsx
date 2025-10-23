import { useQuery } from "@tanstack/react-query";
import MarketDataTile from "@/components/MarketDataTile";
import TradeSuggestion from "@/components/TradeSuggestion";
import WatchlistCard from "@/components/WatchlistCard";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: string;
  price: string;
  reasoning: string | null;
  confidence: string | null;
  status: string;
}

function DashboardPageContent() {
  const { toast } = useToast();

  const { data: pendingTrades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades/pending"],
  });

  const handleApprove = async (tradeId: string) => {
    try {
      await apiJson("PATCH", `/api/trades/${tradeId}/status`, { status: "approved" });
      
      toast({
        title: "Trade Approved",
        description: "The trade has been approved successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/trades/pending"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve trade",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (tradeId: string) => {
    try {
      await apiJson("PATCH", `/api/trades/${tradeId}/status`, { status: "rejected" });
      
      toast({
        title: "Trade Declined",
        description: "The trade has been declined.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/trades/pending"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline trade",
        variant: "destructive",
      });
    }
  };

  const marketData = [
    { symbol: "S&P 500", name: "Index", price: 4532.76, change: 12.45, changePercent: 0.28 },
    { symbol: "NASDAQ", name: "Index", price: 14234.18, change: -23.17, changePercent: -0.16 },
    { symbol: "DOW", name: "Index", price: 35467.89, change: 54.32, changePercent: 0.15 },
    { symbol: "BTC", name: "Bitcoin", price: 42156.78, change: 1234.56, changePercent: 3.02 },
  ];

  return (
    <div className="min-h-screen bg-black px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
      <div className="max-w-[1600px] mx-auto space-y-12 lg:space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight mb-3 lg:mb-4">
            Dashboard
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground font-light">
            Your investment command center
          </p>
        </div>

        {/* Market Overview */}
        <section>
          <h2 className="text-4xl font-extralight text-foreground mb-8">
            Market Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketData.map((data) => (
              <MarketDataTile key={data.symbol} {...data} />
            ))}
          </div>
        </section>

        {/* AI Trade Suggestions */}
        {pendingTrades.length > 0 && (
          <section>
            <h2 className="text-4xl font-extralight text-foreground mb-8">
              AI Trade Suggestions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pendingTrades.map((trade) => (
                <TradeSuggestion
                  key={trade.id}
                  symbol={trade.symbol}
                  action={trade.type.toUpperCase() as "BUY" | "SELL"}
                  shares={parseFloat(trade.quantity)}
                  price={parseFloat(trade.price)}
                  reasoning={trade.reasoning || "AI-generated trade suggestion"}
                  confidence={parseFloat(trade.confidence || "75")}
                  onApprove={() => handleApprove(trade.id)}
                  onDecline={() => handleDecline(trade.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Watchlist */}
        <section>
          <WatchlistCard />
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
