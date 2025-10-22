import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend?.(message);
      console.log('Message sent:', message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3 items-center rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 p-2 focus-within:ring-2 focus-within:ring-primary">
        <input
          type="text"
          data-testid="input-chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about investing..."
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground px-4 py-3 focus:outline-none"
        />
        <Button
          type="submit"
          data-testid="button-send-message"
          size="icon"
          disabled={disabled || !message.trim()}
          className="rounded-full h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
