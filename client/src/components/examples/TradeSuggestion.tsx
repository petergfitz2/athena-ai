import TradeSuggestion from '../TradeSuggestion';

export default function TradeSuggestionExample() {
  return (
    <div className="bg-black p-8">
      <div className="max-w-2xl">
        <TradeSuggestion
          symbol="NVDA"
          action="BUY"
          shares={10}
          price={495.32}
          reasoning="NVIDIA shows strong momentum in AI chip market with recent data center growth. Technical indicators suggest upward trend with support at $480."
          confidence={87}
          onApprove={() => console.log('Approved')}
          onDecline={() => console.log('Declined')}
        />
      </div>
    </div>
  );
}
