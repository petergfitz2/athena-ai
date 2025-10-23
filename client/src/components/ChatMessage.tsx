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
          "max-w-[85%] md:max-w-[80%] rounded-[28px] px-6 md:px-8 lg:px-10 py-6 md:py-7 lg:py-8 border transition-all duration-300",
          isUser
            ? "bg-primary/20 border-primary/30"
            : "bg-white/[0.06] backdrop-blur-md border-white/10"
        )}
        data-testid={`message-${role}`}
      >
        <p className="text-base md:text-lg leading-relaxed font-light whitespace-pre-wrap text-foreground">{content}</p>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-3 lg:mt-4 font-light">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
