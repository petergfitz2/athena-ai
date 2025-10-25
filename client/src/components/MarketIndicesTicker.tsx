import { useMarketStream } from "@/hooks/useMarketStream";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function MarketIndicesTicker() {
  const { marketIndices, status, lastUpdate } = useMarketStream({
    channels: ["market-indices"]
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercent = (num: number) => {
    const formatted = Math.abs(num).toFixed(2);
    return `${num >= 0 ? '+' : '-'}${formatted}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0.01) return <TrendingUp className="w-3 h-3" />;
    if (change < -0.01) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0.01) return "text-emerald-400";
    if (change < -0.01) return "text-red-400";
    return "text-zinc-400";
  };

  if (!status.connected && !status.reconnecting) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-2xl border-b border-white/5">
      <div className="relative">
        {/* Connection status indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className={cn(
            "flex items-center gap-2 text-xs",
            status.connected ? "text-emerald-400/60" : "text-amber-400/60"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              status.connected ? "bg-emerald-400" : "bg-amber-400"
            )} />
            <span className="font-mono">
              {status.connected ? "LIVE" : "CONNECTING"}
            </span>
          </div>
        </div>

        {/* Market indices ticker */}
        <div className="overflow-hidden">
          <div className="flex items-center gap-8 px-6 py-3 animate-scroll">
            <AnimatePresence mode="wait">
              {marketIndices.length > 0 ? (
                marketIndices.map((index, i) => (
                  <motion.div
                    key={index.symbol}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm font-light">
                        {index.name}
                      </span>
                      <span className="text-white font-mono text-sm">
                        {formatNumber(index.price)}
                      </span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1",
                      getTrendColor(index.changePercent)
                    )}>
                      {getTrendIcon(index.changePercent)}
                      <span className="font-mono text-xs">
                        {formatPercent(index.changePercent)}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center gap-8">
                  {["DOW", "S&P 500", "NASDAQ", "VIX"].map((name) => (
                    <div key={name} className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-sm">{name}</span>
                        <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Last update timestamp */}
        {lastUpdate && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <span className="text-[10px] text-white/20 font-mono">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}