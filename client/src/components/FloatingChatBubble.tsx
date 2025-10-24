import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";

export default function FloatingChatBubble() {
  const {
    isPanelOpen,
    isCollapsed,
    unreadCount,
    lastMessage,
    openPanel,
    setIsCollapsed,
  } = useChatContext();

  const [showPreview, setShowPreview] = useState(false);
  const [previewTimer, setPreviewTimer] = useState<NodeJS.Timeout | null>(null);

  // Show preview for 3 seconds when new message arrives
  useEffect(() => {
    if (lastMessage && lastMessage.sender === "ai" && !isPanelOpen) {
      setShowPreview(true);
      
      // Clear existing timer if any
      if (previewTimer) {
        clearTimeout(previewTimer);
      }
      
      // Hide preview after 3 seconds
      const timer = setTimeout(() => {
        setShowPreview(false);
      }, 3000);
      
      setPreviewTimer(timer);
    }
    
    return () => {
      if (previewTimer) {
        clearTimeout(previewTimer);
      }
    };
  }, [lastMessage, isPanelOpen]);

  const handleClick = () => {
    openPanel();
    setIsCollapsed(false);
    setShowPreview(false);
  };

  // Don't show bubble if panel is open and expanded
  if (isPanelOpen && !isCollapsed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 300 
        }}
        className="fixed bottom-5 right-5 z-50"
        data-testid="floating-chat-bubble"
      >
        {/* Message Preview */}
        <AnimatePresence>
          {showPreview && lastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-[70px] right-0 mb-2"
            >
              <div className={cn(
                "max-w-[200px] p-3 rounded-[20px]",
                "bg-black/90 backdrop-blur-xl",
                "border border-white/10",
                "shadow-2xl shadow-purple-500/10"
              )}>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 
                                  flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-xs text-white/90 line-clamp-3">
                    {lastMessage.content}
                  </p>
                </div>
              </div>
              {/* Arrow pointing to bubble */}
              <div className="absolute -bottom-2 right-4 w-0 h-0 
                            border-l-[6px] border-l-transparent
                            border-r-[6px] border-r-transparent
                            border-t-[6px] border-t-black/90" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Button */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative w-[60px] h-[60px] rounded-full",
            "bg-gradient-to-br from-primary to-primary/80",
            "shadow-2xl shadow-purple-500/30",
            "flex items-center justify-center",
            "hover:shadow-purple-500/40",
            "transition-shadow duration-300",
            "group"
          )}
          data-testid="button-open-chat-bubble"
        >
          {/* Pulsing glow effect */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Avatar or Icon */}
          <div className="relative">
            <AthenaTraderAvatar 
              size="mini"
              showStatus={false}
              showName={false}
              className="w-8 h-8"
            />
          </div>

          {/* Notification Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -top-1 -right-1",
                "min-w-[20px] h-[20px] rounded-full",
                "bg-red-500 text-white",
                "text-[10px] font-semibold",
                "flex items-center justify-center",
                "px-1",
                "shadow-lg"
              )}
            >
              <motion.span
                key={unreadCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}