import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, ProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Plus, ArrowUpRight } from "lucide-react";
import type { PortfolioSummary, Holding, MarketQuote } from "@shared/schema";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddHoldingModal from "@/components/AddHoldingModal";

function DashboardPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  const { data: holdings, isLoading: holdingsLoading } = useQuery<Holding[]>({
    queryKey: ['/api/holdings'],
  });

  const { data: quotes } = useQuery<Record<string, MarketQuote>>({
    queryKey: ['/api/market/quotes'],
  });

  const isLoading = summaryLoading || holdingsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight mb-4">
            Portfolio
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Your investment overview and performance
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-card/50 border-white/10 rounded-[28px] p-8 animate-pulse">
                <div className="h-20 bg-white/5 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Total Value */}
              <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-total-value">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs text-muted-foreground font-light">
                    Total Value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light">
                    {formatCurrency(summary?.totalValue || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Total Gain/Loss */}
              <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-total-gain">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs text-muted-foreground font-light">
                    Total Gain/Loss
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-light ${(summary?.totalGain || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(summary?.totalGain || 0)}
                  </div>
                  <div className={`text-sm mt-1 ${(summary?.totalGainPercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(summary?.totalGainPercent || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Cash Balance */}
              <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-cash-balance">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs text-muted-foreground font-light">
                    Cash Balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light">
                    {formatCurrency(summary?.cashBalance || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Holdings Count */}
              <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-holdings-count">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs text-muted-foreground font-light">
                    Holdings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light">
                    {summary?.holdingsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    positions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Holdings Table */}
            <Card className="bg-card border-white/10 rounded-[28px] mb-12">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-4xl font-extralight">Holdings</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground font-light">
                    Your current positions
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="gap-2 rounded-full"
                  data-testid="button-add-holding"
                >
                  <Plus className="w-4 h-4" />
                  Add Position
                </Button>
              </CardHeader>
              <CardContent>
                {!holdings || holdings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground font-light mb-4">
                      No holdings yet. Start building your portfolio.
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      variant="outline" 
                      className="gap-2 rounded-full"
                      data-testid="button-add-first-holding"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Position
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-light text-muted-foreground">Symbol</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Quantity</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Avg Cost</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Current Price</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Market Value</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Gain/Loss</th>
                          <th className="text-right py-3 px-4 text-sm font-light text-muted-foreground">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => {
                          const quote = quotes?.[holding.symbol];
                          const currentPrice = quote?.price || Number(holding.averageCost);
                          const quantity = Number(holding.quantity);
                          const avgCost = Number(holding.averageCost);
                          const marketValue = quantity * currentPrice;
                          const costBasis = quantity * avgCost;
                          const gainLoss = marketValue - costBasis;
                          const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                          const changePercent = quote?.changePercent || 0;

                          return (
                            <tr 
                              key={holding.id} 
                              className="border-b border-white/5 hover-elevate"
                              data-testid={`row-holding-${holding.symbol}`}
                            >
                              <td className="py-4 px-4">
                                <div className="font-medium">{holding.symbol}</div>
                              </td>
                              <td className="text-right py-4 px-4 font-light">
                                {quantity.toFixed(2)}
                              </td>
                              <td className="text-right py-4 px-4 font-light">
                                {formatCurrency(avgCost)}
                              </td>
                              <td className="text-right py-4 px-4 font-light">
                                {formatCurrency(currentPrice)}
                              </td>
                              <td className="text-right py-4 px-4 font-medium">
                                {formatCurrency(marketValue)}
                              </td>
                              <td className={`text-right py-4 px-4 font-medium ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <div className="flex items-center justify-end gap-1">
                                  {gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                  <span>{formatCurrency(Math.abs(gainLoss))}</span>
                                </div>
                                <div className="text-xs mt-0.5">
                                  {formatPercent(gainLossPercent)}
                                </div>
                              </td>
                              <td className={`text-right py-4 px-4 ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatPercent(changePercent)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Holdings */}
            {summary?.topHoldings && summary.topHoldings.length > 0 && (
              <Card className="bg-card border-white/10 rounded-[28px]">
                <CardHeader>
                  <CardTitle className="text-4xl font-extralight">Top Holdings</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground font-light">
                    Your largest positions by value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.topHoldings.map((holding, index) => (
                      <div 
                        key={holding.symbol} 
                        className="flex items-center justify-between p-4 rounded-[20px] bg-white/5"
                        data-testid={`top-holding-${index}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {holding.percentOfPortfolio.toFixed(2)}% of portfolio
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(holding.value)}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1 gap-1"
                            data-testid={`button-view-${holding.symbol}`}
                          >
                            View <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      
      {/* Add Holding Modal */}
      <AddHoldingModal open={showAddModal} onOpenChange={setShowAddModal} />
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
