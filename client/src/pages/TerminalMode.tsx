import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useModeSuggestion } from "@/hooks/useConversationContext";
import ModeSwitcherMenu from "@/components/ModeSwitcherMenu";
import ModeSuggestion from "@/components/ModeSuggestion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { apiJson } from "@/lib/queryClient";

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

function TerminalModeContent() {
  useKeyboardShortcuts();
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { suggestion, shouldShow, dismissSuggestion } = useModeSuggestion(conversationId);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await apiJson<{ id: string }>("POST", "/api/conversations", {
          title: "Terminal Mode Session",
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, []);
  
  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

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

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const price = getMockPrice(holding.symbol);
      const quantity = parseFloat(holding.quantity);
      return total + (price * quantity);
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const dailyChange = 2847.32;
  const dailyChangePercent = 2.3;

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Header - Compact */}
      <div className="flex-shrink-0 border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extralight text-foreground">Terminal</h1>
            <ModeSwitcherMenu />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="text-lg font-light text-foreground">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className={`text-lg font-light ${dailyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {dailyChange >= 0 ? '+' : ''}{dailyChangePercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 overflow-auto">
        {/* Markets Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Markets
          </h2>
          <div className="space-y-3">
            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">S&P 500</p>
                  <p className="text-xs text-muted-foreground">SPX</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">4,521.23</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +0.8%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">NASDAQ</p>
                  <p className="text-xs text-muted-foreground">COMP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">14,167.89</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +1.2%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">Dow Jones</p>
                  <p className="text-xs text-muted-foreground">DJI</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">35,284.52</p>
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -0.3%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">VIX</p>
                  <p className="text-xs text-muted-foreground">Volatility</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">14.23</p>
                  <p className="text-xs text-muted-foreground">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Holdings</h2>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No holdings</p>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding) => {
                const currentPrice = getMockPrice(holding.symbol);
                const avgCost = parseFloat(holding.averageCost);
                const quantity = parseFloat(holding.quantity);
                const totalValue = currentPrice * quantity;
                const totalCost = avgCost * quantity;
                const gain = totalValue - totalCost;
                const gainPercent = ((gain / totalCost) * 100).toFixed(2);

                return (
                  <div key={holding.id} className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-foreground">{holding.symbol}</p>
                        <p className="text-xs text-muted-foreground">{quantity} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">${totalValue.toLocaleString()}</p>
                        <p className={`text-xs ${parseFloat(gainPercent) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {parseFloat(gainPercent) >= 0 ? '+' : ''}{gainPercent}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: ${avgCost.toFixed(2)}</span>
                      <span>Current: ${currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Analysis</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
              <p className="text-2xl font-light text-foreground">1.82</p>
              <p className="text-xs text-success">Above average</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beta</p>
              <p className="text-2xl font-light text-foreground">1.15</p>
              <p className="text-xs text-muted-foreground">vs S&P 500</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volatility</p>
              <p className="text-2xl font-light text-foreground">18.3%</p>
              <p className="text-xs text-warning">Moderate</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
              <p className="text-2xl font-light text-destructive">-12.4%</p>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
          </div>
        </div>

        {/* News & Intelligence Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Intelligence</h2>
          <div className="space-y-3">
            <div className="pb-3 border-b border-white/5">
              <p className="text-xs text-primary mb-1">13F Filing</p>
              <p className="text-sm text-foreground mb-1">
                15 hedge funds initiated NVDA positions
              </p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>

            <div className="pb-3 border-b border-white/5">
              <p className="text-xs text-accent mb-1">Insider Transaction</p>
              <p className="text-sm text-foreground mb-1">
                AAPL CEO purchased $2M in shares
              </p>
              <p className="text-xs text-muted-foreground">5 hours ago</p>
            </div>

            <div className="pb-3 border-b border-white/5">
              <p className="text-xs text-warning mb-1">Earnings</p>
              <p className="text-sm text-foreground mb-1">
                MSFT Q4 earnings beat estimates
              </p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>

            <div className="pb-3">
              <p className="text-xs text-muted-foreground mb-1">Market News</p>
              <p className="text-sm text-foreground mb-1">
                Fed holds rates steady, signals patience
              </p>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Voice Available */}
      <div className="flex-shrink-0 border-t border-white/10 px-6 py-2">
        <p className="text-xs text-muted-foreground text-center">
          Amanda voice available • Press Cmd/Ctrl + K to activate
        </p>
      </div>

      {/* Mode Suggestion */}
      {shouldShow && suggestion?.recommendedMode && (
        <ModeSuggestion
          recommendedMode={suggestion.recommendedMode}
          reason={suggestion.reason}
          onDismiss={dismissSuggestion}
        />
      )}
    </div>
  );
}

export default function TerminalMode() {
  return (
    <ProtectedRoute>
      <TerminalModeContent />
    </ProtectedRoute>
  );
}
