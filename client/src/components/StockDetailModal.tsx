import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketQuote, HistoricalData } from "@shared/schema";
import { format } from "date-fns";
import AnimatedCounter from "./AnimatedCounter";
import { modalVariants, backdropVariants, chartVariants, tabContentVariants } from "@/lib/animations";

interface StockDetailModalProps {
  symbol: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrade?: (action: 'buy' | 'sell', symbol: string) => void;
}

const periodOptions = [
  { value: '1D', label: '1D' },
  { value: '5D', label: '5D' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: 'YTD', label: 'YTD' },
  { value: '5Y', label: '5Y' },
] as const;

export default function StockDetailModal({ symbol, open, onOpenChange, onTrade }: StockDetailModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | '5Y'>('1M');

  // Fetch current quote
  const { data: quote, isLoading: quoteLoading } = useQuery<MarketQuote>({
    queryKey: ['/api/market/quote', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('No symbol provided');
      const response = await fetch(`/api/market/quote/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch quote');
      return response.json();
    },
    enabled: !!symbol && open,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch historical data
  const { data: historicalData, isLoading: chartLoading } = useQuery<HistoricalData>({
    queryKey: ['/api/market/historical', symbol, selectedPeriod],
    queryFn: async () => {
      if (!symbol) throw new Error('No symbol provided');
      const response = await fetch(`/api/market/historical/${symbol}/${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch historical data');
      return response.json();
    },
    enabled: !!symbol && open,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!symbol) return null;

  const isPositive = (quote?.change ?? 0) >= 0;
  const changeColor = isPositive ? "text-green-400" : "text-red-400";
  const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10";

  // Prepare chart data
  const chartData = historicalData?.data?.map(point => ({
    date: new Date(point.date).getTime(),
    price: point.close,
    formattedDate: format(new Date(point.date), selectedPeriod === '1D' ? 'HH:mm' : 'MMM d'),
  })) || [];

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-foreground flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            {symbol}
            {quote && (
              <Badge variant="outline" className={cn("ml-2", bgColor, changeColor)}>
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed information and charts for {symbol}
          </DialogDescription>
        </DialogHeader>

        {quoteLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : quote ? (
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-semibold text-foreground">
                  ${quote.price.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={cn("text-xl font-semibold", changeColor)}>
                  {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-xl font-medium text-foreground">
                  {quote.volume ? (quote.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-medium text-foreground">
                  {quote.marketCap ? '$' + (quote.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A'}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-[28px] bg-white/5 border border-white/10">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="text-base font-medium text-foreground">
                  ${quote.open?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Previous Close</p>
                <p className="text-base font-medium text-foreground">
                  ${quote.previousClose?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Day High</p>
                <p className="text-base font-medium text-foreground">
                  ${quote.high?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Day Low</p>
                <p className="text-base font-medium text-foreground">
                  ${quote.low?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Price History
                </h3>
                <div className="flex gap-1 flex-wrap">
                  {periodOptions.map(period => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value)}
                      className="h-9 min-h-[36px] px-2 sm:px-3 text-xs"
                      data-testid={`button-period-${period.value.toLowerCase()}`}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              {chartLoading ? (
                <div className="flex items-center justify-center h-64 rounded-[28px] bg-white/5 border border-white/10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="rounded-[28px] bg-white/5 border border-white/10 p-4">
                  <ChartContainer config={chartConfig} className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="formattedDate" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg bg-black/90 border border-white/20 p-3 backdrop-blur-sm">
                                  <p className="text-xs text-muted-foreground">{payload[0].payload.formattedDate}</p>
                                  <p className="text-sm font-semibold text-foreground">
                                    ${Number(payload[0].value).toFixed(2)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-[28px] bg-white/5 border border-white/10">
                  <p className="text-muted-foreground">No chart data available</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {onTrade && (
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    onTrade('buy', symbol);
                    onOpenChange(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  data-testid="button-buy-stock"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy {symbol}
                </Button>
                <Button
                  onClick={() => {
                    onTrade('sell', symbol);
                    onOpenChange(false);
                  }}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  data-testid="button-sell-stock"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell {symbol}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Unable to load stock data</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
