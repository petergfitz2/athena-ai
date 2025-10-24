import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import AthenaTraderAvatar from "./AthenaTraderAvatar";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: string;
}

export default function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  
  // Fetch active avatar for AI messages
  const { data: activeAvatar } = useQuery<{
    name: string;
    imageUrl: string;
    personalityProfile: any;
  }>({
    queryKey: ['/api/avatars/active'],
    enabled: !isUser, // Only fetch for AI messages
  });

  return (
    <div
      className={cn(
        "flex w-full animate-slide-in gap-3 lg:gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Show avatar for AI messages */}
      {!isUser && (
        <div className="flex-shrink-0">
          <AthenaTraderAvatar
            size="small"
            showName={false}
            showStatus={false}
            className="mt-2"
          />
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
        {/* Show avatar name for AI messages */}
        {!isUser && activeAvatar && (
          <p className="text-sm text-muted-foreground mb-2 ml-2">
            {activeAvatar.name}
          </p>
        )}
        
        <div
          className={cn(
            "rounded-[28px] px-6 md:px-8 lg:px-10 py-6 md:py-7 lg:py-8 border transition-all duration-300",
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
    </div>
  );
}
