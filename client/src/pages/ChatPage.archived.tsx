import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatMessage from "@/components/ChatMessage";
import OmniBox from "@/components/OmniBox";
import QuickActionButtons from "@/components/QuickActionButtons";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, TrendingUp, Wallet, Info, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  createdAt?: string;
  type?: "chat" | "stock" | "command";
};

type Conversation = {
  id: string;
  title: string;
};

type PortfolioSummary = {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
};

type MarketIndex = {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
};

function ChatPageContent() {
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Fetch active avatar for personalized greeting
  const { data: activeAvatar } = useQuery<any>({
    queryKey: ['/api/avatars/active']
  });

  // Fetch portfolio summary for sidebar
  const { data: portfolio } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
    select: () => ({
      totalValue: 125850,
      dayChange: 3020,
      dayChangePercent: 2.4
    })
  });

  // Fetch market indices
  const { data: indices = [] } = useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    select: () => [
      { symbol: 'SPY', name: 'S&P 500', value: 4783.45, change: 23.31, changePercent: 0.49 },
      { symbol: 'DIA', name: 'Dow Jones', value: 37863.80, change: 211.02, changePercent: 0.56 },
      { symbol: 'QQQ', name: 'NASDAQ', value: 16734.12, change: -19.07, changePercent: -0.11 },
    ]
  });
  
  // Generate dynamic greeting based on avatar personality
  const getAvatarGreeting = () => {
    if (!activeAvatar) {
      return "Hello! I'm your AI investment advisor. How can I help you today?";
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
      return `Hey! I'm ${name}. Sell me this pen!\n\nJust kidding. Show me your portfolio - let's make some real money.`;
    }
    
    if (profile.traits?.includes('analytical') || 
        profile.tradingStyle === 'analytical') {
      return `Greetings, I'm ${name}. Let's analyze your investment opportunities with data-driven precision.`;
    }
    
    if (profile.traits?.includes('friendly') || 
        profile.traits?.includes('casual')) {
      return `Hey there! I'm ${name}. Ready to talk about your investments?`;
    }
    
    if (profile.tradingStyle === 'conservative') {
      return `Hello, I'm ${name}. Let's build your wealth safely and strategically.`;
    }
    
    // Default professional greeting
    return `Hello! I'm ${name}, your AI investment advisor. How can I help you today?`;
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update greeting when avatar changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getAvatarGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "chat"
      }]);
    }
  }, [activeAvatar, currentConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Load messages for current conversation
  const { data: conversationMessages, error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  useEffect(() => {
    if (messagesError) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  }, [messagesError, toast]);

  const handleSendMessage = async (content: string) => {
    const tempUserId = `user-${Date.now()}`;
    const tempAssistantId = `assistant-${Date.now() + 1}`;
    
    const newMessage: Message = {
      id: tempUserId,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "chat"
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      let convId = currentConversationId;
      if (!convId) {
        const convData = await apiJson<Conversation>("POST", "/api/conversations", { 
          title: "New Chat" 
        });
        convId = convData.id;
        setCurrentConversationId(convId);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }

      const data = await apiJson<{ response: string }>("POST", "/api/chat", { 
        message: content,
        conversationId: convId
      });

      const aiResponse: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "chat"
      };
      
      setMessages(prev => [...prev, aiResponse]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", convId, "messages"] });
      setIsLoading(false);
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== tempUserId));
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: getAvatarGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "chat"
    }]);
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-black px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight">
                Invest Smarter
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground font-light mt-2">
                Search stocks, execute trades, or ask your AI advisor anything
              </p>
            </div>
            
            {/* Avatar Display */}
            {activeAvatar && (
              <div className="flex items-center gap-3">
                {activeAvatar.imageUrl && (
                  <img 
                    src={activeAvatar.imageUrl} 
                    alt={activeAvatar.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                  />
                )}
                <div>
                  <p className="text-sm font-light text-white">{activeAvatar.name}</p>
                  <p className="text-xs text-white/40">Your Advisor</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Single Unified Input */}
        <div className="mb-8">
          <OmniBox 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Try: AAPL for price • Buy 10 MSFT • What's the market outlook?"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Portfolio Snapshot */}
            <Card className="glass rounded-[28px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  Portfolio
                </h3>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
              {portfolio && (
                <div>
                  <p className="text-3xl font-extralight text-white mb-1">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                  <p className={`text-sm ${portfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(portfolio.dayChangePercent)} Today
                  </p>
                </div>
              )}
            </Card>

            {/* Market Indices */}
            <Card className="glass rounded-[28px] p-6">
              <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Markets
              </h3>
              <div className="space-y-3">
                {indices.map(index => (
                  <div key={index.symbol} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{index.symbol}</p>
                      <p className="text-xs text-white/40">{index.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">${index.value.toLocaleString()}</p>
                      <p className={`text-xs ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(index.changePercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Help */}
            <Card className="glass rounded-[28px] p-6">
              <h3 className="text-lg font-light text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                Quick Tips
              </h3>
              <div className="space-y-2 text-xs text-white/60">
                <p>• Type any ticker symbol for instant price</p>
                <p>• Say "Buy 10 AAPL" to trade</p>
                <p>• Ask questions like "How do I diversify?"</p>
                <p>• Type "portfolio" to see holdings</p>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {/* Conversation History Tabs */}
            {conversations.length > 0 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                <Button
                  onClick={handleNewConversation}
                  variant="outline"
                  className="rounded-[28px] text-sm"
                  data-testid="button-new-conversation"
                >
                  + New Chat
                </Button>
                {conversations.slice(0, 4).map((conv) => (
                  <Button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    variant={currentConversationId === conv.id ? "default" : "ghost"}
                    className="rounded-[28px] text-sm"
                    data-testid={`button-conversation-${conv.id}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {conv.title}
                  </Button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="glass rounded-[28px] p-6 md:p-10 lg:p-12 h-[600px] overflow-y-auto" data-testid="chat-messages">
              <div className="space-y-6 lg:space-y-8">
                {messages.length <= 1 && !isLoading && (
                  <QuickActionButtons onAction={handleSendMessage} disabled={isLoading} />
                )}
                {messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
                {isLoading && messages.length > 0 && (
                  <div className="flex items-center gap-2 lg:gap-3 text-muted-foreground">
                    <div className="flex gap-1 lg:gap-1.5">
                      <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">{activeAvatar?.name || "Your advisor"} is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}