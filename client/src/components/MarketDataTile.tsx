import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketDataTileProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketDataTile({
  symbol,
  name,
  price,
  change,
  changePercent,
}: MarketDataTileProps) {
  const isPositive = change >= 0;

  return (
    <div
      className="glass glass-hover rounded-[28px] p-8 transition-all duration-300"
      data-testid={`tile-market-${symbol}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-medium text-foreground">{symbol}</h4>
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

      <p className="text-3xl font-extralight text-foreground mb-2">
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      <p
        className={cn(
          "text-sm font-light",
          isPositive ? "text-primary" : "text-destructive"
        )}
      >
        {isPositive ? "+" : ""}${change.toFixed(2)} ({isPositive ? "+" : ""}
        {changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
