import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Brain, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
  Sparkles,
  Target,
  Shield,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarketInsights {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  keyFactors: string[];
  recommendation: string;
}

interface TradeSuggestion {
  id: string;
  type: "buy" | "sell" | "rebalance";
  symbol: string;
  companyName: string;
  currentPrice: number;
  targetPrice: number;
  quantity: number;
  reason: string;
  confidence: number;
  impact: {
    portfolioDiversification: string;
    riskAdjustment: string;
    expectedReturn: string;
  };
  technicalSignals: {
    rsi: number;
    macd: "bullish" | "bearish" | "neutral";
    movingAverage: "above" | "below";
    volume: "increasing" | "decreasing" | "stable";
  };
  timeHorizon: "short" | "medium" | "long";
  priority: "high" | "medium" | "low";
}

export function MarketSentiment() {
  // Fetch market insights
  const { data: insights, isLoading: loadingInsights, refetch: refetchInsights } = useQuery<MarketInsights>({
    queryKey: ['/api/market-insights'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch trade suggestions
  const { data: suggestions, isLoading: loadingSuggestions, refetch: refetchSuggestions } = useQuery<TradeSuggestion[]>({
    queryKey: ['/api/trade-suggestions'],
  });

  // Execute trade mutation
  const executeTrade = useMutation({
    mutationFn: async (suggestion: TradeSuggestion) => {
      const response = await fetch(`/api/trades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          symbol: suggestion.symbol,
          quantity: suggestion.quantity,
          orderType: "market",
          action: suggestion.type === "buy" ? "buy" : "sell"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to execute trade");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trade-suggestions'] });
    }
  });

  const handleRefresh = () => {
    refetchInsights();
    refetchSuggestions();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return <TrendingUp className="w-5 h-5" />;
      case "bearish": return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return "text-green-500";
      case "bearish": return "text-red-500";
      default: return "text-yellow-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getTimeHorizonIcon = (horizon: string) => {
    switch (horizon) {
      case "short": return <Zap className="w-4 h-4" />;
      case "medium": return <Target className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Sentiment Card */}
      <Card className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-xl">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extralight">AI Market Analysis</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Powered by advanced pattern recognition
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="icon"
              className="hover-elevate active-elevate-2"
              data-testid="button-refresh-insights"
            >
              <RefreshCw className={cn("w-4 h-4", (loadingInsights || loadingSuggestions) && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loadingInsights ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sentiment Overview */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/[0.02] border border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-white/5", getSentimentColor(insights.sentiment))}>
                      {getSentimentIcon(insights.sentiment)}
                    </div>
                    <div>
                      <h3 className="text-xl font-light capitalize">{insights.sentiment} Market</h3>
                      <p className="text-sm text-muted-foreground">
                        {insights.confidence.toFixed(0)}% confidence level
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="no-default-hover-elevate">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Analysis
                  </Badge>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Analysis Confidence</span>
                    <span>{insights.confidence.toFixed(0)}%</span>
                  </div>
                  <Progress value={insights.confidence} className="h-2" />
                </div>
              </div>

              {/* Key Market Factors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Key Market Drivers
                </h4>
                <div className="grid gap-2">
                  {insights.keyFactors.map((factor, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                      data-testid={`market-factor-${idx}`}
                    >
                      <div className={cn("w-2 h-2 rounded-full", 
                        insights.sentiment === "bullish" ? "bg-green-500" :
                        insights.sentiment === "bearish" ? "bg-red-500" : "bg-yellow-500"
                      )} />
                      <span className="text-sm font-light">{factor}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">AI Recommendation</h4>
                    <p className="text-sm text-muted-foreground font-light">
                      {insights.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Trade Suggestions Card */}
      <Card className="rounded-[28px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 backdrop-blur-xl">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-extralight">Smart Trade Ideas</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered trade suggestions based on your portfolio
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadingSuggestions ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/5 hover-elevate"
                    data-testid={`trade-suggestion-${idx}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg",
                          suggestion.type === "buy" ? "bg-green-500/10 text-green-500" :
                          suggestion.type === "sell" ? "bg-red-500/10 text-red-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {suggestion.type === "buy" ? <ArrowUpRight className="w-4 h-4" /> :
                           suggestion.type === "sell" ? <ArrowDownRight className="w-4 h-4" /> :
                           <RefreshCw className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{suggestion.symbol}</h4>
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(suggestion.priority))}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestion.companyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${suggestion.currentPrice.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          Target: ${suggestion.targetPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.reason}
                    </p>

                    {/* Technical Signals */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs no-default-hover-elevate">
                        RSI: {suggestion.technicalSignals.rsi}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs no-default-hover-elevate",
                        suggestion.technicalSignals.macd === "bullish" ? "text-green-500" :
                        suggestion.technicalSignals.macd === "bearish" ? "text-red-500" : ""
                      )}>
                        MACD: {suggestion.technicalSignals.macd}
                      </Badge>
                      <Badge variant="outline" className="text-xs no-default-hover-elevate">
                        MA: {suggestion.technicalSignals.movingAverage}
                      </Badge>
                      <div className="flex items-center gap-1 ml-auto">
                        {getTimeHorizonIcon(suggestion.timeHorizon)}
                        <span className="text-xs text-muted-foreground">{suggestion.timeHorizon}-term</span>
                      </div>
                    </div>

                    {/* Action & Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">Confidence:</div>
                        <Progress value={suggestion.confidence} className="w-20 h-1.5" />
                        <span className="text-xs font-medium">{suggestion.confidence}%</span>
                      </div>
                      
                      <Button
                        onClick={() => executeTrade.mutate(suggestion)}
                        disabled={executeTrade.isPending}
                        size="sm"
                        className={cn(
                          "text-xs",
                          suggestion.type === "buy" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" :
                          suggestion.type === "sell" ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" :
                          ""
                        )}
                        data-testid={`button-execute-${suggestion.id}`}
                      >
                        {executeTrade.isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          suggestion.type === "buy" ? "Buy" : suggestion.type === "sell" ? "Sell" : "Rebalance"
                        )} {suggestion.quantity} shares
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No trade suggestions available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add holdings to receive personalized recommendations
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}