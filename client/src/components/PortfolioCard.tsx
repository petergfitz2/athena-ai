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
      className="glass glass-hover rounded-[28px] p-10 transition-all duration-300"
      data-testid={`card-portfolio-${symbol}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-3xl font-light text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground font-normal">{name}</p>
        </div>
        <div className={isPositive ? "text-primary" : "text-destructive"}>
          {isPositive ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Total Value</p>
          <p className="text-4xl font-light text-foreground">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Shares</p>
            <p className="text-xl font-normal text-foreground">{shares}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Price</p>
            <p className="text-xl font-normal text-foreground">${currentPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className={cn("text-base font-medium", isPositive ? "text-primary" : "text-destructive")}>
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
