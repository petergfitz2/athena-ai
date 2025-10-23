import { useState, useEffect } from "react";

interface AmandaAvatarProps {
  size?: "small" | "medium" | "large" | "full";
  isListening?: boolean;
  isSpeaking?: boolean;
}

export default function AmandaAvatar({ 
  size = "large", 
  isListening = false,
  isSpeaking = false 
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
      <div className="relative w-full h-full rounded-full overflow-hidden glass border-2 border-primary/30">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20" />
        
        {/* Placeholder avatar (photorealistic image will go here) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center text-primary">
            {/* AI Icon as placeholder */}
            <svg 
              className="w-1/2 h-1/2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>

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
          {isListening && (
            <p className="text-primary font-light text-lg animate-pulse">
              Listening...
            </p>
          )}
          {isSpeaking && (
            <p className="text-accent font-light text-lg">
              Amanda is speaking...
            </p>
          )}
          {!isListening && !isSpeaking && (
            <p className="text-muted-foreground font-light text-lg">
              Ready to help
            </p>
          )}
        </div>
      )}
    </div>
  );
}
