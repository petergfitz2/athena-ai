import DashboardHeader from "@/components/DashboardHeader";
import MarketDataTile from "@/components/MarketDataTile";
import TradeSuggestion from "@/components/TradeSuggestion";
import GlassCard from "@/components/GlassCard";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  const marketData = [
    { symbol: "S&P 500", name: "Index", price: 4532.76, change: 12.45, changePercent: 0.28 },
    { symbol: "NASDAQ", name: "Index", price: 14234.18, change: -23.17, changePercent: -0.16 },
    { symbol: "DOW", name: "Index", price: 35467.89, change: 54.32, changePercent: 0.15 },
    { symbol: "BTC", name: "Bitcoin", price: 42156.78, change: 1234.56, changePercent: 3.02 },
  ];

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader onLogout={() => setLocation('/')} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-5xl font-extralight text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Your investment command center</p>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-light text-foreground mb-4">Market Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.map((data) => (
              <MarketDataTile key={data.symbol} {...data} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
                <p className="text-5xl font-extralight text-foreground">$52,921</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Today's P&L</p>
                <p className="text-3xl font-light text-primary">+$1,297</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Return</p>
                <p className="text-3xl font-light text-primary">+12.4%</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <h3 className="text-2xl font-light text-foreground mb-4">AI Trade Suggestions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TradeSuggestion
              symbol="NVDA"
              action="BUY"
              shares={10}
              price={495.32}
              reasoning="NVIDIA shows strong momentum in AI chip market with recent data center growth. Technical indicators suggest upward trend with support at $480."
              confidence={87}
            />
            <TradeSuggestion
              symbol="META"
              action="BUY"
              shares={15}
              price={342.56}
              reasoning="Meta's VR division showing promising revenue growth. Stock undervalued compared to peers with strong ad revenue fundamentals."
              confidence={78}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
