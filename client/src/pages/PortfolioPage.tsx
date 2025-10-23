import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PortfolioCard from "@/components/PortfolioCard";
import { ProtectedRoute } from "@/lib/auth";
import AddHoldingModal from "@/components/AddHoldingModal";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import type { PortfolioSummary } from "@shared/schema";

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

function PortfolioPageContent() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { data: holdings = [], isLoading: holdingsLoading } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  const isLoading = holdingsLoading || summaryLoading;

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

  // Use summary API data if available, otherwise fallback to calculated values
  const totalValue = summary?.totalValue || 0;
  const totalGain = summary?.totalGain || 0;
  const totalGainPercent = summary?.totalGainPercent || 0;

  // Handle chat with Athena
  const handleChatWithAthena = () => {
    const orbButton = document.querySelector('[data-testid="button-floating-athena"]') as HTMLElement;
    if (orbButton) {
      orbButton.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="text-foreground text-xl md:text-2xl font-extralight">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      <div className="px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto space-y-12 lg:space-y-16">
        {/* Header */}
        <div>
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight mb-3 lg:mb-4">
                Portfolio
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground font-light">
                Track your investments in real-time
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-primary hover:bg-primary/90 px-6 py-3"
              data-testid="button-add-holding-trigger"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="glass rounded-[28px] p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-light uppercase tracking-wider">
                Total Value
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground" data-testid="text-total-value">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-light uppercase tracking-wider">
                Total Gain
              </p>
              <p className={`text-3xl md:text-4xl lg:text-5xl font-extralight ${totalGain >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-light uppercase tracking-wider">
                Performance
              </p>
              <p className={`text-3xl md:text-4xl lg:text-5xl font-extralight ${totalGainPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Holdings */}
        {holdings.length === 0 ? (
          <div className="glass rounded-[28px] p-12 md:p-16 lg:p-20">
            <div className="text-center">
              <p className="text-foreground text-2xl md:text-3xl font-extralight mb-4">Your portfolio is ready to grow</p>
              <p className="text-muted-foreground font-light text-base md:text-lg mb-8">
                Start building your investment portfolio with Athena's guidance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleChatWithAthena}
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 px-8"
                  data-testid="button-portfolio-chat"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Athena
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8"
                  data-testid="button-portfolio-start"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start Investing
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm pb-4 -mt-4 pt-4 mb-4">
              <h2 className="text-4xl font-extralight text-foreground">Your Holdings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      
      <AddHoldingModal open={showAddModal} onOpenChange={setShowAddModal} />
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
