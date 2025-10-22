import MarketDataTile from '../MarketDataTile';

export default function MarketDataTileExample() {
  return (
    <div className="bg-black p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MarketDataTile
          symbol="S&P 500"
          name="Index"
          price={4532.76}
          change={12.45}
          changePercent={0.28}
        />
        <MarketDataTile
          symbol="NASDAQ"
          name="Index"
          price={14234.18}
          change={-23.17}
          changePercent={-0.16}
        />
        <MarketDataTile
          symbol="DOW"
          name="Index"
          price={35467.89}
          change={54.32}
          changePercent={0.15}
        />
        <MarketDataTile
          symbol="BTC"
          name="Bitcoin"
          price={42156.78}
          change={1234.56}
          changePercent={3.02}
        />
      </div>
    </div>
  );
}
