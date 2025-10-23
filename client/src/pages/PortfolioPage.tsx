import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import PortfolioCard from "@/components/PortfolioCard";
import GlassCard from "@/components/GlassCard";
import { ProtectedRoute, useAuth } from "@/lib/auth";

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

function PortfolioPageContent() {
  const { logout } = useAuth();

  const { data: holdings = [], isLoading } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

  // Mock current prices - in a real app, this would come from a market data API
  const getMockPrice = (symbol: string) => {
    const prices: Record<string, number> = {
      AAPL: 178.32,
      MSFT: 378.91,
      TSLA: 242.84,
      NVDA: 495.32,
      GOOGL: 141.80,
      AMZN: 152.74,
    };
    return prices[symbol] || 100;
  };

  const calculateMetrics = () => {
    if (!holdings.length) return { totalValue: 0, totalChange: 0, totalChangePercent: 0 };

    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach((h) => {
      const currentPrice = getMockPrice(h.symbol);
      const quantity = parseFloat(h.quantity);
      const avgCost = parseFloat(h.averageCost);
      
      totalValue += currentPrice * quantity;
      totalCost += avgCost * quantity;
    });

    const totalChange = totalValue - totalCost;
    const totalChangePercent = (totalChange / totalCost) * 100;

    return { totalValue, totalChange, totalChangePercent };
  };

  const { totalValue, totalChange, totalChangePercent } = calculateMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-foreground">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader onLogout={logout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-5xl font-extralight text-foreground mb-2">Portfolio</h2>
          <p className="text-muted-foreground">Track your investments in real-time</p>
        </div>

        <GlassCard className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Value</p>
              <p className="text-5xl font-extralight text-foreground">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Change</p>
              <p className={`text-3xl font-light ${totalChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Performance</p>
              <p className={`text-3xl font-light ${totalChangePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </GlassCard>

        {holdings.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-foreground text-xl mb-2">No holdings yet</p>
              <p className="text-muted-foreground">Start by talking to Athena about investment opportunities</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holdings.map((holding) => {
              const currentPrice = getMockPrice(holding.symbol);
              const quantity = parseFloat(holding.quantity);
              const avgCost = parseFloat(holding.averageCost);
              const totalValue = currentPrice * quantity;
              const change = (currentPrice - avgCost) * quantity;
              const changePercent = ((currentPrice - avgCost) / avgCost) * 100;

              return (
                <PortfolioCard
                  key={holding.id}
                  symbol={holding.symbol}
                  name={`${holding.symbol} Inc.`}
                  shares={quantity}
                  currentPrice={currentPrice}
                  totalValue={totalValue}
                  change={change}
                  changePercent={changePercent}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioPageContent />
    </ProtectedRoute>
  );
}
