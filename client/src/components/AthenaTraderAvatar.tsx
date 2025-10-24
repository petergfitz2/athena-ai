import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import defaultAvatarImage from "@assets/generated_images/Professional_AI_assistant_avatar_Amanda_7849a892.png";

interface AthenaTraderAvatarProps {
  size?: "mini" | "small" | "medium" | "large" | "full";
  status?: "online" | "analyzing" | "trading" | "offline";
  showName?: boolean;
  showStatus?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isTyping?: boolean;
  className?: string;
}

export default function AthenaTraderAvatar({
  size = "medium",
  status = "online",
  showName = true,
  showStatus = true,
  isListening = false,
  isSpeaking = false,
  isTyping = false,
  className = "",
}: AthenaTraderAvatarProps) {
  // Fetch active avatar data
  const { data: activeAvatar } = useQuery<{
    name: string;
    imageUrl: string;
    personalityProfile: {
      catchphrase?: string;
      [key: string]: any;
    };
  }>({
    queryKey: ['/api/avatars/active'],
    refetchInterval: 10000, // Refresh every 10 seconds to catch updates
  });

  const sizeClasses = {
    mini: "w-12 h-12",
    small: "w-20 h-20",
    medium: "w-32 h-32",
    large: "w-48 h-48",
    full: "w-64 h-64 sm:w-80 sm:h-80",
  };

  const imageSizes = {
    mini: "w-10 h-10",
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-36 h-36",
    full: "w-48 h-48 sm:w-60 sm:h-60",
  };

  const getStatusConfig = () => {
    switch (status) {
      case "analyzing":
        return { text: "Analyzing Markets", color: "bg-blue-500" };
      case "trading":
        return { text: "Trading Hours", color: "bg-green-500" };
      case "offline":
        return { text: "After Hours", color: "bg-gray-500" };
      default:
        return { text: "Online", color: "bg-emerald-500" };
    }
  };

  const statusConfig = getStatusConfig();

  // Get avatar details
  const avatarName = activeAvatar?.name || "Athena";
  const avatarImageUrl = activeAvatar?.imageUrl || defaultAvatarImage;
  const avatarCatchphrase = activeAvatar?.personalityProfile?.catchphrase || "Your AI Investment Advisor";

  // Determine current time-based status
  const getCurrentStatus = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Weekend check (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      return "offline";
    }
    
    // Trading hours (9:30 AM - 4:00 PM ET, approximate)
    if (hour >= 9 && hour < 16) {
      return "trading";
    } else if (hour >= 16 && hour < 20) {
      return "analyzing";
    } else {
      return "offline";
    }
  };

  useEffect(() => {
    // Update status based on time if not explicitly set
    if (status === "online") {
      const marketStatus = getCurrentStatus();
      // This would need to be handled via props callback
    }
  }, [status]);

  return (
    <div className={cn("relative flex flex-col items-center", className)} data-testid="athena-trader-avatar">
      {/* Avatar Container */}
      <div 
        className={cn(
          "relative transition-all duration-1000 ease-in-out",
          sizeClasses[size],
          isListening && "animate-listening-pulse",
          !isListening && !isSpeaking && !isTyping && "animate-breathe"
        )}
      >
        {/* Listening pulse rings */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
          </>
        )}

        {/* Speaking rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border border-primary/40 animate-pulse" />
            <div className="absolute inset-[-10%] rounded-full border border-primary/20 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </>
        )}

        {/* Main Avatar Circle */}
        <div className={cn(
          "relative rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20 p-1",
          sizeClasses[size],
          isSpeaking && "animate-talking"
        )}>
          <div className="relative w-full h-full rounded-full overflow-hidden bg-black/50 backdrop-blur-xl border border-white/20">
            {/* Avatar Image */}
            <div className="absolute inset-2 flex items-center justify-center">
              <img 
                src={avatarImageUrl}
                alt={`${avatarName} - AI Investment Advisor`}
                className={cn(
                  "rounded-full object-cover",
                  imageSizes[size],
                  // Apply animations directly to the IMG element
                  isSpeaking && "avatar-talking",
                  !isListening && !isSpeaking && !isTyping && "avatar-breathing animate-blink animate-head-tilt",
                  isListening && "animate-pulse"
                )}
              />
              
              {/* Professional overlay effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Status Indicator Dot */}
            {showStatus && size !== "mini" && (
              <div className="absolute bottom-1 right-1">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  statusConfig.color
                )} />
              </div>
            )}

            {/* Thinking dots */}
            {isTyping && !isListening && !isSpeaking && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-black/80 rounded-full px-2 py-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-white/80 rounded-full animate-thinking"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name Badge and Status */}
      {showName && size !== "mini" && (
        <div className="mt-3 text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 border border-white/10 backdrop-blur-md">
            <span className="text-sm font-light text-foreground tracking-wide">
              {avatarName}
            </span>
            {size !== "small" && (
              <Badge variant="outline" className="text-[10px] border-white/20">
                AI Advisor
              </Badge>
            )}
          </div>
          
          {/* Catchphrase/Tagline */}
          {size !== "small" && (
            <p className="text-xs text-muted-foreground italic max-w-[200px]">
              "{avatarCatchphrase}"
            </p>
          )}
          
          {/* Status Text */}
          {showStatus && (
            <div className="flex items-center justify-center gap-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                statusConfig.color
              )} />
              <p className={cn(
                "text-xs text-muted-foreground",
                statusConfig.text === "After Hours" ? "font-semibold" : "font-light"
              )}>
                {isListening ? "Listening..." : 
                 isSpeaking ? "Speaking..." :
                 isTyping ? "Analyzing..." :
                 statusConfig.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}