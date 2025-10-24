import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StockDetailModal from "./StockDetailModal";
import type { MarketIndex } from "@shared/schema";

interface MarketOverviewProps {
  onTrade?: (action: 'buy' | 'sell', symbol: string) => void;
}

export default function MarketOverview({ onTrade }: MarketOverviewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: indices = [], isLoading } = useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    refetchInterval: 60000, // Refetch every minute
  });

  const handleIndexClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="space-y-3">
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
        <h3 className="text-lg font-light text-white mb-4">Market Indices</h3>
        
        <div className="space-y-3">
          {indices.map((index) => (
            <div 
              key={index.symbol} 
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover-elevate active-elevate-2 cursor-pointer transition-all"
              onClick={() => handleIndexClick(index.symbol)}
              data-testid={`index-${index.symbol.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${index.change >= 0 ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                  {index.change >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-primary underline underline-offset-2">{index.symbol}</p>
                  <p className="text-xs text-white/40">{index.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-light text-white">${index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className={`text-xs ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <StockDetailModal
        symbol={selectedSymbol}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onTrade={onTrade}
      />
    </>
  );
}
