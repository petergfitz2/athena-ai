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
  LineChart, Line, AreaChart, Area, BarChart, Bar, CandlestickChart,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
  ReferenceLine, Brush, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Newspaper, Building2, Target, DollarSign, Calendar, AlertCircle, 
  ChevronUp, ChevronDown, Info, Star, Clock, Volume2, Play, Pause,
  Settings, Download, Maximize2, Grid3x3, ChartCandlestick, LineChartIcon,
  X, ShoppingCart, Wallet
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
  const [chartType, setChartType] = useState<"line" | "candle" | "area">("area");
  const [selectedTab, setSelectedTab] = useState("overview");
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

  // Mock comprehensive trading data
  const tradingData = {
    // Price Information
    bid: quote?.price ? (quote.price - 0.01).toFixed(2) : "0.00",
    ask: quote?.price ? (quote.price + 0.01).toFixed(2) : "0.00",
    bidSize: "1,500",
    askSize: "1,200",
    spread: "0.02",
    
    // Volume Data
    volume: quote?.volume?.toLocaleString() || "2,345,678",
    avgVolume: "3,456,789",
    volumeRatio: "0.68",
    
    // Price Ranges
    dayLow: quote?.low?.toFixed(2) || (quote?.price ? (quote.price * 0.98).toFixed(2) : "98.00"),
    dayHigh: quote?.high?.toFixed(2) || (quote?.price ? (quote.price * 1.02).toFixed(2) : "102.00"),
    weekLow: quote?.price ? (quote.price * 0.95).toFixed(2) : "95.00",
    weekHigh: quote?.price ? (quote.price * 1.05).toFixed(2) : "105.00",
    monthLow: quote?.price ? (quote.price * 0.92).toFixed(2) : "92.00",
    monthHigh: quote?.price ? (quote.price * 1.08).toFixed(2) : "108.00",
    yearLow: quote?.price ? (quote.price * 0.70).toFixed(2) : "70.00",
    yearHigh: quote?.price ? (quote.price * 1.30).toFixed(2) : "130.00",
    
    // Fundamental Metrics
    marketCap: quote?.marketCap ? (quote.marketCap / 1e9).toFixed(2) + "B" : "345.67B",
    peRatio: quote?.pe?.toFixed(2) || "28.50",
    forwardPE: "25.30",
    pegRatio: "1.85",
    eps: "12.45",
    epsGrowth: "+15.2%",
    dividend: "2.40",
    divYield: "1.85%",
    payoutRatio: "32.5%",
    
    // Technical Indicators
    rsi: "58.3",
    macd: "1.25",
    movingAvg50: quote?.price ? (quote.price * 0.97).toFixed(2) : "97.00",
    movingAvg200: quote?.price ? (quote.price * 0.93).toFixed(2) : "93.00",
    beta: "1.12",
    volatility: "28.5%",
    
    // Company Metrics
    revenue: "$89.5B",
    revenueGrowth: "+12.3%",
    grossMargin: "42.5%",
    operatingMargin: "28.3%",
    netMargin: "21.7%",
    roe: "45.2%",
    roa: "18.6%",
    debtToEquity: "0.65",
    currentRatio: "1.85",
    quickRatio: "1.45",
    
    // Trading Activity
    shortInterest: "3.2%",
    shortRatio: "2.8",
    institutionalOwnership: "78.5%",
    insiderOwnership: "5.2%",
    floatShares: "985M",
    sharesOutstanding: "1.05B",
  };

  // Prepare chart data
  const chartData = historicalData?.data?.map((point, index) => ({
    date: new Date(point.date).getTime(),
    time: format(new Date(point.date), selectedPeriod === '1D' ? 'HH:mm' : 'MMM d'),
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume,
    value: point.close,
    change: index > 0 ? point.close - historicalData.data[index - 1].close : 0,
  })) || Array.from({ length: 50 }, (_, i) => ({
    time: format(new Date(Date.now() - (50 - i) * 3600000), selectedPeriod === '1D' ? 'HH:mm' : 'MMM d'),
    value: (quote?.price || 100) + (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 1000000),
  }));

  // Mock news data
  const newsData = [
    {
      id: 1,
      headline: `${symbol} Beats Q3 Earnings Expectations, Revenue Up 15%`,
      source: "Reuters",
      time: "2 hours ago",
      sentiment: "positive",
      impact: "high",
      summary: "Company reports strong quarterly results with revenue beating analyst estimates by 8%.",
    },
    {
      id: 2,
      headline: `Analysts Upgrade ${symbol} Price Target to $${((quote?.price || 100) * 1.2).toFixed(2)}`,
      source: "Bloomberg",
      time: "5 hours ago",
      sentiment: "positive",
      impact: "medium",
      summary: "Major investment banks raise price targets following strong product launch.",
    },
    {
      id: 3,
      headline: `${symbol} Announces $10B Share Buyback Program`,
      source: "CNBC",
      time: "1 day ago",
      sentiment: "positive",
      impact: "high",
      summary: "Board approves massive share repurchase program signaling confidence in future growth.",
    },
  ];

  // Analyst ratings
  const analystData = {
    strongBuy: 15,
    buy: 12,
    hold: 8,
    sell: 3,
    strongSell: 1,
    total: 39,
    consensus: "Strong Buy",
    avgTarget: quote?.price ? (quote.price * 1.18).toFixed(2) : "118.00",
    highTarget: quote?.price ? (quote.price * 1.35).toFixed(2) : "135.00",
    lowTarget: quote?.price ? (quote.price * 1.05).toFixed(2) : "105.00",
  };

  const changePercent = quote?.changePercent || 2.85;
  const isPositive = changePercent >= 0;
  const changeAmount = quote?.change || 2.78;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] bg-black border border-white/20 p-0 flex flex-col">
        <DialogTitle className="sr-only">Stock Details for {symbol}</DialogTitle>
        <DialogDescription className="sr-only">
          View comprehensive trading data, charts, and analytics for {symbol} stock
        </DialogDescription>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white">{symbol}</h2>
                  <Badge className="bg-primary/20 text-primary border-primary/30">NASDAQ</Badge>
                  <Badge variant="outline" className="text-xs">Technology</Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">Large Cap • United States</p>
              </div>
              
              <Separator orientation="vertical" className="h-14 bg-white/10" />
              
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white">
                    ${quote?.price?.toFixed(2) || "100.00"}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}>
                    {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    <span className="text-xl font-semibold">
                      {isPositive ? "+" : ""}{changeAmount.toFixed(2)}
                    </span>
                    <span className="text-lg">
                      ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onTrade?.('buy', symbol)}
                data-testid="button-modal-buy"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy
              </Button>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600/10"
                onClick={() => onTrade?.('sell', symbol)}
                data-testid="button-modal-sell"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Sell
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-black/50">
          <div className="grid grid-cols-8 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Volume</p>
              <p className="text-white font-semibold">{tradingData.volume}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Market Cap</p>
              <p className="text-white font-semibold">{tradingData.marketCap}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">P/E Ratio</p>
              <p className="text-white font-semibold">{tradingData.peRatio}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Day Range</p>
              <p className="text-white font-semibold">{tradingData.dayLow} - {tradingData.dayHigh}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">52W Range</p>
              <p className="text-white font-semibold">{tradingData.yearLow} - {tradingData.yearHigh}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Dividend</p>
              <p className="text-white font-semibold">${tradingData.dividend} ({tradingData.divYield})</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">EPS</p>
              <p className="text-white font-semibold">${tradingData.eps}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Beta</p>
              <p className="text-white font-semibold">{tradingData.beta}</p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start px-6 bg-transparent border-b border-white/10 rounded-none h-12 shrink-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">Overview</TabsTrigger>
            <TabsTrigger value="chart" className="data-[state=active]:bg-primary/20">Chart</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary/20">Analysis</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-primary/20">News</TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-primary/20">Financials</TabsTrigger>
            <TabsTrigger value="options" className="data-[state=active]:bg-primary/20">Options</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-6 space-y-6">
              {/* Main Chart */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Price Chart</CardTitle>
                    <div className="flex gap-2">
                      {periodOptions.map((period) => (
                        <Button
                          key={period.value}
                          size="sm"
                          variant={selectedPeriod === period.value ? "default" : "ghost"}
                          onClick={() => setSelectedPeriod(period.value)}
                          className="h-7"
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#999' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="url(#colorValue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Trading Metrics Grid */}
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Trading Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Bid/Ask</span>
                      <span className="text-white font-medium">${tradingData.bid} / ${tradingData.ask}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Spread</span>
                      <span className="text-white font-medium">${tradingData.spread}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Volume</span>
                      <span className="text-white font-medium">{tradingData.volume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Avg Volume</span>
                      <span className="text-white font-medium">{tradingData.avgVolume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Volume Ratio</span>
                      <span className="text-white font-medium">{tradingData.volumeRatio}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Fundamentals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Market Cap</span>
                      <span className="text-white font-medium">${tradingData.marketCap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">P/E Ratio</span>
                      <span className="text-white font-medium">{tradingData.peRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Forward P/E</span>
                      <span className="text-white font-medium">{tradingData.forwardPE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">EPS</span>
                      <span className="text-white font-medium">${tradingData.eps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Revenue</span>
                      <span className="text-white font-medium">{tradingData.revenue}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Technical Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">RSI (14)</span>
                      <span className="text-white font-medium">{tradingData.rsi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">50-Day MA</span>
                      <span className="text-white font-medium">${tradingData.movingAvg50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">200-Day MA</span>
                      <span className="text-white font-medium">${tradingData.movingAvg200}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Volatility</span>
                      <span className="text-white font-medium">{tradingData.volatility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Beta</span>
                      <span className="text-white font-medium">{tradingData.beta}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Analyst Ratings */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Analyst Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-lg px-3 py-1">
                          {analystData.consensus}
                        </Badge>
                        <span className="text-gray-400">Based on {analystData.total} analysts</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Average Target</p>
                        <p className="text-2xl font-bold text-white">${analystData.avgTarget}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {Array.from({ length: analystData.strongBuy }).map((_, i) => (
                          <div key={`sb-${i}`} className="flex-1 h-8 bg-green-600 rounded-sm" />
                        ))}
                        {Array.from({ length: analystData.buy }).map((_, i) => (
                          <div key={`b-${i}`} className="flex-1 h-8 bg-green-500 rounded-sm" />
                        ))}
                        {Array.from({ length: analystData.hold }).map((_, i) => (
                          <div key={`h-${i}`} className="flex-1 h-8 bg-yellow-600 rounded-sm" />
                        ))}
                        {Array.from({ length: analystData.sell }).map((_, i) => (
                          <div key={`s-${i}`} className="flex-1 h-8 bg-red-500 rounded-sm" />
                        ))}
                        {Array.from({ length: analystData.strongSell }).map((_, i) => (
                          <div key={`ss-${i}`} className="flex-1 h-8 bg-red-600 rounded-sm" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                      <div>
                        <p className="text-green-400 font-semibold">{analystData.strongBuy}</p>
                        <p className="text-gray-500 text-xs">Strong Buy</p>
                      </div>
                      <div>
                        <p className="text-green-300 font-semibold">{analystData.buy}</p>
                        <p className="text-gray-500 text-xs">Buy</p>
                      </div>
                      <div>
                        <p className="text-yellow-400 font-semibold">{analystData.hold}</p>
                        <p className="text-gray-500 text-xs">Hold</p>
                      </div>
                      <div>
                        <p className="text-red-300 font-semibold">{analystData.sell}</p>
                        <p className="text-gray-500 text-xs">Sell</p>
                      </div>
                      <div>
                        <p className="text-red-400 font-semibold">{analystData.strongSell}</p>
                        <p className="text-gray-500 text-xs">Strong Sell</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chart" className="p-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Advanced Chart</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={chartType === "line" ? "default" : "ghost"}
                          onClick={() => setChartType("line")}
                          className="h-7"
                        >
                          <LineChartIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={chartType === "area" ? "default" : "ghost"}
                          onClick={() => setChartType("area")}
                          className="h-7"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={chartType === "candle" ? "default" : "ghost"}
                          onClick={() => setChartType("candle")}
                          className="h-7"
                        >
                          <ChartCandlestick className="w-4 h-4" />
                        </Button>
                      </div>
                      {periodOptions.map((period) => (
                        <Button
                          key={period.value}
                          size="sm"
                          variant={selectedPeriod === period.value ? "default" : "ghost"}
                          onClick={() => setSelectedPeriod(period.value)}
                          className="h-7"
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={500}>
                    {chartType === "area" ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8B5CF6"
                          fill="url(#colorGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="time" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                  
                  {/* Volume Chart */}
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Bar dataKey="volume" fill="#8B5CF6" opacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Price Targets */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Price Targets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Price</span>
                        <span className="text-white font-bold text-lg">${quote?.price?.toFixed(2) || "100.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Target</span>
                        <span className="text-green-400 font-bold text-lg">${analystData.avgTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">High Target</span>
                        <span className="text-green-300">${analystData.highTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Low Target</span>
                        <span className="text-yellow-400">${analystData.lowTarget}</span>
                      </div>
                    </div>
                    <Separator className="bg-white/10" />
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Implied Upside</p>
                      <p className="text-2xl font-bold text-green-400">+18.0%</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Key Metrics */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">ROE</span>
                      <span className="text-white font-medium">{tradingData.roe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">ROA</span>
                      <span className="text-white font-medium">{tradingData.roa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Gross Margin</span>
                      <span className="text-white font-medium">{tradingData.grossMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Operating Margin</span>
                      <span className="text-white font-medium">{tradingData.operatingMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Net Margin</span>
                      <span className="text-white font-medium">{tradingData.netMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Debt/Equity</span>
                      <span className="text-white font-medium">{tradingData.debtToEquity}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="news" className="p-6">
              <div className="space-y-4">
                {newsData.map((news) => (
                  <Card key={news.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{news.headline}</h3>
                          <p className="text-gray-400 text-sm mb-2">{news.summary}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">{news.source}</span>
                            <span className="text-xs text-gray-500">{news.time}</span>
                            <Badge 
                              className={cn(
                                "text-xs",
                                news.sentiment === "positive" && "bg-green-600/20 text-green-400 border-green-600/30",
                                news.sentiment === "negative" && "bg-red-600/20 text-red-400 border-red-600/30",
                                news.sentiment === "neutral" && "bg-gray-600/20 text-gray-400 border-gray-600/30"
                              )}
                            >
                              {news.sentiment}
                            </Badge>
                          </div>
                        </div>
                        <ChevronUp className="w-4 h-4 text-gray-500 rotate-90" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="financials" className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Income Statement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Revenue</span>
                      <span className="text-white font-medium">{tradingData.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Revenue Growth</span>
                      <span className="text-green-400 font-medium">{tradingData.revenueGrowth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Gross Margin</span>
                      <span className="text-white font-medium">{tradingData.grossMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Operating Margin</span>
                      <span className="text-white font-medium">{tradingData.operatingMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Net Margin</span>
                      <span className="text-white font-medium">{tradingData.netMargin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">EPS Growth</span>
                      <span className="text-green-400 font-medium">{tradingData.epsGrowth}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Balance Sheet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Current Ratio</span>
                      <span className="text-white font-medium">{tradingData.currentRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Quick Ratio</span>
                      <span className="text-white font-medium">{tradingData.quickRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Debt/Equity</span>
                      <span className="text-white font-medium">{tradingData.debtToEquity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">ROE</span>
                      <span className="text-white font-medium">{tradingData.roe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">ROA</span>
                      <span className="text-white font-medium">{tradingData.roa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Payout Ratio</span>
                      <span className="text-white font-medium">{tradingData.payoutRatio}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="p-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Options Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Options data coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}