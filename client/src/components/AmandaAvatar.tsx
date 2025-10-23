import { useState, useEffect } from "react";
import amandaImage from "@assets/generated_images/Professional_AI_assistant_avatar_Amanda_7849a892.png";

interface AmandaAvatarProps {
  size?: "small" | "medium" | "large" | "full";
  isListening?: boolean;
  isSpeaking?: boolean;
  isTyping?: boolean;
}

export default function AmandaAvatar({ 
  size = "large", 
  isListening = false,
  isSpeaking = false,
  isTyping = false
}: AmandaAvatarProps) {
  const [breatheScale, setBreatheScale] = useState(1);

  // Subtle breathing animation
  useEffect(() => {
    if (isSpeaking) return;
    
    const interval = setInterval(() => {
      setBreatheScale(s => s === 1 ? 1.02 : 1);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-32 h-32",
    large: "w-48 h-48 lg:w-64 lg:h-64",
    full: "w-full h-full max-w-md mx-auto aspect-square",
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} transition-transform duration-1000`}
      style={{ transform: `scale(${breatheScale})` }}
      data-testid="amanda-avatar"
    >
      {/* Outer glow ring when listening */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
      )}
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
      )}
      
      {/* Avatar container */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl">
        {/* Photorealistic Amanda avatar */}
        <img 
          src={amandaImage} 
          alt="Amanda - Your AI Investment Assistant" 
          className="w-full h-full object-cover"
        />

        {/* Voice activity visualization */}
        {(isListening || isSpeaking) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      {size === "full" && (
        <div className="mt-6 text-center">
          {isSpeaking && (
            <p className="text-accent font-light text-lg">
              Amanda is speaking...
            </p>
          )}
          {isListening && !isSpeaking && (
            <p className="text-primary font-light text-lg animate-pulse">
              Listening...
            </p>
          )}
          {isTyping && !isSpeaking && !isListening && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
              <p className="text-primary font-light text-lg ml-2">Typing...</p>
            </div>
          )}
          {!isListening && !isSpeaking && !isTyping && (
            <p className="text-muted-foreground font-light text-lg">
              Ready to help
            </p>
          )}
        </div>
      )}
    </div>
  );
}
