import PortfolioCard from '../PortfolioCard';

export default function PortfolioCardExample() {
  return (
    <div className="bg-black p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortfolioCard
          symbol="AAPL"
          name="Apple Inc."
          shares={50}
          currentPrice={178.32}
          totalValue={8916}
          change={245.50}
          changePercent={2.83}
        />
        <PortfolioCard
          symbol="TSLA"
          name="Tesla Inc."
          shares={25}
          currentPrice={242.84}
          totalValue={6071}
          change={-125.30}
          changePercent={-2.02}
        />
      </div>
    </div>
  );
}
