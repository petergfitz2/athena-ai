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
import { TickerLink } from "@/components/TickerLink";
import { useStockDetailModal } from "@/contexts/StockDetailModalContext";
import type { MarketQuote } from "@shared/schema";

interface EnhancedPortfolioCardProps {
  symbol: string;
  shares: number;
  averageCost: number;
  quote?: MarketQuote; // Optional to avoid N+1 queries
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
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !quoteProp, // Only fetch if quote not provided
  });
  
  // Use provided quote or fetched quote
  const quote = quoteProp || fetchedQuote;
  
  // Generate mock sparkline data based on current price
  const sparklineData = useMemo(() => {
    if (!quote) return [];
    const basePrice = quote.price;
    const volatility = 0.02; // 2% volatility
    return Array.from({ length: 24 }, (_, i) => ({
      value: basePrice * (1 + (Math.random() - 0.5) * volatility + (quote.changePercent / 100) * (i / 24))
    }));
  }, [quote]);
  
  if (isLoading) {
    return (
      <Card className={cn("bg-white/5 border-white/10 animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="h-48" />
        </CardContent>
      </Card>
    );
  }
  
  if (!quote) {
    return null;
  }
  
  // Calculate position metrics
  const currentPrice = quote.price;
  const totalValue = currentPrice * shares;
  const totalCost = averageCost * shares;
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  const isPositive = totalGain >= 0;
  
  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };
  
  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toString();
  };
  
  return (
    <Card 
      className={cn(
        "bg-white/5 border-white/10 backdrop-blur-sm transition-all hover-elevate cursor-pointer",
        className
      )}
      onClick={() => openModal(symbol)}
      data-testid={`portfolio-card-${symbol}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{symbol}</span>
              <Badge variant="outline" className="text-xs">
                NASDAQ
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {shares} shares
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">TOTAL VALUE</p>
            <p className="text-xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Daily Change */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">PRICE</p>
            <p className="text-2xl font-semibold">
              ${currentPrice.toFixed(2)}
            </p>
            <div className={`flex items-center gap-1 ${quote.changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
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
          
          {/* Sparkline Chart */}
          <div className="w-24 h-12">
            {sparklineData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={quote.changePercent >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Position P&L */}
        <div className="p-3 bg-black/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">SHARES</span>
            <span className="font-medium">{shares}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">AVG COST</span>
            <span className="font-medium">${averageCost.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">P&L</span>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="font-bold">
                  {isPositive ? '+' : ''}${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' '}
                  ({isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">HIGH</p>
            <p className="font-medium">${quote.high?.toFixed(2) || (quote.price * 1.02).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">LOW</p>
            <p className="font-medium">${quote.low?.toFixed(2) || (quote.price * 0.98).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">VOLUME</p>
            <p className="font-medium">{formatVolume(quote.volume || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">MKT CAP</p>
            <p className="font-medium">${formatNumber(quote.marketCap || 0)}</p>
          </div>
        </div>
        
        {/* Expand for more details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full rounded-full"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-4 border-t border-white/10 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Open</span>
                <p className="font-medium">${quote.open?.toFixed(2) || quote.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prev Close</span>
                <p className="font-medium">${quote.previousClose?.toFixed(2) || quote.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">52W High</span>
                <p className="font-medium text-green-500">
                  ${(quote.price * 1.3).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">52W Low</span>
                <p className="font-medium text-red-500">
                  ${(quote.price * 0.7).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">P/E Ratio</span>
                <p className="font-medium">{quote.pe?.toFixed(2) || "28.50"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Beta</span>
                <p className="font-medium">1.12</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBuy?.(symbol);
            }}
            className="rounded-full flex-1 gap-1"
            data-testid={`button-buy-${symbol}`}
          >
            <ShoppingCart className="w-3 h-3" />
            Buy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSell?.(symbol);
            }}
            className="rounded-full flex-1 gap-1"
            data-testid={`button-sell-${symbol}`}
          >
            <DollarSign className="w-3 h-3" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}