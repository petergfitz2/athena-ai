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

export default function LeftChatPanel() {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
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

  // Handle collapsed state with a minimal vertical bar
  if (isCollapsed) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed left-0 top-0 h-screen w-1 z-40 bg-gradient-to-b from-primary/30 to-primary/10 
                     hover:w-2 cursor-pointer transition-all duration-200"
          onClick={handleExpand}
          data-testid="button-expand-chat-bar"
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-20 
                          bg-gradient-to-b from-transparent via-primary to-transparent opacity-60 animate-pulse" />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          x: window.innerWidth < 768 ? 0 : -400, 
          y: window.innerWidth < 768 ? "100%" : 0,
          opacity: 0 
        }}
        animate={{ 
          x: 0, 
          y: 0,
          opacity: 1 
        }}
        exit={{ 
          x: window.innerWidth < 768 ? 0 : -400, 
          y: window.innerWidth < 768 ? "100%" : 0,
          opacity: 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed md:left-0 md:top-0 md:bottom-0 
                   left-0 right-0 bottom-0 
                   md:w-[400px] w-full
                   md:max-h-full max-h-[85vh]
                   z-40 bg-black/95 backdrop-blur-xl 
                   md:border-r border-t md:border-t-0 border-white/10 
                   flex flex-col shadow-2xl
                   md:rounded-none rounded-t-[28px]"
        data-testid="left-chat-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AthenaTraderAvatar 
              isActive={true}
              showStatus={true}
              size="sm"
            />
            <div>
              <h3 className="text-lg font-light">
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
              className="rounded-full h-8 w-8"
              onClick={clearMessages}
              data-testid="button-clear-chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={handleCollapse}
              data-testid="button-minimize-chat"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
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
                    timestamp={message.timestamp}
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
              className="rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90"
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