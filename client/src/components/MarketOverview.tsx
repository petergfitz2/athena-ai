import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TickerLink } from "@/components/TickerLink";
import type { MarketIndex } from "@shared/schema";

interface MarketOverviewProps {
  onTrade?: (action: 'buy' | 'sell', symbol: string) => void;
}

export default function MarketOverview({ onTrade }: MarketOverviewProps) {
  const { data: indices = [], isLoading } = useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] h-full">
        <CardHeader className="pb-4">
          <div className="h-6 bg-white/10 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-white/10 rounded-[16px] animate-pulse"></div>
            <div className="h-16 bg-white/10 rounded-[16px] animate-pulse"></div>
            <div className="h-16 bg-white/10 rounded-[16px] animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] h-full">
      <CardHeader className="pb-4">
        <CardTitle className="font-medium">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indices.map((index) => (
            <div 
              key={index.symbol} 
              className="flex items-center justify-between p-3 bg-white/5 rounded-[16px] hover-elevate active-elevate-2 transition-all"
              data-testid={`index-${index.symbol.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${index.change >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {index.change >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-success" /> : 
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  }
                </div>
                <div className="min-w-0">
                  <TickerLink symbol={index.symbol} />
                  <p className="text-xs text-muted-foreground">{index.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium font-mono tabular-nums">
                  ${index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-mono tabular-nums ${index.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
