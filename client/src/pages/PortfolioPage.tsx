import { useQuery } from "@tanstack/react-query";
import PortfolioCard from "@/components/PortfolioCard";
import { ProtectedRoute } from "@/lib/auth";

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

function PortfolioPageContent() {
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
    const totalChangePercent = totalCost > 0 ? (totalChange / totalCost) * 100 : 0;

    return { totalValue, totalChange, totalChangePercent };
  };

  const { totalValue, totalChange, totalChangePercent } = calculateMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-foreground text-lg font-light">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-6xl font-extralight text-foreground tracking-tight mb-3">
            Portfolio
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Track your investments in real-time
          </p>
        </div>

        {/* Summary Card */}
        <div className="glass rounded-[28px] p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-light uppercase tracking-wide">
                Total Value
              </p>
              <p className="text-5xl font-extralight text-foreground" data-testid="text-total-value">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-light uppercase tracking-wide">
                Total Change
              </p>
              <p className={`text-4xl font-light ${totalChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-light uppercase tracking-wide">
                Performance
              </p>
              <p className={`text-4xl font-light ${totalChangePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Holdings */}
        {holdings.length === 0 ? (
          <div className="glass rounded-[28px] p-16">
            <div className="text-center">
              <p className="text-foreground text-2xl font-light mb-3">No holdings yet</p>
              <p className="text-muted-foreground font-light">
                Start by talking to Athena about investment opportunities
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-light text-foreground mb-6">Your Holdings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {holdings.map((holding) => {
                const currentPrice = getMockPrice(holding.symbol);
                const quantity = parseFloat(holding.quantity);
                const avgCost = parseFloat(holding.averageCost);
                const totalValue = currentPrice * quantity;
                const totalCost = avgCost * quantity;
                const change = totalValue - totalCost;
                const changePercent = (change / totalCost) * 100;

                return (
                  <PortfolioCard
                    key={holding.id}
                    symbol={holding.symbol}
                    name={holding.symbol}
                    shares={quantity}
                    currentPrice={currentPrice}
                    totalValue={totalValue}
                    change={change}
                    changePercent={changePercent}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
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
