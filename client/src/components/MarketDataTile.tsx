import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { cardHoverTap, scaleFadeVariants, pulseAnimation } from "@/lib/animations";

interface MarketDataTileProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  index?: number;
}

export default function MarketDataTile({
  symbol,
  name,
  price,
  change,
  changePercent,
  index = 0,
}: MarketDataTileProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      className="glass glass-hover rounded-[28px] p-10 transition-all duration-300"
      data-testid={`tile-market-${symbol}`}
      variants={scaleFadeVariants}
      initial="hidden"
      animate="visible"
      whileHover={cardHoverTap.hover}
      whileTap={cardHoverTap.tap}
      transition={{ delay: index * 0.08 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="text-xl font-light text-foreground">{symbol}</h4>
          <p className="text-sm text-muted-foreground font-light">{name}</p>
        </div>
        <motion.div 
          className={isPositive ? "text-primary" : "text-destructive"}
          animate={pulseAnimation}
        >
          {isPositive ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
        </motion.div>
      </div>

      <div className="text-4xl font-extralight text-foreground mb-3">
        <AnimatedCounter
          value={price}
          duration={1000}
          decimals={2}
          prefix="$"
          formatValue={(value) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        />
      </div>

      <motion.p
        className={cn(
          "text-base font-light",
          isPositive ? "text-primary" : "text-destructive"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedCounter
          value={change}
          duration={800}
          decimals={2}
          prefix={isPositive ? "+$" : "-$"}
          formatValue={(val) => Math.abs(val).toFixed(2)}
        />
        {" ("}
        <AnimatedCounter
          value={changePercent}
          duration={800}
          decimals={2}
          prefix={isPositive ? "+" : "-"}
          suffix="%"
          formatValue={(val) => Math.abs(val).toFixed(2)}
        />
        {")"}
      </motion.p>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
