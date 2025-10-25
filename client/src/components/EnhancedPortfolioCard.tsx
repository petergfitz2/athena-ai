import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  ShoppingCart, DollarSign, ChevronUp, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStockDetailModal } from "@/contexts/StockDetailModalContext";
import type { MarketQuote } from "@shared/schema";

interface EnhancedPortfolioCardProps {
  symbol: string;
  shares: number;
  averageCost: number;
  quote?: MarketQuote;
  onBuy?: (symbol: string) => void;
  onSell?: (symbol: string) => void;
  className?: string;
}

export function EnhancedPortfolioCard({ 
  symbol, 
  shares,
  averageCost,
  quote: quoteProp,
  onBuy, 
  onSell,
  className
}: EnhancedPortfolioCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useStockDetailModal();
  
  // Only fetch quote if not provided as prop (avoid N+1 queries)
  const { data: fetchedQuote, isLoading } = useQuery<MarketQuote>({
    queryKey: ['/api/market/quote', symbol],
    refetchInterval: 10000,
    enabled: !quoteProp,
  });
  
  const quote = quoteProp || fetchedQuote;
  
  // Generate sparkline data
  const sparklineData = useMemo(() => {
    if (!quote) return [];
    const basePrice = quote.price;
    const volatility = 0.02;
    return Array.from({ length: 24 }, (_, i) => ({
      value: basePrice * (1 + (Math.random() - 0.5) * volatility + (quote.changePercent / 100) * (i / 24))
    }));
  }, [quote]);
  
  if (isLoading) {
    return (
      <Card className={cn(
        "h-full min-h-[480px] bg-[#0F0F12] border border-white/10 rounded-[20px] animate-pulse",
        className
      )}>
        <CardContent className="p-6">
          <div className="h-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!quote) return null;
  
  // Calculate metrics
  const currentPrice = quote.price;
  const totalValue = currentPrice * shares;
  const totalCost = averageCost * shares;
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  const isPositive = totalGain >= 0;
  
  // Formatters
  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toString();
  };
  
  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return formatCurrency(num);
  };
  
  return (
    <Card 
      className={cn(
        "h-full min-h-[480px] bg-[#0F0F12] border border-white/10 rounded-[20px]",
        "transition-all duration-300 ease-in-out cursor-pointer",
        "hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(123,77,255,0.2)]",
        "flex flex-col",
        className
      )}
      onClick={() => openModal(symbol)}
      data-testid={`portfolio-card-${symbol}`}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-semibold text-white">{symbol}</span>
              <Badge variant="outline" className="text-xs bg-[#7B4DFF]/10 border-[#7B4DFF]/30 text-[#7B4DFF]">
                NASDAQ
              </Badge>
            </div>
            <p className="text-sm text-white/60">
              {shares} shares
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-2xl font-semibold text-white">${formatCurrency(totalValue)}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0 flex-1 flex flex-col space-y-4">
        {/* Price and Chart Row */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Price</p>
            <p className="text-3xl font-semibold text-white">
              ${currentPrice.toFixed(2)}
            </p>
            <div className={cn(
              "flex items-center gap-1 mt-2",
              quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {quote.changePercent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          {/* Sparkline */}
          <div className="w-32 h-16">
            {sparklineData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={quote.changePercent >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* P&L Section */}
        <div className="p-4 bg-black/40 rounded-[16px] border border-white/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Avg Cost</span>
              <span className="font-medium text-white text-right">${averageCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Shares</span>
              <span className="font-medium text-white text-right">{shares}</span>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Total P&L</span>
                <div className={cn(
                  "flex items-center gap-1",
                  isPositive ? 'text-green-400' : 'text-red-400'
                )}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <div className="text-right">
                    <div className="font-semibold">
                      {isPositive ? '+' : ''}${formatCurrency(Math.abs(totalGain))}
                    </div>
                    <div className="text-xs">
                      {isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-black/20 rounded-[12px]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Day High</p>
            <p className="font-medium text-white text-right">
              ${quote.high?.toFixed(2) || (quote.price * 1.02).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-black/20 rounded-[12px]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Day Low</p>
            <p className="font-medium text-white text-right">
              ${quote.low?.toFixed(2) || (quote.price * 0.98).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-black/20 rounded-[12px]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Volume</p>
            <p className="font-medium text-white text-right">{formatVolume(quote.volume || 0)}</p>
          </div>
          <div className="p-3 bg-black/20 rounded-[12px]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Mkt Cap</p>
            <p className="font-medium text-white text-right">${formatMarketCap(quote.marketCap || 0)}</p>
          </div>
        </div>
        
        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Show More
            </>
          )}
        </Button>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">Open</span>
                <p className="font-medium text-white text-right mt-1">
                  ${quote.open?.toFixed(2) || quote.price.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">Prev Close</span>
                <p className="font-medium text-white text-right mt-1">
                  ${quote.previousClose?.toFixed(2) || quote.price.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">52W High</span>
                <p className="font-medium text-green-400 text-right mt-1">
                  ${(quote.price * 1.3).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">52W Low</span>
                <p className="font-medium text-red-400 text-right mt-1">
                  ${(quote.price * 0.7).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">P/E Ratio</span>
                <p className="font-medium text-white text-right mt-1">
                  {quote.pe?.toFixed(2) || "28.50"}
                </p>
              </div>
              <div className="p-3 bg-black/20 rounded-[12px]">
                <span className="text-xs text-white/40 uppercase tracking-wider">Beta</span>
                <p className="font-medium text-white text-right mt-1">1.12</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons - Fixed at Bottom */}
        <div className="flex gap-3 mt-auto pt-4">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(symbol);
            }}
            className="flex-1 rounded-full bg-[#7B4DFF] hover:bg-[#7B4DFF]/90 border-[#7B4DFF] text-white h-10"
            data-testid={`button-buy-${symbol}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy More
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSell?.(symbol);
            }}
            className="flex-1 rounded-full border-white/20 hover:bg-white/10 text-white h-10"
            data-testid={`button-sell-${symbol}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}