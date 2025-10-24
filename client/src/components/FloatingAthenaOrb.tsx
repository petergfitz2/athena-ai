import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Sparkles, TrendingUp, HelpCircle, Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "chat" | "stock" | "command";
}

type IntentType = "stock" | "command" | "question" | "unknown";

export default function FloatingAthenaOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<IntentType>("unknown");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Fetch active avatar for personalized greeting
  const { data: activeAvatar } = useQuery<any>({
    queryKey: ['/api/avatars/active']
  });
  
  // Generate dynamic greeting based on avatar personality
  const getAvatarGreeting = () => {
    if (!activeAvatar) {
      return "Hi! I'm your AI investment assistant. I can help you analyze stocks, suggest trades, and answer any questions about your portfolio. What would you like to know?";
    }
    
    const name = activeAvatar?.name || "Your advisor";
    const profile = activeAvatar?.personalityProfile || {};
    
    // Use custom greeting if available
    if (profile.greeting) {
      return profile.greeting;
    }
    
    // Generate greeting based on personality traits
    if (profile.backstory?.toLowerCase().includes('wolf') || 
        profile.traits?.includes('aggressive')) {
      return `${name} here. Let's cut to the chase - what trades are you looking at?`;
    }
    
    if (profile.traits?.includes('analytical') || 
        profile.tradingStyle === 'analytical') {
      return `I'm ${name}. Ready to analyze your portfolio with precision. What can I help you with?`;
    }
    
    if (profile.traits?.includes('friendly') || 
        profile.traits?.includes('casual')) {
      return `Hey! ${name} here. What's on your mind about the markets today?`;
    }
    
    if (profile.tradingStyle === 'conservative') {
      return `Hello, I'm ${name}. Let's review your investments carefully. How can I assist?`;
    }
    
    // Default professional greeting
    return `Hi! I'm ${name}, your AI investment assistant. I can help you analyze stocks, suggest trades, and answer any questions about your portfolio. What would you like to know?`;
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Update greeting when avatar changes or when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        content: getAvatarGreeting(),
        sender: "ai",
        timestamp: new Date(),
        type: "chat"
      }]);
    }
  }, [isOpen, activeAvatar]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect intent as user types
  useEffect(() => {
    const trimmed = input.trim().toUpperCase();
    
    // Check for stock ticker (3-5 capital letters)
    if (/^[A-Z]{3,5}$/.test(trimmed)) {
      setDetectedIntent("stock");
    } 
    // Check for commands
    else if (/^(BUY|SELL|TRADE|SHOW|VIEW)\s/i.test(input)) {
      setDetectedIntent("command");
    }
    // Check for questions
    else if (input.includes('?') || /^(what|how|why|when|should|can|is)/i.test(input)) {
      setDetectedIntent("question");
    }
    else {
      setDetectedIntent("unknown");
    }
  }, [input]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const conversationId = localStorage.getItem("athena_conversation_id");
      const response = await apiJson("POST", "/api/chat", {
        message,
        conversationId,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.conversationId) {
        localStorage.setItem("athena_conversation_id", data.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
          type: "chat"
        },
      ]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
      type: detectedIntent === "stock" ? "stock" : 
            detectedIntent === "command" ? "command" : "chat"
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Handle different intents
    if (detectedIntent === "stock") {
      // Check stock price
      toast({
        title: `${input.toUpperCase()} Price`,
        description: `$${(Math.random() * 500 + 50).toFixed(2)} (Demo)`,
      });
      setInput("");
      // Refocus input after clearing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (detectedIntent === "command") {
      // Execute command
      toast({
        title: "Command Executed",
        description: `Processing: ${input}`,
      });
      setInput("");
      // Send to AI for processing
      sendMessage.mutate(input);
      // Refocus input after clearing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Send to AI chat
      setInput("");
      sendMessage.mutate(input);
      // Refocus input after clearing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const getIntentIcon = () => {
    switch (detectedIntent) {
      case "stock":
        return <TrendingUp className="w-4 h-4" />;
      case "command":
        return <DollarSign className="w-4 h-4" />;
      case "question":
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getIntentLabel = () => {
    switch (detectedIntent) {
      case "stock":
        return "Stock Price";
      case "command":
        return "Trade Command";
      case "question":
        return "Question";
      default:
        return "Search";
    }
  };

  return (
    <>
      {/* Floating Orb Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 p-0"
            data-testid="button-floating-athena"
          >
            <AthenaTraderAvatar size="mini" showStatus={false} showName={false} className="pointer-events-none" />
            <Badge 
              className="absolute -top-1 -right-1 bg-destructive text-white border-0 animate-pulse"
              data-testid="badge-demo-mode"
            >
              DEMO
            </Badge>
          </Button>
          <div className="absolute bottom-0 right-20 bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <p className="text-xs text-white">Ask your AI advisor</p>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <Card className="bg-black/95 backdrop-blur-xl border-white/10 rounded-[28px] shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AthenaTraderAvatar size="mini" showStatus={false} showName={false} />
                <div>
                  <CardTitle className="text-lg font-light">
                    {activeAvatar?.name || "AI Assistant"}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Demo Mode - Virtual Trading
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4" ref={scrollRef}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[20px] px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-white/10"
                        }`}
                      >
                        {message.sender === "user" && message.type && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {message.type === "stock" ? "📈 Stock" :
                             message.type === "command" ? "⚡ Command" : "💬 Chat"}
                          </Badge>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-white/10 rounded-[20px] px-4 py-3">
                        <AthenaTraderAvatar size="mini" isTyping={true} showStatus={false} showName={false} />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Single Intelligent Input */}
              <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-3 top-3 z-10">
                      {getIntentIcon()}
                    </div>
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="AAPL • Buy 10 MSFT • What's trending?"
                      className="pl-10 pr-24 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-[28px] text-sm"
                      disabled={sendMessage.isPending}
                      data-testid="omnibox-input"
                      autoFocus
                    />
                    {input && (
                      <div className="absolute right-3 top-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-white/20 bg-white/5"
                        >
                          {getIntentLabel()}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick suggestions - click to try */}
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setInput("AAPL")}
                    >
                      📈 AAPL
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setInput("Buy 10 TSLA")}
                    >
                      ⚡ Trade
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setInput("How to diversify?")}
                    >
                      💡 Advice
                    </Badge>
                  </div>
                </form>
                
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Demo mode - No real trades executed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}