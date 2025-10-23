import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, ProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus, ArrowUpRight, ShoppingCart, TrendingDown as SellIcon, Sparkles, Wallet, BookOpen, MessageCircle, Newspaper, AlertCircle, HelpCircle } from "lucide-react";
import type { PortfolioSummary, Holding, MarketQuote, NewsArticle } from "@shared/schema";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import PortfolioChart from "@/components/PortfolioChart";
import SectorAllocationChart, { type SectorData } from "@/components/SectorAllocationChart";
import Navigation from "@/components/Navigation";
import { useLocation } from "wouter";
import FloatingAthenaOrb from "@/components/FloatingAthenaOrb";
import NewsDetailModal from "@/components/NewsDetailModal";

function DashboardPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/trade-suggestions", {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Suggestions Generated",
        description: `Created ${data.length} new trade suggestions. Redirecting to Trades page...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      setTimeout(() => setLocation("/trades"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI suggestions",
        variant: "destructive",
      });
    },
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  const { data: holdings, isLoading: holdingsLoading } = useQuery<Holding[]>({
    queryKey: ['/api/holdings'],
  });

  const { data: quotes } = useQuery<Record<string, MarketQuote>>({
    queryKey: ['/api/market/quotes'],
  });

  const { data: performanceData = [] } = useQuery<Array<{ date: string; value: number }>>({
    queryKey: ['/api/portfolio/performance'],
  });

  const { data: sectorData = [] } = useQuery<SectorData[]>({
    queryKey: ['/api/portfolio/sectors'],
  });

  const { data: newsData = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/market/news'],
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
      <Navigation />
      <FloatingAthenaOrb />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        {/* Demo Mode Banner */}
        <div className="mb-8 p-4 rounded-[20px] bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-white border-0 px-3 py-1">
                DEMO MODE
              </Badge>
              <p className="text-sm font-light text-foreground">
                Virtual Trading Environment - Practice without real money
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={() => setLocation("/help")}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Welcome Section for New Users */}
        {(!holdings || holdings.length === 0) && (
          <Card className="mb-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 rounded-[28px]">
            <CardHeader>
              <CardTitle className="text-3xl font-light">Welcome to Your Demo Portfolio, {user?.fullName || user?.username}!</CardTitle>
              <CardDescription className="text-base mt-2">
                This is a sandbox environment with virtual funds. Perfect for learning and practicing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm">Ask Athena AI</p>
                    <p className="text-xs text-muted-foreground">Get personalized stock suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm">$100,000 Virtual Cash</p>
                    <p className="text-xs text-muted-foreground">Practice trading risk-free</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Newspaper className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm">Real-Time News</p>
                    <p className="text-xs text-muted-foreground">Stay updated with market trends</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowBuyModal(true)} className="rounded-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Make Your First Trade
                </Button>
                <Button variant="outline" onClick={() => setLocation("/tutorials")} className="rounded-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Tutorials
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight mb-4">
            Portfolio Overview
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Your investment performance and market insights
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-card/50 border-white/10 rounded-[28px] p-8 animate-purple-pulse">
                <div className="h-20 bg-primary/10 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {/* Total Value */}
              <Card className="bg-card border-white/10 rounded-[28px] glass-hover" data-testid="card-total-value">
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
              <Card className="bg-card border-white/10 rounded-[28px] glass-hover" data-testid="card-total-gain">
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
              <Card className="bg-card border-white/10 rounded-[28px] glass-hover" data-testid="card-cash-balance">
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
              <Card className="bg-card border-white/10 rounded-[28px] glass-hover" data-testid="card-holdings-count">
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

            {/* Portfolio Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Top Performer Card */}
              {holdings && holdings.length > 0 && (
                (() => {
                  const topPerformer = holdings
                    .map((holding) => {
                      const quote = quotes?.[holding.symbol];
                      const currentPrice = quote?.price || Number(holding.averageCost);
                      const quantity = Number(holding.quantity);
                      const avgCost = Number(holding.averageCost);
                      const marketValue = quantity * currentPrice;
                      const costBasis = quantity * avgCost;
                      const gainLoss = marketValue - costBasis;
                      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                      return { symbol: holding.symbol, gainLossPercent, gainLoss };
                    })
                    .sort((a, b) => b.gainLossPercent - a.gainLossPercent)[0];
                  
                  return (
                    <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 rounded-[28px] hover-elevate" data-testid="card-top-performer">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs text-green-400 font-light flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Top Performer
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-light text-foreground mb-1">{topPerformer?.symbol}</div>
                        <div className="text-3xl font-extralight text-green-400">
                          +{topPerformer?.gainLossPercent.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(topPerformer?.gainLoss || 0)} gain
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()
              )}

              {/* Sector Alert Card */}
              {sectorData && sectorData.length > 0 && (
                (() => {
                  const topSector = sectorData[0];
                  const totalSectorValue = sectorData.reduce((acc, s) => acc + s.value, 0);
                  const concentration = (topSector.value / totalSectorValue) * 100;
                  const isHighConcentration = concentration > 40;
                  
                  return (
                    <Card 
                      className={`${
                        isHighConcentration 
                          ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20' 
                          : 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20'
                      } rounded-[28px] hover-elevate`}
                      data-testid="card-sector-alert"
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className={`text-xs font-light flex items-center gap-2 ${
                          isHighConcentration ? 'text-yellow-400' : 'text-primary'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          Sector Concentration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-light text-foreground mb-1">{topSector?.name}</div>
                        <div className={`text-3xl font-extralight ${
                          isHighConcentration ? 'text-yellow-400' : 'text-primary'
                        }`}>
                          {concentration.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {isHighConcentration ? 'High concentration' : 'Well balanced'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()
              )}

              {/* Cash Utilization Card */}
              {summary && (
                (() => {
                  const cashBalance = summary.cashBalance || 0;
                  const totalValue = summary.totalValue || 0;
                  const cashUtilization = totalValue > 0 ? ((totalValue - cashBalance) / totalValue) * 100 : 0;
                  const isUnderUtilized = cashBalance > totalValue * 0.2;
                  
                  return (
                    <Card 
                      className={`${
                        isUnderUtilized
                          ? 'bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20'
                          : 'bg-gradient-to-br from-primary/10 to-transparent border-primary/20'
                      } rounded-[28px] hover-elevate`}
                      data-testid="card-cash-utilization"
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className={`text-xs font-light flex items-center gap-2 ${
                          isUnderUtilized ? 'text-blue-400' : 'text-primary'
                        }`}>
                          <Wallet className="w-4 h-4" />
                          Cash Utilization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-light text-foreground mb-1">
                          {cashUtilization.toFixed(1)}% Invested
                        </div>
                        <div className={`text-3xl font-extralight ${
                          isUnderUtilized ? 'text-blue-400' : 'text-primary'
                        }`}>
                          {formatCurrency(cashBalance)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {isUnderUtilized ? 'Consider investing' : 'Cash available'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()
              )}
            </div>

            {/* Portfolio Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8 lg:mb-12">
              {/* Performance Chart */}
              <PortfolioChart 
                data={performanceData}
                currentValue={summary?.totalValue || 0}
                totalGainPercent={summary?.totalGainPercent || 0}
              />
              
              {/* Sector Allocation */}
              <SectorAllocationChart 
                data={sectorData}
              />
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => generateSuggestions.mutate()}
                    disabled={generateSuggestions.isPending}
                    className="gap-2 rounded-full"
                    data-testid="button-ai-suggestions"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generateSuggestions.isPending ? "Generating..." : "AI Suggestions"}
                  </Button>
                  <Button 
                    onClick={() => setShowBuyModal(true)}
                    className="gap-2 rounded-full bg-success hover:bg-success/90"
                    data-testid="button-buy-stock"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy Stock
                  </Button>
                  <Button 
                    onClick={() => setShowSellModal(true)}
                    variant="outline"
                    className="gap-2 rounded-full"
                    data-testid="button-sell-stock"
                  >
                    <SellIcon className="w-4 h-4" />
                    Sell Stock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!holdings || holdings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground font-light mb-4">
                      No holdings yet. Start building your portfolio.
                    </p>
                    <Button 
                      onClick={() => setShowBuyModal(true)}
                      variant="default" 
                      className="gap-2 rounded-full bg-success hover:bg-success/90"
                      data-testid="button-buy-first-stock"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Your First Stock
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

            {/* Market News Section */}
            <Card className="bg-card border-white/10 rounded-[28px] mb-12">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-4xl font-extralight flex items-center gap-3">
                      <Newspaper className="w-8 h-8 text-primary" />
                      Market News
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground font-light">
                      Latest updates and market intelligence
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-full"
                    onClick={() => setLocation("/watchlist")}
                  >
                    View All News
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {newsData && newsData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newsData.slice(0, 6).map((article) => {
                      const getSentimentColor = (label?: string) => {
                        if (!label) return "text-muted-foreground";
                        const normalized = label.toLowerCase();
                        if (normalized.includes("bullish") || normalized.includes("positive")) return "text-success";
                        if (normalized.includes("bearish") || normalized.includes("negative")) return "text-destructive";
                        return "text-warning";
                      };

                      return (
                        <div
                          key={article.id}
                          className="p-4 rounded-[20px] bg-white/5 hover-elevate cursor-pointer transition-all"
                          onClick={() => setSelectedNewsArticle(article)}
                          data-testid={`news-article-${article.id}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            {article.sentimentLabel && (
                              <Badge className={`${getSentimentColor(article.sentimentLabel)} bg-transparent border-current px-2 py-0.5 text-xs`}>
                                {article.sentimentLabel}
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">{article.title}</h4>
                          {article.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.summary}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{article.source}</p>
                            {article.tickers && article.tickers.length > 0 && (
                              <div className="flex gap-1">
                                {article.tickers.slice(0, 3).map(ticker => (
                                  <Badge key={ticker} variant="outline" className="text-xs px-2 py-0">
                                    {ticker}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No market news available</p>
                    <p className="text-xs text-muted-foreground mt-1">Check back later for updates</p>
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
      
      {/* Trade Execution Modals */}
      <ExecuteTradeModal open={showBuyModal} onOpenChange={setShowBuyModal} action="buy" />
      <ExecuteTradeModal open={showSellModal} onOpenChange={setShowSellModal} action="sell" />
      
      {/* News Detail Modal */}
      <NewsDetailModal 
        article={selectedNewsArticle} 
        open={!!selectedNewsArticle} 
        onClose={() => setSelectedNewsArticle(null)} 
      />
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
