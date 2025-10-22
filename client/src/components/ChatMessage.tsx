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
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-[28px] px-6 py-4 backdrop-blur-xl border",
          isUser
            ? "bg-primary/20 border-primary/30 text-foreground"
            : "bg-white/5 border-white/10 text-foreground"
        )}
        data-testid={`message-${role}`}
      >
        <p className="text-base leading-relaxed">{content}</p>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
