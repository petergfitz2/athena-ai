import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="bg-black p-8">
      <ChatInput onSend={(msg) => console.log('Sent:', msg)} />
    </div>
  );
}
