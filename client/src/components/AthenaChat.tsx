import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Mic, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import AthenaTraderAvatar from "./AthenaTraderAvatar";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "athena";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  cardType?: "stock" | "portfolio" | "trade" | "market";
  cardData?: any;
}

interface AthenaChatProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function AthenaChat({ isOpen = true, onToggle }: AthenaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "athena",
        content: "Hi! I'm Athena, your AI investment advisor. I can help you research stocks, analyze your portfolio, execute trades, or understand market movements. What would you like to explore today?",
        timestamp: new Date(),
        quickReplies: [
          "What's happening with NVDA?",
          "How's my portfolio doing?",
          "Show me trending stocks",
          "Help me build a trade",
          "What's moving the market?"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = generateResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      
      // Focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    handleSend();
  };

  const generateResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    const timestamp = new Date();
    const id = Date.now().toString();

    // Stock research flow
    if (lowerInput.includes("nvda") || lowerInput.includes("nvidia")) {
      return {
        id,
        role: "athena",
        content: "📊 NVDA Quick Snapshot\n\nCurrent: $495.23 (+3.2% today)\n52-week: $392-$628\nMarket cap: $1.22T\n\n🎯 Key Signals:\n• Momentum: 9.2/10 (extremely bullish)\n• RSI at 68 - approaching overbought\n• Volume 1.4x above average\n\n📈 Recent Catalyst:\nAI datacenter demand continues to exceed expectations with Q3 revenue beating by 12%.\n\n⚠️ Things to Watch:\n• China restrictions on advanced chips\n• Competition from AMD's MI300 series",
        timestamp,
        quickReplies: ["Buy NVDA", "Compare to AMD", "Show me other tech stocks"],
        cardType: "stock",
        cardData: { ticker: "NVDA", price: 495.23, change: 3.2, momentum: 9.2 }
      };
    }

    // Portfolio analysis flow
    if (lowerInput.includes("portfolio") || lowerInput.includes("how am i doing") || lowerInput.includes("how's my")) {
      return {
        id,
        role: "athena",
        content: "📊 Portfolio Health Check\n\nTotal Value: $54,120\nToday: +$1,285 (+2.4%)\nAll-Time: +$8,120 (+17.6%)\n\n🎯 Allocation Breakdown:\n• Tech: 68% (AAPL, MSFT, NVDA, META)\n• Auto: 13% (TSLA)\n• Cash: 9% ($5,000)\n\n⚡ Strength: Tech concentration has driven strong returns, outperforming S&P by 4.2%\n\n⚠️ Risk Area: Heavy tech concentration (68%) exposes you to sector-specific volatility. Consider diversifying into healthcare or financials.\n\n📈 Performance vs Benchmarks:\n• You: +17.6% YTD\n• S&P 500: +13.4%\n• NASDAQ: +15.2%\n\nYou're beating both major indices - nice work! 🎯",
        timestamp,
        quickReplies: ["Show top performers", "Explore diversification", "Check risk score"],
        cardType: "portfolio"
      };
    }

    // Trade execution flow
    if (lowerInput.includes("buy") && (lowerInput.includes("nvda") || lowerInput.includes("nvidia"))) {
      return {
        id,
        role: "athena",
        content: "Got it! Let's build your NVDA trade.\n\nYour available cash: $5,000\n\nHow much would you like to invest?",
        timestamp,
        quickReplies: ["$500", "$1,000", "$2,500", "All $5,000"],
        cardType: "trade"
      };
    }

    // Market overview flow
    if (lowerInput.includes("market") || lowerInput.includes("what's moving") || lowerInput.includes("what's happening")) {
      return {
        id,
        role: "athena",
        content: "📊 Market Pulse - " + new Date().toLocaleTimeString() + "\n\n📈 Major Indices:\n• S&P 500: 4,521 (+0.8%)\n• NASDAQ: 14,168 (+1.2%)\n• Dow Jones: 35,285 (-0.3%)\n\n🔥 Today's Movers:\n• NVDA: +3.2% - AI optimism continues\n• TSLA: -2.1% - Profit taking after rally\n• AAPL: +1.5% - iPhone 15 demand strong\n\n⚡ Market Sentiment: Bullish\nTech leads as Fed signals pause on rate hikes. Risk-on sentiment returning to growth stocks.\n\n📅 This Week's Catalysts:\n• Fed Minutes - Wednesday\n• CPI Data - Thursday\n• Options Expiry - Friday",
        timestamp,
        quickReplies: ["Show my holdings", "Explore trending stocks", "Check sector performance"],
        cardType: "market"
      };
    }

    // Default response for unrecognized queries
    return {
      id,
      role: "athena",
      content: "🤔 I'm not quite sure what you mean.\n\nI can help you with:\n• Stock research (\"Tell me about AAPL\")\n• Portfolio analysis (\"How am I doing?\")\n• Trade execution (\"Buy 10 shares of NVDA\")\n• Market overview (\"What's moving today?\")\n\nTry rephrasing, or pick one of the options above!",
      timestamp,
      quickReplies: ["What's happening with NVDA?", "How's my portfolio?", "What's moving the market?"]
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 600, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 600, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-[600px] z-40 flex"
        >
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-black/95 border border-white/10 rounded-l-[20px] p-3 hover:bg-white/10 transition-colors z-50"
            data-testid="button-toggle-chat"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Chat Panel */}
          <Card className="flex-1 bg-black/95 border-l border-white/10 rounded-none backdrop-blur-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <AthenaTraderAvatar size="small" showStatus={true} showName={false} />
              <div className="flex-1">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                  Talk to Athena
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-xs text-white/60">Your AI Investment Advisor</p>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}>
                    {message.role === "athena" && (
                      <AthenaTraderAvatar size="tiny" showStatus={false} showName={false} />
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-2 max-w-[80%]",
                      message.role === "user" && "items-end"
                    )}>
                      <div className={cn(
                        "rounded-[20px] p-4",
                        message.role === "user" 
                          ? "bg-gradient-to-r from-primary/80 to-purple-600/80 text-white"
                          : "bg-white/5 border border-white/10 text-white/90"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <span className="text-xs text-white/40 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Quick Replies */}
                      {message.quickReplies && message.role === "athena" && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.quickReplies.map((reply, idx) => (
                            <Button
                              key={idx}
                              onClick={() => handleQuickReply(reply)}
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs border-primary/50 text-primary hover:bg-primary/10"
                              data-testid={`button-quick-reply-${idx}`}
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <AthenaTraderAvatar size="tiny" showStatus={false} showName={false} />
                    <div className="bg-white/5 border border-white/10 rounded-[20px] p-4">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about stocks, trades, or markets..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-[20px] px-4"
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="rounded-full bg-primary hover:bg-primary/80 w-10 h-10"
                  disabled={!inputValue.trim()}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-white/10 hover:bg-white/10 w-10 h-10"
                  disabled
                  data-testid="button-voice-input"
                >
                  <Mic className="w-4 h-4 text-white/40" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}