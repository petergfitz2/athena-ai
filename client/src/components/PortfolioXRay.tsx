import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  PieChart,
  BarChart3,
  Globe,
  Brain,
  Sparkles,
  DollarSign,
  ChevronRight,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Holding, PortfolioSummary } from "@shared/schema";

interface RiskMetrics {
  score: number;
  level: "Low" | "Moderate" | "High";
  volatility: number;
  beta: number;
  sharpe: number;
  correlations: Record<string, number>;
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

interface PerformanceData {
  winners: { symbol: string; gain: number; contribution: number }[];
  losers: { symbol: string; loss: number; contribution: number }[];
  benchmarkComparison: { portfolio: number; sp500: number };
}

export default function PortfolioXRay() {
  const [activeView, setActiveView] = useState<"risk" | "composition" | "performance" | "insights">("risk");

  // Fetch portfolio data
  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

  const { data: summary } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  // Mock data for demonstration
  const riskMetrics: RiskMetrics = {
    score: 6.5,
    level: "Moderate",
    volatility: 18.5,
    beta: 1.12,
    sharpe: 1.45,
    correlations: {
      AAPL: 0.85,
      MSFT: 0.78,
      TSLA: 0.45,
      NVDA: 0.92,
    }
  };

  const sectorAllocations: SectorAllocation[] = [
    { sector: "Technology", value: 45000, percentage: 35, color: "hsl(258 90% 66%)" },
    { sector: "Healthcare", value: 25000, percentage: 20, color: "hsl(280 85% 40%)" },
    { sector: "Finance", value: 20000, percentage: 15, color: "hsl(240 80% 45%)" },
    { sector: "Consumer", value: 15000, percentage: 12, color: "hsl(200 75% 40%)" },
    { sector: "Energy", value: 10000, percentage: 8, color: "hsl(180 70% 35%)" },
    { sector: "Other", value: 10000, percentage: 10, color: "hsl(220 60% 30%)" },
  ];

  const performanceData: PerformanceData = {
    winners: [
      { symbol: "NVDA", gain: 45.2, contribution: 12.5 },
      { symbol: "AAPL", gain: 28.3, contribution: 8.2 },
      { symbol: "MSFT", gain: 22.1, contribution: 6.8 },
    ],
    losers: [
      { symbol: "TSLA", loss: -12.4, contribution: -3.2 },
      { symbol: "META", loss: -8.7, contribution: -2.1 },
    ],
    benchmarkComparison: {
      portfolio: 18.5,
      sp500: 14.2,
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-success";
    if (score <= 7) return "text-warning";
    return "text-destructive";
  };

  const getRiskGauge = (score: number) => {
    const angle = (score / 10) * 180 - 90;
    return angle;
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
        {[
          { id: "risk", label: "Risk Analysis", icon: Shield },
          { id: "composition", label: "Composition", icon: PieChart },
          { id: "performance", label: "Performance", icon: TrendingUp },
          { id: "insights", label: "AI Insights", icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              variant={activeView === tab.id ? "default" : "ghost"}
              className={cn(
                "flex-1 rounded-full",
                activeView === tab.id && "bg-primary hover:bg-primary/90"
              )}
              data-testid={`button-xray-${tab.id}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Risk Analysis Section */}
      {activeView === "risk" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Gauge */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Portfolio Risk Score</span>
                <Shield className={cn("w-5 h-5", getRiskColor(riskMetrics.score))} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 flex items-center justify-center">
                <div className="relative w-48 h-24">
                  <svg className="absolute inset-0" viewBox="0 0 200 100">
                    {/* Background arc */}
                    <path
                      d="M 20,80 A 80,80 0 0,1 180,80"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                      d="M 20,80 A 80,80 0 0,1 180,80"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeDasharray={`${(riskMetrics.score / 10) * 251} 251`}
                    />
                    {/* Needle */}
                    <line
                      x1="100"
                      y1="80"
                      x2="100"
                      y2="30"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      transform={`rotate(${getRiskGauge(riskMetrics.score)} 100 80)`}
                    />
                    <circle cx="100" cy="80" r="5" fill="hsl(var(--primary))" />
                  </svg>
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <div className="text-center">
                      <p className="text-3xl font-extralight">{riskMetrics.score}/10</p>
                      <Badge variant="outline" className="mt-1">
                        {riskMetrics.level} Risk
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Volatility</p>
                  <p className="text-lg font-light">{riskMetrics.volatility}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Beta</p>
                  <p className="text-lg font-light">{riskMetrics.beta}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Sharpe</p>
                  <p className="text-lg font-light">{riskMetrics.sharpe}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volatility Breakdown */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Volatility by Position</span>
                <Activity className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {holdings.slice(0, 5).map((holding) => {
                const volatility = Math.random() * 30 + 10;
                return (
                  <div key={holding.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{holding.symbol}</span>
                      <span className="text-muted-foreground">{volatility.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={volatility}
                      className="h-2"
                      data-testid={`progress-volatility-${holding.symbol}`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Correlation Heatmap */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Correlation Matrix</span>
                <BarChart3 className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-1">
                {/* Header row */}
                <div></div>
                {Object.keys(riskMetrics.correlations).map((symbol) => (
                  <div key={symbol} className="text-xs text-center text-muted-foreground p-2">
                    {symbol}
                  </div>
                ))}
                {/* Data rows */}
                {Object.entries(riskMetrics.correlations).map(([symbol1, _]) => (
                  <>
                    <div key={`${symbol1}-label`} className="text-xs text-right text-muted-foreground p-2">
                      {symbol1}
                    </div>
                    {Object.entries(riskMetrics.correlations).map(([symbol2, correlation]) => {
                      const intensity = Math.abs(correlation);
                      const isHigh = intensity > 0.7;
                      return (
                        <div
                          key={`${symbol1}-${symbol2}`}
                          className={cn(
                            "rounded-lg p-2 text-center text-xs",
                            symbol1 === symbol2
                              ? "bg-primary/40"
                              : isHigh
                              ? "bg-warning/20"
                              : "bg-white/5"
                          )}
                        >
                          {symbol1 === symbol2 ? "1.00" : correlation.toFixed(2)}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                High correlations (&gt;0.7) indicate similar price movements
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Composition Breakdown */}
      {activeView === "composition" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Allocation */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Sector Allocation</span>
                <PieChart className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {sectorAllocations.reduce((acc, sector, index) => {
                    const startAngle = acc;
                    const angle = (sector.percentage / 100) * 360;
                    const endAngle = startAngle + angle;
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                    const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                    const endX = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                    const endY = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                    
                    return (
                      <g key={sector.sector}>
                        <path
                          d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={sector.color}
                          opacity="0.8"
                          className="hover:opacity-100 transition-opacity"
                        />
                      </g>
                    );
                  }, 0)}
                </svg>
              </div>
              <div className="space-y-2 mt-4">
                {sectorAllocations.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-sm">{sector.sector}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{sector.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Exposure */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Geographic Exposure</span>
                <Globe className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { region: "United States", percentage: 65, value: 82500 },
                { region: "Europe", percentage: 20, value: 25000 },
                { region: "Asia Pacific", percentage: 10, value: 12500 },
                { region: "Emerging Markets", percentage: 5, value: 6250 },
              ].map((region) => (
                <div key={region.region}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{region.region}</span>
                    <span className="text-muted-foreground">
                      ${region.value.toLocaleString()} ({region.percentage}%)
                    </span>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Market Cap Distribution */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Market Cap Distribution</span>
                <BarChart3 className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: "Large Cap (>$10B)", percentage: 60, count: 8 },
                  { category: "Mid Cap ($2-10B)", percentage: 30, count: 5 },
                  { category: "Small Cap (<$2B)", percentage: 10, count: 3 },
                ].map((cap) => (
                  <div key={cap.category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{cap.category}</span>
                      <span className="text-muted-foreground">{cap.count} stocks</span>
                    </div>
                    <Progress value={cap.percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">{cap.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Asset Class Breakdown */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Asset Classes</span>
                <DollarSign className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { class: "Stocks", value: 105000, percentage: 84 },
                  { class: "ETFs", value: 12500, percentage: 10 },
                  { class: "Cash", value: 7500, percentage: 6 },
                ].map((asset) => (
                  <div key={asset.class} className="p-3 rounded-lg bg-white/5">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{asset.class}</span>
                      <Badge variant="outline">{asset.percentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${asset.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Attribution */}
      {activeView === "performance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Winners vs Losers */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="font-light">Performance Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Winners</p>
                  {performanceData.winners.map((stock) => (
                    <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="font-medium">{stock.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-success">+{stock.gain}%</p>
                        <p className="text-xs text-muted-foreground">
                          +{stock.contribution}% contribution
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Top Losers</p>
                  {performanceData.losers.map((stock) => (
                    <div key={stock.symbol} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        <span className="font-medium">{stock.symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-destructive">{stock.loss}%</p>
                        <p className="text-xs text-muted-foreground">
                          {stock.contribution}% contribution
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Comparison */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="font-light">vs S&P 500</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-muted-foreground">Your Portfolio</span>
                    <span className="text-2xl font-light text-success">
                      +{performanceData.benchmarkComparison.portfolio}%
                    </span>
                  </div>
                  <Progress
                    value={performanceData.benchmarkComparison.portfolio}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-muted-foreground">S&P 500</span>
                    <span className="text-2xl font-light">
                      +{performanceData.benchmarkComparison.sp500}%
                    </span>
                  </div>
                  <Progress
                    value={performanceData.benchmarkComparison.sp500}
                    className="h-3"
                  />
                </div>
                <div className="p-4 rounded-lg bg-primary/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Outperforming by</p>
                      <p className="text-2xl font-light text-primary">
                        +{(performanceData.benchmarkComparison.portfolio - performanceData.benchmarkComparison.sp500).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Timeline */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-light">Performance Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { period: "Daily", value: "+2.4%", trend: "up" },
                  { period: "Weekly", value: "+5.8%", trend: "up" },
                  { period: "Monthly", value: "+12.3%", trend: "up" },
                  { period: "Quarterly", value: "+18.5%", trend: "up" },
                  { period: "YTD", value: "+24.7%", trend: "up" },
                  { period: "1 Year", value: "+31.2%", trend: "up" },
                ].map((period) => (
                  <div key={period.period} className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-muted-foreground mb-1">{period.period}</p>
                    <div className="flex items-center gap-2">
                      {period.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={cn(
                        "text-lg font-light",
                        period.trend === "up" ? "text-success" : "text-destructive"
                      )}>
                        {period.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      {activeView === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Concentration Risks */}
          <Card className="bg-gradient-to-br from-warning/20 to-warning/10 border-warning/20 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Concentration Risk Alert</span>
                <AlertTriangle className="w-5 h-5 text-warning" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/20">
                  <p className="font-medium mb-1">Tech Sector Overweight</p>
                  <p className="text-sm text-muted-foreground">
                    35% of portfolio in technology exceeds recommended 25% limit
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black/20">
                  <p className="font-medium mb-1">Single Stock Concentration</p>
                  <p className="text-sm text-muted-foreground">
                    NVDA represents 18% of portfolio value (recommend &lt;10%)
                  </p>
                </div>
                <Button className="w-full rounded-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Rebalancing Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Correlations */}
          <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Hidden Correlations Found</span>
                <Brain className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="font-medium mb-1">AAPL ↔ MSFT</p>
                  <p className="text-sm text-muted-foreground">
                    85% correlation - Consider diversifying
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="font-medium mb-1">Energy Sector Inverse</p>
                  <p className="text-sm text-muted-foreground">
                    -0.65 correlation with tech holdings
                  </p>
                </div>
                <Button className="w-full rounded-full" variant="default">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Optimize Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tax Optimization */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Tax Optimization</span>
                <DollarSign className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="font-medium text-success mb-1">Harvest Losses</p>
                  <p className="text-sm text-muted-foreground">
                    $2,450 in losses available to offset gains
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="font-medium mb-1">Long-term Holdings</p>
                  <p className="text-sm text-muted-foreground">
                    Move 3 positions to long-term status in 45 days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rebalancing Suggestions */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Smart Rebalancing</span>
                <Activity className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Reduce NVDA</p>
                    <p className="text-xs text-muted-foreground">Sell 20 shares</p>
                  </div>
                  <Badge variant="outline">-$4,500</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Add Healthcare</p>
                    <p className="text-xs text-muted-foreground">Buy JNJ, PFE</p>
                  </div>
                  <Badge variant="outline">+$4,500</Badge>
                </div>
                <Button className="w-full rounded-full" variant="outline">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Execute Rebalancing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}