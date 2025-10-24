import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { cardHoverTap, scaleFadeVariants } from "@/lib/animations";

interface PortfolioCardProps {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  change: number;
  changePercent: number;
  index?: number;
}

export default function PortfolioCard({
  symbol,
  name,
  shares,
  currentPrice,
  totalValue,
  change,
  changePercent,
  index = 0,
}: PortfolioCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      className="glass glass-hover rounded-[28px] p-10 transition-all duration-300"
      data-testid={`card-portfolio-${symbol}`}
      variants={scaleFadeVariants}
      initial="hidden"
      animate="visible"
      whileHover={cardHoverTap.hover}
      whileTap={cardHoverTap.tap}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-3xl font-light text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground font-normal">{name}</p>
        </div>
        <motion.div 
          className={isPositive ? "text-primary" : "text-destructive"}
          animate={{ 
            y: isPositive ? [0, -2, 0] : [0, 2, 0],
            rotate: isPositive ? [0, 5, 0] : [0, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {isPositive ? (
            <TrendingUp className="h-6 w-6" />
          ) : (
            <TrendingDown className="h-6 w-6" />
          )}
        </motion.div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Total Value</p>
          <div className="text-4xl font-light text-foreground">
            <AnimatedCounter
              value={totalValue}
              duration={1200}
              decimals={2}
              prefix="$"
              formatValue={(value) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Shares</p>
            <p className="text-xl font-normal text-foreground">
              <AnimatedCounter value={shares} duration={800} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Price</p>
            <p className="text-xl font-normal text-foreground">
              <AnimatedCounter 
                value={currentPrice} 
                duration={800} 
                decimals={2}
                prefix="$"
              />
            </p>
          </div>
        </div>

        <motion.div 
          className={cn("text-base font-medium", isPositive ? "text-primary" : "text-destructive")}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
