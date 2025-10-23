import { TrendingUp, TrendingDown } from "lucide-react";

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
    <div
      className="glass glass-hover rounded-[28px] p-8 transition-all duration-300"
      data-testid={`card-portfolio-${symbol}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-light text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground font-light">{name}</p>
        </div>
        <div className={isPositive ? "text-primary" : "text-destructive"}>
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-light">Total Value</p>
          <p className="text-3xl font-extralight text-foreground">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-light">Shares</p>
            <p className="text-lg font-light text-foreground">{shares}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-light">Price</p>
            <p className="text-lg font-light text-foreground">${currentPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className={cn("text-sm font-light", isPositive ? "text-primary" : "text-destructive")}>
          {isPositive ? "+" : ""}${change.toFixed(2)} ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
