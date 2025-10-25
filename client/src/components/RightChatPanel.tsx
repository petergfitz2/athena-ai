import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X, Send, MessageCircle, Sparkles, TrendingUp, TrendingDown,
  Activity, Loader2, ChevronRight, Trash2, Download, Settings,
  Minimize2, Maximize2
} from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import ChatMessage from "@/components/ChatMessage";
import { cn } from "@/lib/utils";

export default function RightChatPanel() {
  const {
    messages,
    isPanelOpen,
    setIsPanelOpen,
    isCollapsed,
    setIsCollapsed,
    sendMessage,
    clearMessages,
    isLoading,
    activeAvatar
  } = useChatContext();

  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart auto-scroll - shows TOP of AI messages, bottom for user messages
  const prevMessageCount = useRef(messages.length);
  const lastScrolledMessageId = useRef<string>("");
  
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (!scrollElement) return;
      
      const lastMessage = messages[messages.length - 1];
      const isNewMessage = messages.length > prevMessageCount.current;
      
      // Only scroll for truly new messages
      if (isNewMessage && lastMessage) {
        // Check if user is near bottom (within 100px)
        const isNearBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;
        
        if (isNearBottom) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            const messageElements = scrollElement.querySelectorAll('[data-message-id]');
            const lastMessageElement = messageElements[messageElements.length - 1] as HTMLElement;
            
            if (lastMessageElement) {
              if (lastMessage.sender === 'ai') {
                // FOR AI MESSAGES: Scroll to TOP of message for natural reading
                const messageTop = lastMessageElement.offsetTop;
                scrollElement.scrollTo({
                  top: messageTop - 10, // Small offset from top
                  behavior: 'smooth'
                });
              } else {
                // FOR USER MESSAGES: Scroll to bottom to show full message
                scrollElement.scrollTop = scrollElement.scrollHeight;
              }
            }
          }, 100);
        }
      }
      
      prevMessageCount.current = messages.length;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isPanelOpen && !isCollapsed) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isPanelOpen, isCollapsed]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCollapse = () => {
    setIsCollapsed(true);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
  };

  // Don't render panel if it's not open
  if (!isPanelOpen) {
    return null;
  }

  // Handle collapsed state with a minimal vertical bar on the right
  if (isCollapsed) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-0 top-[64px] h-[calc(100vh-64px)] w-1 z-40 bg-gradient-to-b from-primary/30 to-primary/10 
                     hover:w-2 cursor-pointer transition-all duration-200"
          onClick={handleExpand}
          data-testid="button-expand-chat-bar"
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full h-20 
                          bg-gradient-to-b from-transparent via-primary to-transparent opacity-60 animate-pulse" />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          x: window.innerWidth < 768 ? 0 : 420, 
          y: window.innerWidth < 768 ? "100%" : 0,
          opacity: 0 
        }}
        animate={{ 
          x: 0, 
          y: 0,
          opacity: 1 
        }}
        exit={{ 
          x: window.innerWidth < 768 ? 0 : 420, 
          y: window.innerWidth < 768 ? "100%" : 0,
          opacity: 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed md:right-0 md:top-[64px] md:bottom-0 
                   left-0 right-0 bottom-0 
                   md:w-[420px] w-full
                   md:max-h-[calc(100vh-64px)] max-h-[85vh]
                   z-40 bg-black/95 backdrop-blur-xl 
                   md:border-l border-t md:border-t-0 border-white/10 
                   flex flex-col
                   md:shadow-[-10px_0_40px_rgba(0,0,0,0.25)]
                   shadow-2xl
                   md:rounded-none rounded-t-[28px]"
        data-testid="right-chat-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <AthenaTraderAvatar 
              isActive={true}
              showStatus={true}
              size="small"
            />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-light">
                {activeAvatar?.name || "Athena AI"}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 min-h-[40px] min-w-[40px]"
              onClick={clearMessages}
              data-testid="button-clear-chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 min-h-[40px] min-w-[40px] hidden sm:flex"
              onClick={handleCollapse}
              data-testid="button-minimize-chat"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 min-h-[40px] min-w-[40px]"
              onClick={handleClose}
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-[20px] p-4",
                  message.sender === "user" 
                    ? "bg-primary/20 backdrop-blur-sm border border-primary/30" 
                    : "bg-white/5 backdrop-blur-sm border border-white/10"
                )}>
                  <ChatMessage 
                    content={message.content} 
                    role={message.sender === "user" ? "user" : "assistant"}
                    timestamp={message.timestamp instanceof Date 
                      ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : message.timestamp}
                  />
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[20px] p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Athena is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about investing..."
              className="flex-1 rounded-[20px] border-white/10 bg-white/5 
                         placeholder:text-muted-foreground focus:ring-2 
                         focus:ring-primary focus:border-primary"
              disabled={isLoading}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-full h-11 w-11 min-h-[44px] min-w-[44px] p-0 bg-primary hover:bg-primary/90"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}