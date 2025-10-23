import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Target,
  AlertTriangle,
  Coffee,
  Sun,
  Moon,
  CloudRain,
  DollarSign,
  Activity,
  Brain,
  ChevronRight,
  Clock,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";

interface DailyBriefingProps {
  onDismiss: () => void;
}

export default function DailyBriefing({ onDismiss }: DailyBriefingProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // Check if briefing was already shown today
  useEffect(() => {
    const lastDismissed = localStorage.getItem('athena_briefing_dismissed');
    const today = new Date().toDateString();
    
    if (lastDismissed === today) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('athena_briefing_dismissed', today);
    setDismissed(true);
    onDismiss();
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    
    if (hour < 6) return { greeting: "Early Morning", icon: Moon, theme: "from-indigo-900/20 to-purple-900/20" };
    if (hour < 12) return { greeting: "Good Morning", icon: Coffee, theme: "from-amber-900/20 to-orange-900/20" };
    if (hour < 17) return { greeting: "Good Afternoon", icon: Sun, theme: "from-yellow-900/20 to-amber-900/20" };
    if (hour < 21) return { greeting: "Good Evening", icon: CloudRain, theme: "from-blue-900/20 to-indigo-900/20" };
    return { greeting: "Good Night", icon: Moon, theme: "from-indigo-900/20 to-purple-900/20" };
  };

  const timeData = getTimeOfDay();
  const TimeIcon = timeData.icon;

  // Mock data - in real app, this would come from API
  const marketSummary = {
    sp500: { value: 4521.23, change: 0.8, direction: "up" },
    nasdaq: { value: 14167.89, change: 1.2, direction: "up" },
    dow: { value: 35284.52, change: -0.3, direction: "down" },
  };

  const portfolioImpact = {
    expectedReturn: 2.3,
    riskLevel: "moderate",
    topGainer: { symbol: "NVDA", gain: 5.2 },
    topLoser: { symbol: "TSLA", loss: -2.1 },
  };

  const recommendations = [
    {
      id: 1,
      type: "buy",
      symbol: "MSFT",
      reason: "Strong earnings report expected, AI momentum",
      confidence: 85,
    },
    {
      id: 2,
      type: "rebalance",
      symbol: "Portfolio",
      reason: "Tech sector overweight at 45%, consider diversification",
      confidence: 92,
    },
    {
      id: 3,
      type: "watch",
      symbol: "AMZN",
      reason: "Approaching support level, potential entry point",
      confidence: 78,
    },
  ];

  const insights = [
    "Federal Reserve meeting today at 2 PM EST - expect volatility",
    "Your portfolio beta is 1.15 - slightly above market average",
    "3 of your holdings report earnings this week",
  ];

  if (dismissed) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300",
      "p-4 sm:p-6"
    )}>
      <Card className={cn(
        "w-full max-w-3xl bg-gradient-to-br border-white/20 shadow-2xl rounded-[28px] overflow-hidden",
        "animate-in slide-in-from-bottom duration-500",
        timeData.theme
      )}>
        {/* Header with Avatar */}
        <CardHeader className="relative pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <AthenaTraderAvatar size="small" showStatus={false} showName={false} />
              <div>
                <CardTitle className="text-2xl font-light flex items-center gap-2">
                  <TimeIcon className="w-5 h-5 text-primary" />
                  {timeData.greeting} Briefing
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="rounded-full"
              data-testid="button-dismiss-briefing"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Market Overview */}
          <div>
            <h3 className="text-lg font-light mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Overnight Market Movements
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-[16px] p-3">
                <p className="text-xs text-muted-foreground">S&P 500</p>
                <p className="text-lg font-light">{marketSummary.sp500.value.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  marketSummary.sp500.change >= 0 ? "text-success" : "text-destructive"
                )}>
                  {marketSummary.sp500.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {marketSummary.sp500.change >= 0 ? "+" : ""}{marketSummary.sp500.change}%
                </div>
              </div>
              <div className="bg-white/5 rounded-[16px] p-3">
                <p className="text-xs text-muted-foreground">NASDAQ</p>
                <p className="text-lg font-light">{marketSummary.nasdaq.value.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  marketSummary.nasdaq.change >= 0 ? "text-success" : "text-destructive"
                )}>
                  {marketSummary.nasdaq.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {marketSummary.nasdaq.change >= 0 ? "+" : ""}{marketSummary.nasdaq.change}%
                </div>
              </div>
              <div className="bg-white/5 rounded-[16px] p-3">
                <p className="text-xs text-muted-foreground">DOW</p>
                <p className="text-lg font-light">{marketSummary.dow.value.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  marketSummary.dow.change >= 0 ? "text-success" : "text-destructive"
                )}>
                  {marketSummary.dow.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {marketSummary.dow.change >= 0 ? "" : ""}{marketSummary.dow.change}%
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Impact */}
          <div>
            <h3 className="text-lg font-light mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Your Portfolio Impact
            </h3>
            <div className="bg-white/5 rounded-[20px] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expected Daily Return</span>
                <span className={cn(
                  "text-lg font-light",
                  portfolioImpact.expectedReturn >= 0 ? "text-success" : "text-destructive"
                )}>
                  {portfolioImpact.expectedReturn >= 0 ? "+" : ""}{portfolioImpact.expectedReturn}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge variant="outline" className="capitalize">
                  {portfolioImpact.riskLevel}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground">Top Gainer</p>
                  <p className="font-medium">{portfolioImpact.topGainer.symbol}</p>
                  <p className="text-sm text-success">+{portfolioImpact.topGainer.gain}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Top Loser</p>
                  <p className="font-medium">{portfolioImpact.topLoser.symbol}</p>
                  <p className="text-sm text-destructive">{portfolioImpact.topLoser.loss}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h3 className="text-lg font-light mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Recommended Actions for Today
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white/5 rounded-[16px] p-4 flex items-start justify-between hover-elevate active-elevate-2 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={rec.type === "buy" ? "default" : rec.type === "rebalance" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {rec.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{rec.symbol}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-light text-primary">{rec.confidence}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          {expanded && (
            <div>
              <h3 className="text-lg font-light mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Key Insights
              </h3>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                    <p className="text-sm text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            size="sm"
            className="rounded-full"
            data-testid="button-toggle-briefing"
          >
            {expanded ? "Show Less" : "Show More Details"}
            <ChevronRight className={cn(
              "w-4 h-4 ml-2 transition-transform",
              expanded && "rotate-90"
            )} />
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                // Would open full dashboard with briefing details
                handleDismiss();
              }}
              variant="outline"
              size="sm"
              className="rounded-full"
              data-testid="button-view-later"
            >
              <Clock className="w-4 h-4 mr-2" />
              View Later
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              className="rounded-full"
              data-testid="button-start-trading"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Trading
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}