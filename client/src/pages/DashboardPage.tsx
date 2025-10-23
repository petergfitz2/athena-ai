import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import MarketDataTile from "@/components/MarketDataTile";
import TradeSuggestion from "@/components/TradeSuggestion";
import GlassCard from "@/components/GlassCard";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: pendingTrades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades/pending"],
  });

  const handleApprove = async (tradeId: string) => {
    try {
      await apiRequest("PATCH", `/api/trades/${tradeId}/status`, { status: "approved" });
      
      toast({
        title: "Trade Approved",
        description: "The trade has been approved successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/trades/pending"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve trade",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (tradeId: string) => {
    try {
      await apiRequest("PATCH", `/api/trades/${tradeId}/status`, { status: "rejected" });
      
      toast({
        title: "Trade Declined",
        description: "The trade has been declined.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/trades/pending"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline trade",
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
    <div className="min-h-screen bg-black">
      <DashboardHeader onLogout={logout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-5xl font-extralight text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Your investment command center</p>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-light text-foreground mb-4">Market Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.map((data) => (
              <MarketDataTile key={data.symbol} {...data} />
            ))}
          </div>
        </div>

        {pendingTrades.length > 0 && (
          <div>
            <h3 className="text-2xl font-light text-foreground mb-4">AI Trade Suggestions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        )}
      </main>
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
