import React, { useMemo, useEffect, useState, useRef } from "react";
import { useMarketStream } from "@/hooks/useMarketStream";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Memoized ticker item component to prevent unnecessary re-renders
const TickerItem = React.memo(({ 
  name, 
  price, 
  changePercent,
  showDivider 
}: { 
  name: string; 
  price: number; 
  changePercent: number;
  showDivider?: boolean;
}) => {
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

  return (
    <div className="flex items-center px-4">
      {showDivider && (
        <div className="h-4 border-l border-gray-700/50" />
      )}
      <div className="flex items-center gap-3 pl-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-200 text-sm font-medium tracking-wide">
            {name}
          </span>
          <span className="text-gray-300 font-mono text-sm tabular-nums">
            {formatNumber(price)}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-1",
          getTrendColor(changePercent)
        )}>
          {getTrendIcon(changePercent)}
          <span className="font-mono text-xs font-medium tabular-nums">
            {formatPercent(changePercent)}
          </span>
        </div>
      </div>
    </div>
  );
});

TickerItem.displayName = 'TickerItem';

// Loading skeleton component
const TickerSkeleton = React.memo(() => (
  <div className="flex items-center justify-evenly w-full">
    {["DOW", "S&P 500", "NASDAQ", "VIX"].map((name, index) => (
      <div key={name} className="flex items-center px-4">
        {index > 0 && (
          <div className="h-4 border-l border-gray-700/50" />
        )}
        <div className="flex items-center gap-3 pl-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-200/50 text-sm font-medium tracking-wide">{name}</span>
            <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

TickerSkeleton.displayName = 'TickerSkeleton';

export const MarketIndicesTicker = React.memo(() => {
  const { marketIndices, status, lastUpdate } = useMarketStream({
    channels: ["market-indices"]
  });

  // Local state to control rendering and prevent flicker
  const [displayIndices, setDisplayIndices] = useState(() => marketIndices);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastDataRef = useRef<string>("");
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  // Update display indices with 15-second interval to prevent flicker
  useEffect(() => {
    if (marketIndices.length > 0) {
      // Only update if not initialized or if there's actual new data
      const currentDataString = JSON.stringify(marketIndices);
      
      if (!isInitialized) {
        setIsInitialized(true);
        setDisplayIndices(marketIndices);
        lastDataRef.current = currentDataString;
        
        // Set up 15-second interval for updates
        updateIntervalRef.current = setInterval(() => {
          if (lastDataRef.current !== JSON.stringify(marketIndices)) {
            setDisplayIndices(marketIndices);
            lastDataRef.current = JSON.stringify(marketIndices);
          }
        }, 15000);
      } else if (currentDataString !== lastDataRef.current) {
        // Cache the update for next interval
        lastDataRef.current = currentDataString;
      }
    }
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [marketIndices, isInitialized]); // Fixed dependency array

  // Memoize the ticker content to prevent unnecessary re-renders
  const tickerContent = useMemo(() => {
    if (!isInitialized || displayIndices.length === 0) {
      return <TickerSkeleton />;
    }

    return (
      <div className="flex items-center justify-evenly w-full">
        {displayIndices.map((index, i) => (
          <TickerItem
            key={index.symbol} // Use stable key based on symbol
            name={index.name}
            price={index.price}
            changePercent={index.changePercent}
            showDivider={i > 0}
          />
        ))}
      </div>
    );
  }, [displayIndices, isInitialized]);

  // Don't render anything if not connected and not initialized
  if (!status.connected && !status.reconnecting && !isInitialized) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 w-full h-[36px] bg-neutral-900 border-b border-gray-800/60">
      <div className="h-full flex items-center px-4">
        <div className="max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center justify-between">
            {/* Ticker items */}
            <div className="flex-1 flex items-center justify-evenly overflow-hidden whitespace-nowrap">
              {tickerContent}
            </div>

            {/* Connection status indicator */}
            <div className="flex-shrink-0 pl-4 border-l border-gray-700/50">
              <div className={cn(
                "flex items-center gap-2 text-xs",
                status.connected ? "text-indigo-400" : "text-amber-400"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  status.connected 
                    ? "bg-indigo-400 animate-pulse" 
                    : status.reconnecting 
                    ? "bg-amber-400 animate-pulse" 
                    : "bg-gray-400"
                )} />
                <span className="font-mono text-gray-200 uppercase tracking-wider">
                  {status.connected ? "LIVE" : status.reconnecting ? "RECONNECTING" : "OFFLINE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MarketIndicesTicker.displayName = 'MarketIndicesTicker';

// Export as default for backward compatibility
export default MarketIndicesTicker;