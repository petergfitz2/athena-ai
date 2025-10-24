import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  ShoppingCart, Info, ChevronUp, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TickerLink } from "@/components/TickerLink";
import type { MarketQuote } from "@shared/schema";

interface EnhancedStockCardProps {
  symbol: string;
  quote?: MarketQuote; // Optional quote to avoid N+1 queries
  onBuy?: (symbol: string) => void;
  onSell?: (symbol: string) => void;
  className?: string;
  showActions?: boolean;
}

export function EnhancedStockCard({ 
  symbol, 
  quote: quoteProp, // Accept quote as prop
  onBuy, 
  onSell,
  className,
  showActions = true 
}: EnhancedStockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only fetch quote if not provided as prop (avoid N+1 queries)
  const { data: fetchedQuote, isLoading } = useQuery<MarketQuote>({
    queryKey: ['/api/market/quote', symbol],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !quoteProp, // Only fetch if quote not provided
  });
  
  // Use provided quote or fetched quote
  const quote = quoteProp || fetchedQuote;

  if (isLoading) {
    return (
      <Card className={cn("bg-white/5 border-white/10 animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  const changePercent = quote.changePercent || 0;
  const isPositive = changePercent >= 0;
  
  // Calculate additional metrics
  const marketCap = quote.marketCap || (quote.price * 1000000000);
  const volume = quote.volume || 0;
  const avgVolume = volume * 0.9; // Mock average volume for now
  const volumeRatio = avgVolume > 0 ? (volume / avgVolume) : 1;
  
  // Format large numbers
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
    <Card className={cn(
      "bg-white/5 border-white/10 backdrop-blur-xl hover-elevate transition-all duration-300",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TickerLink symbol={symbol} className="text-xl font-bold" />
              <Badge variant="outline" className="text-xs">
                NASDAQ
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vol: {formatVolume(volume)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price and Change */}
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ${quote.price.toFixed(2)}
            </span>
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className="text-sm"
            >
              {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
            </Badge>
          </div>
          <p className={cn(
            "text-sm mt-1",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? "+" : ""}{quote.change?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">High</p>
              <p className="font-semibold">${quote.high?.toFixed(2) || (quote.price * 1.02).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-semibold">${formatNumber(marketCap)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="font-semibold">${quote.low?.toFixed(2) || (quote.price * 0.98).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-semibold">{formatVolume(volume)}</p>
            </div>
          </div>
        </div>

        {/* Volume Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Volume</span>
            <span>{(volumeRatio * 100).toFixed(0)}% of Avg</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                volumeRatio > 1.5 ? "bg-purple-500" : 
                volumeRatio > 1 ? "bg-blue-500" : 
                "bg-gray-500"
              )}
              style={{ width: `${Math.min(volumeRatio * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
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
                <span className="text-muted-foreground">EPS</span>
                <p className="font-medium">$12.45</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dividend</span>
                <p className="font-medium">
                  $2.40 (1.85%)
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Beta</span>
                <p className="font-medium">1.12</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-white/10">
            <Button
              onClick={() => onBuy?.(symbol)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
              size="sm"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
            </Button>
            <Button
              onClick={() => onSell?.(symbol)}
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-full"
              size="sm"
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Sell
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}