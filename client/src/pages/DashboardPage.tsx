import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, ProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Plus, ArrowUpRight, ShoppingCart, 
  Sparkles, Wallet, BookOpen, MessageCircle, Newspaper, 
  HelpCircle, Target, DollarSign, Activity, Briefcase, 
  ChevronRight, Eye, Zap, ArrowRight, FileText 
} from "lucide-react";
import type { PortfolioSummary, Holding, MarketQuote, NewsArticle } from "@shared/schema";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import Navigation from "@/components/Navigation";
import { useLocation } from "wouter";
import NewsDetailModal from "@/components/NewsDetailModal";
import GuidedTour from "@/components/GuidedTour";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DailyBriefing from "@/components/DailyBriefing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SimplifiedDashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const [showDailyBriefing, setShowDailyBriefing] = useState(false);
  
  // Check if we should show the daily briefing on initial load
  useEffect(() => {
    const lastShown = localStorage.getItem('athena_briefing_last_shown');
    const today = new Date().toDateString();
    
    // Show daily briefing if it hasn't been shown today
    if (lastShown !== today) {
      setShowDailyBriefing(true);
      localStorage.setItem('athena_briefing_last_shown', today);
    }
  }, []);

  const { data: summary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  const { data: holdings, isLoading: holdingsLoading } = useQuery<Holding[]>({
    queryKey: ['/api/holdings'],
  });

  const { data: quotes } = useQuery<Record<string, MarketQuote>>({
    queryKey: ['/api/market/quotes'],
  });

  const { data: newsData = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/market/news'],
  });

  const isLoading = summaryLoading || holdingsLoading;
  const hasHoldings = holdings && holdings.length > 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Get today's change (mock data for demo)
  const todayChange = summary ? (summary.totalValue * 0.024) : 0; // Mock 2.4% change
  const todayChangePercent = 2.4;

  // Open Athena chat
  const handleChatWithAthena = () => {
    // TODO: Open left panel chat
    toast({
      title: "Chat with Athena",
      description: "Chat panel will open here soon",
    });
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      <GuidedTour />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        {/* Simplified Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-extralight mb-2">
              Welcome back, {user?.fullName || user?.username}
            </h1>
            <p className="text-muted-foreground font-light">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            onClick={() => setShowDailyBriefing(true)}
            className="bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-600 text-white rounded-[28px] shadow-xl shadow-primary/20"
            size="lg"
            data-testid="button-daily-briefing"
          >
            <FileText className="w-5 h-5 mr-2" />
            Daily Briefing
          </Button>
        </div>

        {/* Start Here Section - Only show for new/empty portfolios */}
        {!hasHoldings && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-purple-600/5 to-transparent border-primary/20 rounded-[28px] p-8">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl font-light">Start Your Journey</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Choose how you'd like to begin with Athena
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleChatWithAthena}
                    className="group p-6 rounded-[20px] bg-black/40 border border-white/10 hover-elevate active-elevate-2 text-left transition-all"
                    data-testid="button-start-chat"
                  >
                    <MessageCircle className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                      Talk to Athena
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered investment suggestions
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setLocation("/watchlist")}
                    className="group p-6 rounded-[20px] bg-black/40 border border-white/10 hover-elevate active-elevate-2 text-left transition-all"
                    data-testid="button-start-browse"
                  >
                    <Eye className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                      Browse Stocks
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore and track your favorite companies
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setLocation("/tutorials")}
                    className="group p-6 rounded-[20px] bg-black/40 border border-white/10 hover-elevate active-elevate-2 text-left transition-all"
                    data-testid="button-start-learn"
                  >
                    <BookOpen className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                      Learn Trading
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Master investing with guided tutorials
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Essential KPIs - Simplified */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-tour="portfolio-value">
          {/* Total Value */}
          <Card className="bg-card border-white/10 rounded-[28px] hover-elevate">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-muted-foreground font-light flex items-center gap-2">
                <Wallet className="w-3 h-3" />
                Portfolio Value
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3 h-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total value of all your investments plus cash</p>
                  </TooltipContent>
                </Tooltip>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light">
                {isLoading ? (
                  <div className="h-9 bg-primary/10 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(summary?.totalValue || 100000)
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Change */}
          <Card className="bg-card border-white/10 rounded-[28px] hover-elevate">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-muted-foreground font-light flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Today's Change
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 bg-primary/10 rounded animate-pulse"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-light ${todayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(Math.abs(todayChange))}
                  </span>
                  <span className={`text-sm ${todayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(todayChangePercent)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cash Balance */}
          <Card className="bg-card border-white/10 rounded-[28px] hover-elevate">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-muted-foreground font-light flex items-center gap-2">
                <DollarSign className="w-3 h-3" />
                Cash Available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light">
                {isLoading ? (
                  <div className="h-9 bg-primary/10 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(summary?.cashBalance || 100000)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Large and Prominent */}
        <div className="mb-8" data-tour="quick-actions">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={handleChatWithAthena}
              size="lg"
              className="h-auto py-6 rounded-[20px] bg-primary hover:bg-primary/90 flex flex-col gap-2"
              data-testid="button-quick-chat"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-base">Chat with Athena</span>
            </Button>
            
            <Button
              onClick={() => setShowBuyModal(true)}
              size="lg"
              variant="outline"
              className="h-auto py-6 rounded-[20px] flex flex-col gap-2"
              data-testid="button-quick-buy"
              data-tour="buy-stocks"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-base">Buy Stocks</span>
            </Button>
            
            <Button
              onClick={() => setLocation("/portfolio")}
              size="lg"
              variant="outline"
              className="h-auto py-6 rounded-[20px] flex flex-col gap-2"
              data-testid="button-quick-portfolio"
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-base">View Portfolio</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Holdings (Top 3 only) */}
          <div className="lg:col-span-2 space-y-6">
            {hasHoldings ? (
              <Card className="bg-card border-white/10 rounded-[28px]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-light">Your Holdings</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Top performing positions
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/portfolio")}
                    className="rounded-full"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {holdings.slice(0, 3).map((holding) => {
                    const quote = quotes?.[holding.symbol];
                    const currentPrice = quote?.price || Number(holding.averageCost);
                    const quantity = Number(holding.quantity);
                    const avgCost = Number(holding.averageCost);
                    const marketValue = quantity * currentPrice;
                    const costBasis = quantity * avgCost;
                    const gainLoss = marketValue - costBasis;
                    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

                    return (
                      <div
                        key={holding.id}
                        className="flex items-center justify-between p-4 rounded-[16px] bg-black/40 border border-white/5 hover-elevate"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">{holding.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-lg">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">{quantity} shares</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(marketValue)}</p>
                          <p className={`text-sm ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercent(gainLossPercent)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : !isLoading && (
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10 rounded-[28px]">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-light mb-3">Ready to start investing?</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Build your portfolio with AI guidance. Start with virtual money to practice.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setShowBuyModal(true)}
                      size="lg"
                      className="rounded-full"
                      data-testid="button-make-first-trade"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Make First Trade
                    </Button>
                    <Button
                      onClick={handleChatWithAthena}
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                      data-testid="button-ask-athena"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Ask Athena for Ideas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Market News (Top 3 only) */}
          <div className="space-y-6" data-tour="market-news">
            <Card className="bg-card border-white/10 rounded-[28px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-light">Market News</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Latest updates
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/news")}
                  className="rounded-full"
                >
                  View More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {newsData.slice(0, 3).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedNewsArticle(article)}
                    className="w-full text-left p-4 rounded-[16px] bg-black/40 border border-white/5 hover-elevate active-elevate-2 transition-all"
                  >
                    <p className="font-medium text-sm mb-1 line-clamp-2">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {article.source} • {article.publishedAt}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card className="bg-gradient-to-br from-purple-600/10 to-transparent border-purple-600/20 rounded-[28px]">
              <CardHeader>
                <CardTitle className="text-xl font-light flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Learn & Grow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-[16px]"
                  onClick={() => setLocation("/tutorials")}
                >
                  <Zap className="w-4 h-4 mr-3 text-purple-400" />
                  Quick Start Guide
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-[16px]"
                  onClick={() => setLocation("/tutorials")}
                >
                  <Target className="w-4 h-4 mr-3 text-purple-400" />
                  Investment Strategies
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-[16px]"
                  onClick={() => setLocation("/faq")}
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-purple-400" />
                  FAQs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progressive Disclosure - Show after some activity */}
        {hasHoldings && holdings.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-primary/5 via-purple-600/5 to-transparent border-primary/10 rounded-[28px]">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Ready for more?</p>
                      <p className="text-sm text-muted-foreground">
                        Unlock advanced analytics and insights
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setLocation("/analytics")}
                    variant="outline"
                    className="rounded-full"
                  >
                    View Analytics
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ExecuteTradeModal 
        open={showBuyModal} 
        onOpenChange={setShowBuyModal}
        action="buy"
      />
      
      {selectedNewsArticle && (
        <NewsDetailModal
          article={selectedNewsArticle}
          onClose={() => setSelectedNewsArticle(null)}
        />
      )}
      
      {/* Daily Briefing Modal */}
      <Dialog open={showDailyBriefing} onOpenChange={setShowDailyBriefing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/10 rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">Your Daily Investment Briefing</DialogTitle>
          </DialogHeader>
          <DailyBriefing onDismiss={() => setShowDailyBriefing(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SimplifiedDashboard() {
  return (
    <ProtectedRoute>
      <SimplifiedDashboardContent />
    </ProtectedRoute>
  );
}