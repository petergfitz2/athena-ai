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
      <div className="flex gap-3 lg:gap-4 items-center rounded-[28px] glass p-3 lg:p-4 focus-within:ring-2 focus-within:ring-primary transition-all duration-300">
        <input
          type="text"
          data-testid="input-chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about investing..."
          disabled={disabled}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground px-4 md:px-5 lg:px-6 py-3 lg:py-4 focus:outline-none font-light text-base lg:text-lg"
        />
        <Button
          type="submit"
          data-testid="button-send-message"
          size="icon"
          disabled={disabled || !message.trim()}
          className="rounded-full h-12 md:h-13 lg:h-14 w-12 md:w-13 lg:w-14 flex-shrink-0"
        >
          <Send className="h-5 md:h-5.5 lg:h-6 w-5 md:w-5.5 lg:w-6" />
        </Button>
      </div>
    </form>
  );
}
