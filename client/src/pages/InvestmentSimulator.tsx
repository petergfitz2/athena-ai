import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import FloatingAthenaOrb from "@/components/FloatingAthenaOrb";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  BarChart3,
  LineChart,
  Target,
  Activity,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Zap,
  Shield,
  Brain,
  History,
  Sparkles
} from "lucide-react";

interface StrategyAsset {
  symbol: string;
  name: string;
  allocation: number;
  category: string;
}

interface SimulationResult {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  bestMonth: number;
  worstMonth: number;
}

interface Scenario {
  name: string;
  description: string;
  icon: any;
  impact: number;
}

export default function InvestmentSimulator() {
  const [activeTab, setActiveTab] = useState("builder");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("5Y");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [rebalanceFrequency, setRebalanceFrequency] = useState("quarterly");
  
  const [strategyAssets, setStrategyAssets] = useState<StrategyAsset[]>([
    { symbol: "SPY", name: "S&P 500 ETF", allocation: 40, category: "Stocks" },
    { symbol: "AGG", name: "Bond ETF", allocation: 30, category: "Bonds" },
    { symbol: "GLD", name: "Gold ETF", allocation: 20, category: "Commodities" },
    { symbol: "VNQ", name: "Real Estate ETF", allocation: 10, category: "Real Estate" },
  ]);

  const simulationResult: SimulationResult = {
    totalReturn: 127.8,
    annualizedReturn: 18.2,
    volatility: 14.5,
    sharpeRatio: 1.25,
    maxDrawdown: -22.3,
    winRate: 68,
    bestMonth: 12.8,
    worstMonth: -8.4,
  };

  const scenarios: Scenario[] = [
    { name: "2008 Crisis", description: "Financial market crash", icon: TrendingDown, impact: -45 },
    { name: "COVID Crash", description: "2020 pandemic impact", icon: AlertTriangle, impact: -35 },
    { name: "Bull Market", description: "Strong growth period", icon: TrendingUp, impact: 65 },
    { name: "Stagflation", description: "High inflation, low growth", icon: Activity, impact: -15 },
  ];

  const handleAllocationChange = (index: number, value: number[]) => {
    const newAssets = [...strategyAssets];
    newAssets[index].allocation = value[0];
    
    // Normalize allocations to sum to 100
    const total = newAssets.reduce((sum, asset) => sum + asset.allocation, 0);
    if (total !== 100) {
      const scale = 100 / total;
      newAssets.forEach(asset => {
        asset.allocation = Math.round(asset.allocation * scale);
      });
    }
    
    setStrategyAssets(newAssets);
  };

  const addAsset = () => {
    setStrategyAssets([
      ...strategyAssets,
      { symbol: "NEW", name: "New Asset", allocation: 0, category: "Stocks" }
    ]);
  };

  const removeAsset = (index: number) => {
    const newAssets = strategyAssets.filter((_, i) => i !== index);
    setStrategyAssets(newAssets);
  };

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      <FloatingAthenaOrb />
      
      <div className="px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <BackButton />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight mt-4 mb-3">
              Investment Simulator
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground font-light">
              Test strategies and simulate portfolio performance
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-[600px] mx-auto h-auto p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
              <TabsTrigger value="builder" className="rounded-full py-3" data-testid="tab-strategy-builder">
                <Brain className="w-4 h-4 mr-2" />
                Strategy Builder
              </TabsTrigger>
              <TabsTrigger value="backtest" className="rounded-full py-3" data-testid="tab-backtesting">
                <History className="w-4 h-4 mr-2" />
                Backtesting
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="rounded-full py-3" data-testid="tab-scenarios">
                <Zap className="w-4 h-4 mr-2" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger value="compare" className="rounded-full py-3" data-testid="tab-compare">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare
              </TabsTrigger>
            </TabsList>

            {/* Strategy Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Allocation */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Portfolio Composition</span>
                      <Button
                        onClick={addAsset}
                        size="sm"
                        className="rounded-full"
                        data-testid="button-add-asset"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Asset
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {strategyAssets.map((asset, index) => (
                          <div key={index} className="space-y-2 p-4 rounded-lg bg-white/5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{asset.symbol}</p>
                                <p className="text-xs text-muted-foreground">{asset.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{asset.allocation}%</Badge>
                                <Button
                                  onClick={() => removeAsset(index)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full"
                                  data-testid={`button-remove-${asset.symbol}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <Slider
                              value={[asset.allocation]}
                              onValueChange={(value) => handleAllocationChange(index, value)}
                              max={100}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Allocation Pie Chart */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="font-light">Visual Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64 flex items-center justify-center">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {(() => {
                          let cumulativeAngle = 0;
                          return strategyAssets.map((asset, index) => {
                            const startAngle = cumulativeAngle;
                            const angle = (asset.allocation / 100) * 360;
                            const endAngle = startAngle + angle;
                            cumulativeAngle = endAngle;
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const colors = ["hsl(258 90% 66%)", "hsl(280 85% 40%)", "hsl(240 80% 45%)", "hsl(200 75% 40%)"];
                            const color = colors[index % colors.length];
                            
                            const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                            const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                            const endX = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                            const endY = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                            
                            return (
                              <g key={asset.symbol}>
                                <path
                                  d={`M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                  fill={color}
                                  opacity="0.8"
                                  className="hover:opacity-100 transition-opacity"
                                />
                              </g>
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {strategyAssets.map((asset, index) => {
                        const colors = ["hsl(258 90% 66%)", "hsl(280 85% 40%)", "hsl(240 80% 45%)", "hsl(200 75% 40%)"];
                        const color = colors[index % colors.length];
                        return (
                          <div key={asset.symbol} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-sm">{asset.symbol}</span>
                            <span className="text-sm text-muted-foreground ml-auto">{asset.allocation}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Rules */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-light">Investment Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Rebalancing Frequency
                        </label>
                        <Select value={rebalanceFrequency} onValueChange={setRebalanceFrequency}>
                          <SelectTrigger className="rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Risk Tolerance
                        </label>
                        <Select defaultValue="moderate">
                          <SelectTrigger className="rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Investment Amount
                        </label>
                        <Select defaultValue="10000">
                          <SelectTrigger className="rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000">$1,000</SelectItem>
                            <SelectItem value="10000">$10,000</SelectItem>
                            <SelectItem value="100000">$100,000</SelectItem>
                            <SelectItem value="1000000">$1,000,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Monthly Contribution
                        </label>
                        <Select defaultValue="500">
                          <SelectTrigger className="rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            <SelectItem value="100">$100</SelectItem>
                            <SelectItem value="500">$500</SelectItem>
                            <SelectItem value="1000">$1,000</SelectItem>
                            <SelectItem value="5000">$5,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Backtesting Tab */}
            <TabsContent value="backtest" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-3">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          onClick={runSimulation}
                          className="rounded-full"
                          disabled={isRunning}
                          data-testid="button-run-simulation"
                        >
                          {isRunning ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Run Simulation
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          data-testid="button-reset-simulation"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm text-muted-foreground">Period:</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger className="w-32 rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1Y">1 Year</SelectItem>
                            <SelectItem value="5Y">5 Years</SelectItem>
                            <SelectItem value="10Y">10 Years</SelectItem>
                            <SelectItem value="20Y">20 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isRunning && (
                      <Progress value={66} className="mt-4" />
                    )}
                  </CardContent>
                </Card>

                {/* Results Overview */}
                <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Total Return</span>
                      <Trophy className="w-5 h-5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-extralight text-primary">
                      +{simulationResult.totalReturn}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {simulationResult.annualizedReturn}% annualized
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Risk Metrics</span>
                      <Shield className="w-5 h-5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volatility</span>
                        <span className="text-sm font-medium">{simulationResult.volatility}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="text-sm font-medium text-destructive">
                          {simulationResult.maxDrawdown}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="text-sm font-medium">{simulationResult.sharpeRatio}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Performance Stats</span>
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className="text-sm font-medium text-success">{simulationResult.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Best Month</span>
                        <span className="text-sm font-medium text-success">
                          +{simulationResult.bestMonth}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Worst Month</span>
                        <span className="text-sm font-medium text-destructive">
                          {simulationResult.worstMonth}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="font-light">Performance Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-white/5 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Performance chart visualization would go here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scenario Selection */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="font-light">Test Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scenarios.map((scenario) => {
                        const Icon = scenario.icon;
                        const isSelected = selectedScenario === scenario.name;
                        return (
                          <div
                            key={scenario.name}
                            onClick={() => setSelectedScenario(scenario.name)}
                            className={cn(
                              "p-4 rounded-lg cursor-pointer transition-all",
                              isSelected
                                ? "bg-primary/20 border border-primary"
                                : "bg-white/5 hover:bg-white/10 border border-transparent"
                            )}
                            data-testid={`scenario-${scenario.name.toLowerCase().replace(' ', '-')}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className={cn(
                                  "w-5 h-5",
                                  scenario.impact < 0 ? "text-destructive" : "text-success"
                                )} />
                                <div>
                                  <p className="font-medium">{scenario.name}</p>
                                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={scenario.impact < 0 ? "destructive" : "default"}
                                className="ml-2"
                              >
                                {scenario.impact > 0 ? "+" : ""}{scenario.impact}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      className="w-full mt-4 rounded-full"
                      disabled={!selectedScenario}
                      data-testid="button-run-scenario"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Run Scenario Test
                    </Button>
                  </CardContent>
                </Card>

                {/* Scenario Results */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="font-light">Scenario Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedScenario ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5">
                          <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-light">$87,450</p>
                            <Badge variant="destructive">-12.6%</Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Recovery Time</span>
                            <span className="text-sm font-medium">8 months</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Worst Drawdown</span>
                            <span className="text-sm font-medium text-destructive">-28%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Stress Score</span>
                            <Badge variant="outline">7.2/10</Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Select a scenario to see impact analysis
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monte Carlo Simulation */}
                <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px] lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Monte Carlo Projection</span>
                      <Sparkles className="w-5 h-5 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Best Case (95%)</p>
                        <p className="text-2xl font-light text-success">$285,000</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Expected</p>
                        <p className="text-2xl font-light text-primary">$178,000</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Worst Case (5%)</p>
                        <p className="text-2xl font-light text-destructive">$95,000</p>
                      </div>
                    </div>
                    <div className="h-[200px] bg-white/5 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Monte Carlo simulation paths would be visualized here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strategy Comparison */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-light">Strategy Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 font-light text-muted-foreground">Strategy</th>
                            <th className="text-right py-3 px-4 font-light text-muted-foreground">Return</th>
                            <th className="text-right py-3 px-4 font-light text-muted-foreground">Risk</th>
                            <th className="text-right py-3 px-4 font-light text-muted-foreground">Sharpe</th>
                            <th className="text-right py-3 px-4 font-light text-muted-foreground">Max DD</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-medium">Your Strategy</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 text-success">+127.8%</td>
                            <td className="text-right py-3 px-4">14.5%</td>
                            <td className="text-right py-3 px-4">1.25</td>
                            <td className="text-right py-3 px-4 text-destructive">-22.3%</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>S&P 500</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">+98.5%</td>
                            <td className="text-right py-3 px-4">16.2%</td>
                            <td className="text-right py-3 px-4">0.95</td>
                            <td className="text-right py-3 px-4 text-destructive">-33.7%</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>60/40 Portfolio</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">+72.3%</td>
                            <td className="text-right py-3 px-4">9.8%</td>
                            <td className="text-right py-3 px-4">1.15</td>
                            <td className="text-right py-3 px-4 text-destructive">-18.2%</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>All Weather</span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">+65.4%</td>
                            <td className="text-right py-3 px-4">7.2%</td>
                            <td className="text-right py-3 px-4">1.35</td>
                            <td className="text-right py-3 px-4 text-destructive">-12.5%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk-Adjusted Returns */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="font-light">Risk-Adjusted Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Your Strategy</span>
                          <span className="text-sm font-medium">1.25</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">S&P 500</span>
                          <span className="text-sm font-medium">0.95</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">60/40 Portfolio</span>
                          <span className="text-sm font-medium">1.15</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">All Weather</span>
                          <span className="text-sm font-medium">1.35</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Winner Analysis */}
                <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/20 rounded-[20px]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="font-light">Performance Winner</span>
                      <Trophy className="w-5 h-5 text-success" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-light mb-1">Your Strategy</p>
                        <p className="text-sm text-muted-foreground">
                          Outperforms market by 29.3%
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-black/20">
                          <p className="text-xs text-muted-foreground">Best Feature</p>
                          <p className="text-sm font-medium">Lower Drawdown</p>
                        </div>
                        <div className="p-3 rounded-lg bg-black/20">
                          <p className="text-xs text-muted-foreground">Key Advantage</p>
                          <p className="text-sm font-medium">Better Sharpe</p>
                        </div>
                      </div>
                      <Button className="w-full rounded-full" variant="outline">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Deploy This Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}