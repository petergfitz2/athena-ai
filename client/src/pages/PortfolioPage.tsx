import DashboardHeader from "@/components/DashboardHeader";
import PortfolioCard from "@/components/PortfolioCard";
import GlassCard from "@/components/GlassCard";
import { useLocation } from "wouter";

export default function PortfolioPage() {
  const [, setLocation] = useLocation();

  const holdings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 50,
      currentPrice: 178.32,
      totalValue: 8916,
      change: 245.50,
      changePercent: 2.83,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      shares: 40,
      currentPrice: 378.91,
      totalValue: 15156,
      change: 412.30,
      changePercent: 2.79,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 25,
      currentPrice: 242.84,
      totalValue: 6071,
      change: -125.30,
      changePercent: -2.02,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      shares: 30,
      currentPrice: 495.32,
      totalValue: 14860,
      change: 723.45,
      changePercent: 5.12,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 35,
      currentPrice: 141.80,
      totalValue: 4963,
      change: 87.20,
      changePercent: 1.79,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      shares: 20,
      currentPrice: 152.74,
      totalValue: 3055,
      change: -45.80,
      changePercent: -1.48,
    },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalChange = holdings.reduce((sum, h) => sum + h.change, 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader onLogout={() => setLocation('/')} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-5xl font-extralight text-foreground mb-2">Portfolio</h2>
          <p className="text-muted-foreground">Track your investments in real-time</p>
        </div>

        <GlassCard className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Value</p>
              <p className="text-5xl font-extralight text-foreground">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Today's Change</p>
              <p className={`text-3xl font-light ${totalChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Performance</p>
              <p className={`text-3xl font-light ${totalChangePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holdings.map((holding) => (
            <PortfolioCard key={holding.symbol} {...holding} />
          ))}
        </div>
      </main>
    </div>
  );
}
