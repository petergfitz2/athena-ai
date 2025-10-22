import { TrendingUp, TrendingDown } from "lucide-react";
import GlassCard from "./GlassCard";

interface PortfolioCardProps {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
}

export default function PortfolioCard({
  symbol,
  name,
  shares,
  currentPrice,
  totalValue,
  change,
  changePercent,
}: PortfolioCardProps) {
  const isPositive = change >= 0;

  return (
    <GlassCard
      className="hover-elevate cursor-pointer"
      data-testid={`card-portfolio-${symbol}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-light text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className={isPositive ? "text-primary" : "text-destructive"}>
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-extralight text-foreground">
            ${totalValue.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Shares</p>
            <p className="text-lg font-light text-foreground">{shares}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-light text-foreground">${currentPrice}</p>
          </div>
        </div>

        <div
          className={cn(
            "text-sm",
            isPositive ? "text-primary" : "text-destructive"
          )}
        >
          {isPositive ? "+" : ""}${change.toFixed(2)} ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </div>
      </div>
    </GlassCard>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
