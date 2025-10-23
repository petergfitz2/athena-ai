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
      className="glass glass-hover rounded-[28px] p-10 transition-all duration-300"
      data-testid={`tile-market-${symbol}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-xl font-light text-foreground">{symbol}</h4>
          <p className="text-sm text-muted-foreground font-light">{name}</p>
        </div>
        <div className={isPositive ? "text-primary" : "text-destructive"}>
          {isPositive ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
        </div>
      </div>

      <p className="text-4xl font-extralight text-foreground mb-3">
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      <p
        className={cn(
          "text-base font-light",
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
