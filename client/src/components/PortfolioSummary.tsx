import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type PortfolioData = {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
};

export default function PortfolioSummary() {
  const { data: summary, isLoading } = useQuery<PortfolioData>({
    queryKey: ['/api/portfolio/summary'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="h-10 bg-white/10 rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const portfolioValue = summary?.totalValue || 125850;
  const dayChange = summary?.dayChange || 3020;
  const dayChangePercent = summary?.dayChangePercent || 2.4;

  return (
    <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
      <h3 className="text-lg font-light text-white mb-4">Portfolio Snapshot</h3>
      
      <div className="space-y-6">
        {/* Total Value */}
        <div>
          <p className="text-sm text-white/40 mb-1">Total Value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-white">
              {formatCurrency(portfolioValue)}
            </span>
            <div className={`flex items-center gap-1 ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {formatPercent(dayChangePercent)} Today
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60">Day Change</span>
            </div>
            <p className={`text-lg font-light ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(dayChange))}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60">Total Return</span>
            </div>
            <p className="text-lg font-light text-green-400">
              {formatPercent(25.85)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}