import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import AnimatedCounter, { formatCurrency } from "@/components/AnimatedCounter";
import { TickerLink } from "@/components/TickerLink";
import { cn } from "@/lib/utils";

interface PortfolioSnapshotProps {
  portfolioSummary: {
    totalValue: number;
    dayGain: number;
    dayGainPercent: number;
    totalGain: number;
    totalGainPercent: number;
  } | undefined;
  topMovers: Array<{
    symbol: string;
    value: number;
    change: number;
  }>;
}

export default function PortfolioSnapshot({ portfolioSummary, topMovers }: PortfolioSnapshotProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span className="font-medium">Portfolio Snapshot</span>
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-2xl sm:text-3xl font-medium text-foreground">
            <AnimatedCounter 
              value={portfolioSummary?.totalValue || 0} 
              formatValue={formatCurrency}
              duration={1500}
            />
          </p>
          <div className="flex items-center gap-2 mt-2">
            {(portfolioSummary?.dayGainPercent || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={cn(
              "text-sm",
              (portfolioSummary?.dayGainPercent || 0) >= 0 ? "text-success" : "text-destructive"
            )}>
              {(portfolioSummary?.dayGainPercent || 0) >= 0 ? "+" : ""}
              {portfolioSummary?.dayGainPercent?.toFixed(2) || "0"}% Today
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Top Movers</p>
          {topMovers.map((mover) => (
            <div key={mover.symbol} className="flex justify-between items-center">
              <TickerLink symbol={mover.symbol} />
              <div className="flex items-center gap-2">
                <span className="text-sm">${mover.value.toFixed(0)}</span>
                <Badge 
                  variant={mover.change >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {mover.change >= 0 ? "+" : ""}{mover.change.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}