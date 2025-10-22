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
      className="rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover-elevate cursor-pointer"
      data-testid={`tile-market-${symbol}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-xl font-light text-foreground">{symbol}</h4>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>
        <div className={isPositive ? "text-primary" : "text-destructive"}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
      </div>

      <p className="text-2xl font-extralight text-foreground mb-1">
        ${price.toFixed(2)}
      </p>

      <p
        className={cn(
          "text-sm",
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
