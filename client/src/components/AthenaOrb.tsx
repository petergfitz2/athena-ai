import { useState, useEffect } from "react";

interface AthenaOrbProps {
  size?: "mini" | "small" | "medium" | "large" | "full";
  isListening?: boolean;
  isSpeaking?: boolean;
  isTyping?: boolean;
  showStatus?: boolean;
  className?: string;
}

export default function AthenaOrb({ 
  size = "medium", 
  isListening = false,
  isSpeaking = false,
  isTyping = false,
  showStatus = true,
  className = ""
}: AthenaOrbProps) {
  const [breatheScale, setBreatheScale] = useState(1);
  const [pulseOpacity, setPulseOpacity] = useState(0.3);

  // Subtle breathing animation
  useEffect(() => {
    if (isListening || isSpeaking) return;
    
    const interval = setInterval(() => {
      setBreatheScale(s => s === 1 ? 1.05 : 1);
      setPulseOpacity(o => o === 0.3 ? 0.5 : 0.3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  const sizeClasses = {
    mini: "w-12 h-12",
    small: "w-20 h-20",
    medium: "w-32 h-32",
    large: "w-48 h-48",
    full: "w-64 h-64 sm:w-80 sm:h-80",
  };

  const glowIntensity = {
    mini: "0 0 20px",
    small: "0 0 30px",
    medium: "0 0 40px",
    large: "0 0 60px",
    full: "0 0 80px",
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`} data-testid="athena-orb">
      {/* Outer container for animations */}
      <div 
        className={`relative ${sizeClasses[size]} transition-all duration-1000 ease-in-out`}
        style={{ transform: `scale(${breatheScale})` }}
      >
        {/* Purple glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, ${pulseOpacity}) 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />

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

        {/* Main orb */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            boxShadow: `${glowIntensity[size]} rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)`,
          }}
        >
          {/* Glass effect overlay */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            }}
          />

          {/* Inner glow */}
          <div 
            className="absolute inset-[20%] rounded-full blur-md"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            }}
          />

          {/* Voice visualization */}
          {(isListening || isSpeaking) && (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-1/2 pb-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 bg-white/60 rounded-full transition-all ${
                    isSpeaking ? 'animate-waveform' : 'animate-waveform-fast'
                  }`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    minHeight: '2px',
                    maxHeight: '40%',
                  }}
                />
              ))}
            </div>
          )}

          {/* Thinking dots */}
          {isTyping && !isListening && !isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5">
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

          {/* Center highlight */}
          {!isListening && !isSpeaking && !isTyping && (
            <div 
              className="absolute inset-[35%] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
              }}
            />
          )}
        </div>

        {/* Athena text logo - only on larger sizes */}
        {(size === "large" || size === "full") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/90 font-extralight text-2xl tracking-wider">A</span>
          </div>
        )}
      </div>

      {/* Status text */}
      {showStatus && (
        <div className="mt-4 text-center">
          {isSpeaking && (
            <p className="text-primary font-extralight text-sm animate-pulse">
              Speaking...
            </p>
          )}
          {isListening && !isSpeaking && (
            <p className="text-primary font-extralight text-sm animate-pulse">
              Listening...
            </p>
          )}
          {isTyping && !isSpeaking && !isListening && (
            <p className="text-muted-foreground font-extralight text-sm">
              <span className="thinking-dots">Thinking</span>
            </p>
          )}
          {!isListening && !isSpeaking && !isTyping && (
            <p className="text-muted-foreground font-extralight text-sm">
              Ready
            </p>
          )}
        </div>
      )}
    </div>
  );
}