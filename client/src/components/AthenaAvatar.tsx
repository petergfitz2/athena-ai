import { useState, useEffect } from "react";
import amandaImage from "@assets/generated_images/Professional_businesswoman_corporate_portrait_7db86b86.png";

interface AthenaAvatarProps {
  size?: "small" | "medium" | "large" | "full";
  isListening?: boolean;
  isSpeaking?: boolean;
  isTyping?: boolean;
}

export default function AthenaAvatar({ 
  size = "large", 
  isListening = false,
  isSpeaking = false,
  isTyping = false
}: AthenaAvatarProps) {
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
    small: "w-16 h-20",
    medium: "w-32 h-40",
    large: "w-48 h-60 lg:w-64 lg:h-80",
    full: "w-full h-full max-w-sm mx-auto aspect-[3/4]",
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} transition-transform duration-1000`}
      style={{ transform: `scale(${breatheScale})` }}
      data-testid="athena-avatar"
    >
      {/* Outer glow when listening */}
      {isListening && (
        <div className="absolute inset-0 rounded-[28px] bg-primary/10 animate-pulse" />
      )}
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-[28px] border-2 border-primary/40 animate-pulse" />
      )}
      
      {/* Avatar container - portrait style */}
      <div className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-black via-black to-primary/5">
        {/* Sophisticated Athena portrait */}
        <img 
          src={amandaImage} 
          alt="Athena - Your AI Investment Assistant" 
          className="w-full h-full object-cover grayscale"
        />

        {/* Voice activity visualization - enhanced waveform */}
        {(isListening || isSpeaking) && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-primary to-primary/30 rounded-full transition-all ${
                  isSpeaking ? 'animate-waveform' : 'animate-waveform-fast'
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  minHeight: '4px',
                }}
              />
            ))}
          </div>
        )}

        {/* Thinking indicator */}
        {isTyping && !isListening && !isSpeaking && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-thinking"
                style={{
                  animationDelay: `${i * 0.2}s`,
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
              Athena is speaking...
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
