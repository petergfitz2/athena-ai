import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="bg-black p-8 space-y-4">
      <ChatMessage
        role="user"
        content="What's the best strategy for long-term investing?"
        timestamp="2:34 PM"
      />
      <ChatMessage
        role="assistant"
        content="For long-term investing, I recommend a diversified approach with index funds, focusing on low-cost ETFs that track the S&P 500. Consider dollar-cost averaging to minimize market timing risk."
        timestamp="2:34 PM"
      />
    </div>
  );
}
