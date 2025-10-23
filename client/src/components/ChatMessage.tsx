import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: string;
}

export default function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[28px] px-8 py-6 backdrop-blur-xl border transition-all duration-300",
          isUser
            ? "bg-primary/20 border-primary/30 text-foreground"
            : "glass"
        )}
        data-testid={`message-${role}`}
      >
        <p className="text-base leading-relaxed font-light whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-3 font-light">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
