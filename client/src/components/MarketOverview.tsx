import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type MarketIndex = {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
};

export default function MarketOverview() {
  const { data: indices = [], isLoading } = useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    select: () => [
      { symbol: 'SPY', name: 'S&P 500', value: 4783.45, change: 23.31, changePercent: 0.49 },
      { symbol: 'DIA', name: 'Dow Jones', value: 37863.80, change: 211.02, changePercent: 0.56 },
      { symbol: 'QQQ', name: 'NASDAQ', value: 16734.12, change: -19.07, changePercent: -0.11 },
    ]
  });

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
    <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
      <h3 className="text-lg font-light text-white mb-4">Market Indices</h3>
      
      <div className="space-y-3">
        {indices.map((index) => (
          <div key={index.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${index.change >= 0 ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
                {index.change >= 0 ? 
                  <TrendingUp className="w-4 h-4 text-green-400" /> : 
                  <TrendingDown className="w-4 h-4 text-red-400" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-white">{index.symbol}</p>
                <p className="text-xs text-white/40">{index.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-light text-white">${index.value.toLocaleString()}</p>
              <p className={`text-xs ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}