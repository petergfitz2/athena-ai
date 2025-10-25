import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity, 
  AlertTriangle,
  Info,
  ChartBar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PerformanceMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
  maxDrawdown: number;
  calmarRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
}

interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][];
  interpretation: string;
}

interface RiskMetrics {
  portfolioBeta: number;
  portfolioVolatility: number;
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalVaR: number;
  diversificationRatio: number;
}

function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  className 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  const trendColors = {
    positive: "text-emerald-400 bg-emerald-400/10",
    negative: "text-red-400 bg-red-400/10",
    neutral: "text-zinc-400 bg-zinc-400/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "bg-black/40 backdrop-blur-2xl border-white/5 hover-elevate",
        className
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-light text-white/60">{title}</h3>
                    <Info className="w-3 h-3 text-white/30" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {trend && (
              <Badge variant="outline" className={cn("border-0", trendColors[trend])}>
                {trend === "positive" ? <TrendingUp className="w-3 h-3" /> : 
                 trend === "negative" ? <TrendingDown className="w-3 h-3" /> : 
                 <Activity className="w-3 h-3" />}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono text-white">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CorrelationHeatmap({ data }: { data: CorrelationMatrix }) {
  const getColor = (value: number) => {
    if (value === 1) return "bg-purple-600";
    if (value > 0.7) return "bg-purple-500/80";
    if (value > 0.3) return "bg-purple-400/60";
    if (value > -0.3) return "bg-zinc-600/40";
    if (value > -0.7) return "bg-blue-400/60";
    return "bg-blue-500/80";
  };

  return (
    <Card className="bg-black/40 backdrop-blur-2xl border-white/5">
      <CardHeader>
        <CardTitle className="text-lg font-light text-white">
          Correlation Matrix
        </CardTitle>
        <p className="text-sm text-white/60 mt-2">
          {data.interpretation}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row */}
            <div className="flex gap-1 mb-1 ml-16">
              {data.symbols.map((symbol) => (
                <div 
                  key={symbol} 
                  className="w-12 h-12 flex items-center justify-center text-[10px] text-white/60 font-mono"
                >
                  {symbol.slice(0, 4)}
                </div>
              ))}
            </div>
            
            {/* Matrix rows */}
            {data.matrix.map((row, i) => (
              <div key={i} className="flex gap-1 mb-1">
                <div className="w-16 flex items-center justify-end pr-2 text-xs text-white/60 font-mono">
                  {data.symbols[i]}
                </div>
                {row.map((value, j) => (
                  <TooltipProvider key={j}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (i * data.symbols.length + j) * 0.01 }}
                          className={cn(
                            "w-12 h-12 rounded flex items-center justify-center text-[10px] font-mono transition-all hover:scale-110",
                            getColor(value),
                            value > 0.5 ? "text-white" : "text-white/80"
                          )}
                        >
                          {value.toFixed(2)}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {data.symbols[i]} × {data.symbols[j]}: {value.toFixed(3)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="w-4 h-4 rounded bg-blue-500/80" />
            <span>Strong Negative</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="w-4 h-4 rounded bg-zinc-600/40" />
            <span>Uncorrelated</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="w-4 h-4 rounded bg-purple-500/80" />
            <span>Strong Positive</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskDashboard({ data }: { data: RiskMetrics }) {
  const getRiskLevel = (var95: number) => {
    if (var95 < 2) return { level: "Low", color: "text-emerald-400", bg: "bg-emerald-400/10" };
    if (var95 < 5) return { level: "Moderate", color: "text-amber-400", bg: "bg-amber-400/10" };
    return { level: "High", color: "text-red-400", bg: "bg-red-400/10" };
  };

  const riskLevel = getRiskLevel(data.valueAtRisk95);

  return (
    <Card className="bg-black/40 backdrop-blur-2xl border-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-light text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Risk Profile
          </CardTitle>
          <Badge variant="outline" className={cn("border-0", riskLevel.bg, riskLevel.color)}>
            {riskLevel.level} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Portfolio Beta</span>
              <span className="font-mono text-white">{data.portfolioBeta}</span>
            </div>
            <Progress value={Math.min(data.portfolioBeta * 50, 100)} className="h-1" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Volatility</span>
              <span className="font-mono text-white">{data.portfolioVolatility}%</span>
            </div>
            <Progress value={Math.min(data.portfolioVolatility * 3, 100)} className="h-1" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>VaR (95%)</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Maximum expected loss in 95% of scenarios</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-mono text-red-400">-{data.valueAtRisk95}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>VaR (99%)</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Maximum expected loss in 99% of scenarios</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-mono text-red-400">-{data.valueAtRisk99}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Shield className="w-3 h-3" />
                    <span>CVaR</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Expected loss beyond VaR threshold</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-mono text-orange-400">-{data.conditionalVaR}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <ChartBar className="w-3 h-3" />
                    <span>Diversification</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Higher ratio indicates better diversification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-mono text-white">{data.diversificationRatio}x</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvancedAnalytics() {
  const { data: performanceMetrics, isLoading: loadingPerformance } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/analytics/performance-metrics"],
  });

  const { data: correlationMatrix, isLoading: loadingCorrelation } = useQuery<CorrelationMatrix>({
    queryKey: ["/api/analytics/correlation-matrix"],
  });

  const { data: riskMetrics, isLoading: loadingRisk } = useQuery<RiskMetrics>({
    queryKey: ["/api/analytics/risk-metrics"],
  });

  const isLoading = loadingPerformance || loadingCorrelation || loadingRisk;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/40 backdrop-blur-2xl border-white/5">
            <CardContent className="p-8">
              <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded animate-pulse w-1/3" />
                <div className="h-8 bg-white/5 rounded animate-pulse w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-black/40 backdrop-blur-2xl border-white/5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="correlation">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Sharpe Ratio"
                value={performanceMetrics.sharpeRatio}
                description="Risk-adjusted returns. Higher is better (>1 is good, >2 is excellent)"
                icon={TrendingUp}
                trend={performanceMetrics.sharpeRatio > 1 ? "positive" : performanceMetrics.sharpeRatio > 0 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Sortino Ratio"
                value={performanceMetrics.sortinoRatio}
                description="Downside risk-adjusted returns. Focuses on negative volatility"
                icon={Shield}
                trend={performanceMetrics.sortinoRatio > 1.5 ? "positive" : performanceMetrics.sortinoRatio > 0 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Alpha"
                value={`${performanceMetrics.alpha}%`}
                description="Excess returns vs market. Positive alpha beats the market"
                icon={ChartBar}
                trend={performanceMetrics.alpha > 0 ? "positive" : performanceMetrics.alpha === 0 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Beta"
                value={performanceMetrics.beta}
                description="Market correlation. 1=market, >1=aggressive, <1=defensive"
                icon={Activity}
                trend="neutral"
              />
              <MetricCard
                title="Max Drawdown"
                value={`-${performanceMetrics.maxDrawdown}%`}
                description="Largest peak-to-trough decline"
                icon={TrendingDown}
                trend={performanceMetrics.maxDrawdown < 20 ? "positive" : performanceMetrics.maxDrawdown < 40 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Volatility"
                value={`${performanceMetrics.volatility}%`}
                description="Annual standard deviation of returns"
                icon={Activity}
                trend={performanceMetrics.volatility < 15 ? "positive" : performanceMetrics.volatility < 25 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Calmar Ratio"
                value={performanceMetrics.calmarRatio}
                description="Return relative to max drawdown"
                icon={TrendingUp}
                trend={performanceMetrics.calmarRatio > 1 ? "positive" : performanceMetrics.calmarRatio > 0 ? "neutral" : "negative"}
              />
              <MetricCard
                title="Treynor Ratio"
                value={performanceMetrics.treynorRatio}
                description="Excess return per unit of systematic risk"
                icon={ChartBar}
                trend={performanceMetrics.treynorRatio > 0.5 ? "positive" : performanceMetrics.treynorRatio > 0 ? "neutral" : "negative"}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="risk">
          {riskMetrics && <RiskDashboard data={riskMetrics} />}
        </TabsContent>

        <TabsContent value="correlation">
          {correlationMatrix && correlationMatrix.symbols.length > 0 && (
            <CorrelationHeatmap data={correlationMatrix} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}