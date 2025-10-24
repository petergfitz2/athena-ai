import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVoice } from "@/hooks/useVoice";
import { useMode } from "@/contexts/ModeContext";
import { useModeSuggestion } from "@/hooks/useConversationContext";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import ModeSuggestion from "@/components/ModeSuggestion";
import NewsDetailModal from "@/components/NewsDetailModal";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Activity, LayoutDashboard, Send, Mic, Square, List, Settings, BarChart3 } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle } from "@shared/schema";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

function TerminalModeContent() {
  const { setMode } = useMode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  useKeyboardShortcuts();
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [modeReady, setModeReady] = useState(false);
  const { suggestion, shouldShow, dismissSuggestion } = useModeSuggestion(conversationId, modeReady);
  
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Good morning, Peter. Strong buy signal on EQIX—data center demand is exploding as AI companies need massive computing infrastructure. Revenue's up 24% year-over-year.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);
  
  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: async (text) => {
      // Set the input field with the transcript first
      setInput(text);
      
      // Automatically send the message after transcript is received
      setTimeout(async () => {
        // Only proceed if we have text and not already loading
        if (!text.trim() || isLoading) return;
        
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput(""); // Clear the input after creating the message
        setIsLoading(true);

        const currentLastMessageTime = lastMessageTime;

        try {
          const data = await apiJson<{ response: string }>("POST", "/api/chat", {
            message: text, // Use the transcript text directly
            conversationId,
            lastMessageTime: currentLastMessageTime,
          });

          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setLastMessageTime(Date.now());
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to send voice message",
            variant: "destructive",
          });
          // Remove the failed message from the list
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
          setIsLoading(false);
        }
      }, 100);
    },
    onResponse: (text) => {
      // This is for TTS response if backend sends audio back
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    setMode("terminal");
    setModeReady(true);
  }, [setMode]);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await apiJson<{ id: string }>("POST", "/api/conversations", {
          title: "Terminal Mode Session",
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, []);
  
  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

  const { data: news = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/market/news"],
  });

  const handleNewsClick = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewsModalOpen(true);
  };

  const getMockPrice = (symbol: string) => {
    const prices: Record<string, number> = {
      AAPL: 178.32,
      MSFT: 378.91,
      TSLA: 242.84,
      NVDA: 495.32,
      GOOGL: 141.80,
      AMZN: 152.74,
    };
    return prices[symbol] || 100;
  };

  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      const price = getMockPrice(holding.symbol);
      const quantity = parseFloat(holding.quantity);
      return total + (price * quantity);
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const dailyChange = 2847.32;
  const dailyChangePercent = 2.3;

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const currentLastMessageTime = lastMessageTime;

    try {
      const data = await apiJson<{ response: string }>("POST", "/api/chat", {
        message: messageText,
        conversationId,
        lastMessageTime: currentLastMessageTime,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastMessageTime(Date.now());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Unified Header */}
      <Navigation />
      <NavigationBreadcrumbs />

      {/* Portfolio Stats Bar - Responsive */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-extralight text-foreground">Terminal</h1>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Portfolio</p>
              <p className="text-sm sm:text-lg font-light text-foreground">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Today</p>
              <p className={`text-sm sm:text-lg font-light ${dailyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {dailyChange >= 0 ? '+' : ''}{dailyChangePercent}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Panel Layout - Responsive grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 overflow-auto">
        {/* Markets Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Markets
          </h2>
          <div className="space-y-3">
            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">S&P 500</p>
                  <p className="text-xs text-muted-foreground">SPX</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">4,521.23</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +0.8%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">NASDAQ</p>
                  <p className="text-xs text-muted-foreground">COMP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">14,167.89</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +1.2%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">Dow Jones</p>
                  <p className="text-xs text-muted-foreground">DJI</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">35,284.52</p>
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -0.3%
                  </p>
                </div>
              </div>
            </div>

            <div className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-foreground">VIX</p>
                  <p className="text-xs text-muted-foreground">Volatility</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">14.23</p>
                  <p className="text-xs text-muted-foreground">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Holdings</h2>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No holdings</p>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding) => {
                const currentPrice = getMockPrice(holding.symbol);
                const avgCost = parseFloat(holding.averageCost);
                const quantity = parseFloat(holding.quantity);
                const totalValue = currentPrice * quantity;
                const totalCost = avgCost * quantity;
                const gain = totalValue - totalCost;
                const gainPercent = ((gain / totalCost) * 100).toFixed(2);

                return (
                  <div key={holding.id} className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-foreground">{holding.symbol}</p>
                        <p className="text-xs text-muted-foreground">{quantity} shares</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">${totalValue.toLocaleString()}</p>
                        <p className={`text-xs ${parseFloat(gainPercent) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {parseFloat(gainPercent) >= 0 ? '+' : ''}{gainPercent}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: ${avgCost.toFixed(2)}</span>
                      <span>Current: ${currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Analysis</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
              <p className="text-2xl font-light text-foreground">1.82</p>
              <p className="text-xs text-success">Above average</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beta</p>
              <p className="text-2xl font-light text-foreground">1.15</p>
              <p className="text-xs text-muted-foreground">vs S&P 500</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Volatility</p>
              <p className="text-2xl font-light text-foreground">18.3%</p>
              <p className="text-xs text-warning">Moderate</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
              <p className="text-2xl font-light text-destructive">-12.4%</p>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
          </div>
        </div>

        {/* News & Intelligence Panel */}
        <div className="glass rounded-[20px] p-4 overflow-auto">
          <h2 className="text-lg font-light text-foreground mb-4">Intelligence</h2>
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No news available</p>
          ) : (
            <div className="space-y-3">
              {news.slice(0, 6).map((article, index) => {
                const timeAgo = new Date(article.publishedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const sentimentColor = article.sentimentLabel?.toLowerCase().includes('bull') || article.sentimentLabel?.toLowerCase().includes('positive')
                  ? 'text-success'
                  : article.sentimentLabel?.toLowerCase().includes('bear') || article.sentimentLabel?.toLowerCase().includes('negative')
                  ? 'text-destructive'
                  : 'text-warning';

                return (
                  <div
                    key={article.id}
                    className={`pb-3 cursor-pointer hover-elevate active-elevate-2 rounded-[16px] p-2 -m-2 transition-all ${
                      index < news.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                    onClick={() => handleNewsClick(article)}
                    data-testid={`news-item-${article.id}`}
                  >
                    {article.sentimentLabel && (
                      <p className={`text-xs mb-1 font-medium ${sentimentColor}`}>
                        {article.sentimentLabel}
                      </p>
                    )}
                    <p className="text-sm text-foreground mb-1 line-clamp-2">
                      {article.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{timeAgo}</p>
                      {article.tickers && article.tickers.length > 0 && (
                        <div className="flex gap-1">
                          {article.tickers.slice(0, 2).map(ticker => (
                            <span key={ticker} className="text-xs text-primary">
                              {ticker}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-shrink-0 border-t border-white/10 bg-black/50">
        {/* Messages Preview - Compact */}
        <div className="px-6 py-2 max-h-20 overflow-y-auto space-y-1">
          {messages.slice(-2).map((message) => (
            <div key={message.id} className="flex items-start gap-2">
              <p className="text-xs text-muted-foreground flex-shrink-0">{message.role === 'user' ? 'You' : 'Athena'}:</p>
              <p className="text-xs text-foreground line-clamp-1">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="px-6 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full flex-shrink-0 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
              data-testid="button-voice-terminal"
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    handleSendMessage();
                  }
                }
              }}
              placeholder="Any good buying opportunities?"
              className="flex-1 h-10 rounded-full bg-white/10 border-white/20 text-foreground placeholder:text-white/40 px-4"
              disabled={isLoading}
              data-testid="input-terminal-message"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full flex-shrink-0"
              data-testid="button-send-terminal"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send • Shift+Enter for new line • Cmd/Ctrl + K for voice
          </p>
        </div>
      </div>

      {/* Mode Suggestion */}
      {shouldShow && suggestion?.recommendedMode && (
        <ModeSuggestion
          recommendedMode={suggestion.recommendedMode}
          reason={suggestion.reason}
          onDismiss={dismissSuggestion}
        />
      )}

      {/* News Detail Modal */}
      <NewsDetailModal
        article={selectedNews}
        open={newsModalOpen}
        onClose={() => {
          setNewsModalOpen(false);
          setSelectedNews(null);
        }}
      />
    </div>
  );
}

export default function TerminalMode() {
  return (
    <ProtectedRoute>
      <TerminalModeContent />
    </ProtectedRoute>
  );
}
