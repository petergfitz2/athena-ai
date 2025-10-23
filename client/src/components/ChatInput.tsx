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
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-4 items-center rounded-[28px] glass p-3 focus-within:ring-2 focus-within:ring-primary transition-all duration-300">
        <input
          type="text"
          data-testid="input-chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about investing..."
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground px-4 py-3 focus:outline-none font-light text-base"
        />
        <Button
          type="submit"
          data-testid="button-send-message"
          size="icon"
          disabled={disabled || !message.trim()}
          className="rounded-full h-12 w-12 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
