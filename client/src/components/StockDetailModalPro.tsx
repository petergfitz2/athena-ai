import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
  ReferenceLine, Brush
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Newspaper, Building2, Target, DollarSign, Calendar, AlertCircle, 
  ChevronUp, ChevronDown, Info, Star, Clock, Volume2, Play, Pause,
  Settings, Download, Maximize2, Grid3x3, ChartCandlestick, LineChartIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { MarketQuote, HistoricalData } from "@shared/schema";

interface StockDetailModalProProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  onTrade?: (action: 'buy' | 'sell', symbol: string) => void;
}

export function StockDetailModalPro({
  open,
  onOpenChange,
  symbol,
  onTrade,
}: StockDetailModalProProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1D");
  const [chartType, setChartType] = useState<"line" | "candle" | "area">("candle");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("volume");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real-time quote
  const { data: quote, refetch: refetchQuote } = useQuery<MarketQuote>({
    queryKey: ['/api/market/quote', symbol],
    enabled: !!symbol && open,
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch historical data
  const { data: historicalData } = useQuery<HistoricalData>({
    queryKey: ['/api/market/historical', symbol, selectedPeriod],
    enabled: !!symbol && open,
  });

  // Fetch news
  const { data: newsData } = useQuery({
    queryKey: ['/api/market/news', symbol],
    queryFn: async () => {
      // Mock news data for now
      return [
        {
          id: 1,
          headline: `${symbol} Beats Q3 Earnings Expectations, Revenue Up 15%`,
          source: "Reuters",
          time: "2 hours ago",
          sentiment: "positive",
          impact: "high",
        },
        {
          id: 2,
          headline: `Analysts Upgrade ${symbol} Price Target to $${((quote?.price || 100) * 1.2).toFixed(2)}`,
          source: "Bloomberg",
          time: "5 hours ago",
          sentiment: "positive",
          impact: "medium",
        },
        {
          id: 3,
          headline: `${symbol} Announces Strategic Partnership for AI Development`,
          source: "CNBC",
          time: "1 day ago",
          sentiment: "neutral",
          impact: "medium",
        },
        {
          id: 4,
          headline: `Market Watch: ${symbol} Among Top Movers in Tech Sector`,
          source: "WSJ",
          time: "2 days ago",
          sentiment: "neutral",
          impact: "low",
        },
      ];
    },
    enabled: !!symbol && open,
  });

  // Prepare chart data with technical indicators
  const chartData = historicalData?.data?.map(point => {
    const sma20 = historicalData.data
      .slice(Math.max(0, historicalData.data.indexOf(point) - 20), historicalData.data.indexOf(point) + 1)
      .reduce((sum, p) => sum + p.close, 0) / Math.min(20, historicalData.data.indexOf(point) + 1);
    
    const sma50 = historicalData.data
      .slice(Math.max(0, historicalData.data.indexOf(point) - 50), historicalData.data.indexOf(point) + 1)
      .reduce((sum, p) => sum + p.close, 0) / Math.min(50, historicalData.data.indexOf(point) + 1);

    return {
      date: new Date(point.date).getTime(),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      sma20,
      sma50,
      formattedDate: format(new Date(point.date), selectedPeriod === '1D' ? 'HH:mm' : 'MMM d'),
    };
  }) || [];

  // Mock fundamentals data
  const fundamentals = {
    marketCap: quote ? (quote.price * 1000000000).toLocaleString() : "N/A",
    peRatio: "28.5",
    eps: "12.45",
    dividend: "2.40",
    divYield: "1.85%",
    beta: "1.12",
    yearHigh: quote ? (quote.price * 1.3).toFixed(2) : "N/A",
    yearLow: quote ? (quote.price * 0.7).toFixed(2) : "N/A",
    avgVolume: "25.3M",
    shares: "1.05B",
  };

  // Mock analyst ratings
  const analystRatings = {
    strongBuy: 12,
    buy: 8,
    hold: 5,
    sell: 2,
    strongSell: 1,
    consensus: "Buy",
    priceTarget: quote ? (quote.price * 1.15).toFixed(2) : "N/A",
  };

  // Mock order book data
  const orderBook = {
    bids: [
      { price: quote?.price || 100 - 0.01, size: 1500, total: 1500 },
      { price: quote?.price || 100 - 0.02, size: 2300, total: 3800 },
      { price: quote?.price || 100 - 0.03, size: 1800, total: 5600 },
      { price: quote?.price || 100 - 0.04, size: 3200, total: 8800 },
      { price: quote?.price || 100 - 0.05, size: 2100, total: 10900 },
    ],
    asks: [
      { price: quote?.price || 100 + 0.01, size: 1200, total: 1200 },
      { price: quote?.price || 100 + 0.02, size: 1800, total: 3000 },
      { price: quote?.price || 100 + 0.03, size: 2500, total: 5500 },
      { price: quote?.price || 100 + 0.04, size: 1900, total: 7400 },
      { price: quote?.price || 100 + 0.05, size: 2200, total: 9600 },
    ],
  };

  const periodOptions = [
    { label: "1D", value: "1D" },
    { label: "5D", value: "5D" },
    { label: "1M", value: "1M" },
    { label: "3M", value: "3M" },
    { label: "6M", value: "6M" },
    { label: "1Y", value: "1Y" },
    { label: "5Y", value: "5Y" },
    { label: "Max", value: "ALL" },
  ];

  const changePercent = quote?.changePercent || 0;
  const isPositive = changePercent >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1600px] max-h-[90vh] overflow-hidden bg-black border-white/10 p-0">
        <DialogTitle className="sr-only">Stock Details for {symbol}</DialogTitle>
        <DialogDescription className="sr-only">
          View comprehensive trading data, charts, and analytics for {symbol} stock
        </DialogDescription>
        <div className="flex h-full">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{symbol}</h2>
                      <Badge variant="outline" className="text-xs">NASDAQ</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Technology Sector • Large Cap</p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">
                        ${quote?.price?.toFixed(2) || "0.00"}
                      </span>
                      <Badge 
                        variant={isPositive ? "default" : "destructive"}
                        className="text-sm px-2 py-1"
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Volume: {quote?.volume?.toLocaleString() || "0"} • 
                      Avg: {fundamentals.avgVolume}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="h-8 w-8"
                  >
                    {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chart Controls */}
            <div className="px-6 py-2 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {periodOptions.map(period => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value)}
                      className="h-7 px-3 text-xs"
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={chartType === "line" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="h-7 w-7 p-0"
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "candle" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("candle")}
                    className="h-7 w-7 p-0"
                  >
                    <ChartCandlestick className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "area" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="h-7 w-7 p-0"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 p-6">
              <div className="h-full bg-white/5 rounded-[20px] border border-white/10 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                    />
                    <YAxis 
                      yAxisId="price"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      yAxisId="volume"
                      orientation="right"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    
                    {/* Volume Bars */}
                    <Bar 
                      yAxisId="volume" 
                      dataKey="volume" 
                      fill="rgba(139, 92, 246, 0.3)" 
                      name="Volume"
                    />
                    
                    {/* Price Chart */}
                    {chartType === "area" && (
                      <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="close"
                        stroke="#8B5CF6"
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                        name="Price"
                      />
                    )}
                    {chartType === "line" && (
                      <>
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="close"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={false}
                          name="Price"
                        />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="sma20"
                          stroke="#10B981"
                          strokeWidth={1}
                          dot={false}
                          strokeDasharray="5 5"
                          name="SMA 20"
                        />
                        <Line
                          yAxisId="price"
                          type="monotone"
                          dataKey="sma50"
                          stroke="#F59E0B"
                          strokeWidth={1}
                          dot={false}
                          strokeDasharray="5 5"
                          name="SMA 50"
                        />
                      </>
                    )}
                    
                    <Brush dataKey="formattedDate" height={30} stroke="#8B5CF6" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade Actions */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => onTrade?.('buy', symbol)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  onClick={() => onTrade?.('sell', symbol)}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  size="lg"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[400px] border-l border-white/10 bg-white/5">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-white/10 h-12">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
                <TabsTrigger value="depth" className="text-xs">Depth</TabsTrigger>
                <TabsTrigger value="options" className="text-xs">Options</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                {/* Overview Tab */}
                <TabsContent value="overview" className="p-4 space-y-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Fundamentals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span>${fundamentals.marketCap}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">P/E Ratio</span>
                        <span>{fundamentals.peRatio}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">EPS</span>
                        <span>${fundamentals.eps}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Dividend</span>
                        <span>${fundamentals.dividend} ({fundamentals.divYield})</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Beta</span>
                        <span>{fundamentals.beta}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">52W High</span>
                        <span className="text-green-500">${fundamentals.yearHigh}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">52W Low</span>
                        <span className="text-red-500">${fundamentals.yearLow}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Analyst Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-500">
                          {analystRatings.consensus}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Target: ${analystRatings.priceTarget}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-green-500">Strong Buy</span>
                          <div className="flex-1 bg-white/10 rounded-full h-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: `${(analystRatings.strongBuy / 28) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right">{analystRatings.strongBuy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-green-400">Buy</span>
                          <div className="flex-1 bg-white/10 rounded-full h-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-green-400" style={{ width: `${(analystRatings.buy / 28) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right">{analystRatings.buy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-yellow-500">Hold</span>
                          <div className="flex-1 bg-white/10 rounded-full h-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-yellow-500" style={{ width: `${(analystRatings.hold / 28) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right">{analystRatings.hold}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-red-400">Sell</span>
                          <div className="flex-1 bg-white/10 rounded-full h-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-red-400" style={{ width: `${(analystRatings.sell / 28) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right">{analystRatings.sell}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-20 text-red-500">Strong Sell</span>
                          <div className="flex-1 bg-white/10 rounded-full h-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-red-500" style={{ width: `${(analystRatings.strongSell / 28) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right">{analystRatings.strongSell}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news" className="p-4">
                  <div className="space-y-3">
                    {newsData?.map((news) => (
                      <Card key={news.id} className="bg-white/5 border-white/10 hover-elevate cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-tight">{news.headline}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{news.source}</span>
                                <span>•</span>
                                <span>{news.time}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant={news.sentiment === "positive" ? "default" : news.sentiment === "negative" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {news.sentiment}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {news.impact}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Market Depth Tab */}
                <TabsContent value="depth" className="p-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Order Book</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-green-500 mb-2">Bids</h4>
                          <div className="space-y-1">
                            {orderBook.bids.map((bid, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-green-500">{bid.size.toLocaleString()}</span>
                                <span>${bid.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-red-500 mb-2">Asks</h4>
                          <div className="space-y-1">
                            {orderBook.asks.map((ask, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span>${ask.price.toFixed(2)}</span>
                                <span className="text-red-500">{ask.size.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}