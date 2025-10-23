import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import DailyBriefing from "@/components/DailyBriefing";
import ChatMessage from "@/components/ChatMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Brain,
  Mic,
  Send,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Plus,
  ShoppingCart,
  LineChart,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Star,
  MessageCircle,
  X,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  averageCost: string;
}

interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  publishedAt: string;
  sentiment?: string;
  tickers?: string[];
}

export default function CommandCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Good morning! I'm analyzing today's market opportunities for you. How can I help optimize your portfolio?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(localStorage.getItem('athena_expanded_view') === 'true');

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.username || "Investor";
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    if (hour < 21) return `Good evening, ${name}`;
    return `Good night, ${name}`;
  };

  const getMarketStatus = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    if (day === 0 || day === 6) {
      return { text: "Markets Closed", color: "text-muted-foreground", icon: Clock };
    }
    
    if (hour >= 9 && hour < 16) {
      return { text: "Markets Open", color: "text-success", icon: Activity };
    }
    
    return { text: "After Hours", color: "text-warning", icon: Clock };
  };

  const marketStatus = getMarketStatus();

  // Voice handling
  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: async (text) => {
      setInput(text);
      setTimeout(() => handleSendMessage(text), 100);
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch portfolio data
  const { data: portfolioSummary } = useQuery<{
    totalValue: number;
    totalCost: number;
    totalGain: number;
    totalGainPercent: number;
    dayGain: number;
    dayGainPercent: number;
  }>({
    queryKey: ["/api/portfolio/summary"],
  });

  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ["/api/holdings"],
  });

  const { data: news = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/market/news"],
  });

  // Create conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await apiJson<{ id: string }>("POST", "/api/conversations", {
          title: "Command Center Session",
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };
    initConversation();
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('athena_expanded_view', expandedView.toString());
  }, [expandedView]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiJson<{ response: string }>("POST", "/api/chat", {
        message: text,
        conversationId,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: ShoppingCart, label: "Buy", color: "text-success", action: () => toast({ title: "Buy Order", description: "Opening order form..." }) },
    { icon: DollarSign, label: "Sell", color: "text-destructive", action: () => toast({ title: "Sell Order", description: "Opening sell form..." }) },
    { icon: LineChart, label: "Analyze", color: "text-primary", action: () => toast({ title: "Analysis", description: "Starting analysis..." }) },
    { icon: BookOpen, label: "Learn", color: "text-purple-500", action: () => toast({ title: "Learning", description: "Opening education center..." }) },
  ];

  const topMovers = holdings.slice(0, 3).map(h => ({
    symbol: h.symbol,
    change: Math.random() * 10 - 5,
    value: parseFloat(h.quantity) * 100 * (1 + Math.random() * 0.1),
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Avatar and Greeting */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AthenaTraderAvatar size="small" showStatus={true} showName={false} />
              <div>
                <h1 className="text-2xl font-extralight text-foreground">
                  {getGreeting()}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <marketStatus.icon className="w-3 h-3" />
                  <span className={cn("text-sm", marketStatus.color)}>
                    {marketStatus.text}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                className="rounded-full"
                data-testid="button-voice-command"
              >
                {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Recording..." : "Voice Command"}
              </Button>
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost"
                size="sm"
                className="rounded-full"
                data-testid="button-toggle-chat"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
                {sidebarOpen && <X className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Briefing */}
      {showBriefing && (
        <DailyBriefing onDismiss={() => setShowBriefing(false)} />
      )}

      {/* Main Grid Layout */}
      <div className={cn(
        "max-w-[1600px] mx-auto p-6 transition-all duration-300",
        sidebarOpen ? "lg:mr-[450px]" : ""
      )}>
        <div className={cn(
          "grid gap-6",
          expandedView ? "lg:grid-cols-3 md:grid-cols-2" : "lg:grid-cols-2"
        )}>
          {/* Portfolio Snapshot */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Portfolio Snapshot</span>
                <Shield className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-extralight text-foreground">
                  ${portfolioSummary?.totalValue.toLocaleString() || "0"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {(portfolioSummary?.dayGainPercent || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={cn(
                    "text-sm",
                    (portfolioSummary?.dayGainPercent || 0) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {(portfolioSummary?.dayGainPercent || 0) >= 0 ? "+" : ""}
                    {portfolioSummary?.dayGainPercent?.toFixed(2) || "0"}% Today
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Top Movers</p>
                {topMovers.map((mover) => (
                  <div key={mover.symbol} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{mover.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">${mover.value.toFixed(0)}</span>
                      <Badge 
                        variant={mover.change >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {mover.change >= 0 ? "+" : ""}{mover.change.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">AI Insights</span>
                <Brain className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Strong Buy Signal</p>
                    <p className="text-xs text-muted-foreground">NVDA showing bullish momentum</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Portfolio Optimization</p>
                    <p className="text-xs text-muted-foreground">Consider rebalancing tech sector</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Risk Alert</p>
                    <p className="text-xs text-muted-foreground">Volatility expected in energy sector</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full rounded-full"
                variant="default"
                size="sm"
                data-testid="button-view-recommendations"
              >
                View All Recommendations
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader className="pb-4">
              <CardTitle className="font-light">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    onClick={action.action}
                    variant="outline"
                    className="rounded-[16px] h-20 flex flex-col gap-2 hover-elevate active-elevate-2"
                    data-testid={`button-quick-${action.label.toLowerCase()}`}
                  >
                    <action.icon className={cn("w-6 h-6", action.color)} />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Pulse */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Market Pulse</span>
                <Activity className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {news.slice(0, 3).map((article) => (
                <div key={article.id} className="pb-3 border-b border-white/5 last:border-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {article.tickers && article.tickers.length > 0 && (
                      <div className="flex gap-1">
                        {article.tickers.slice(0, 2).map(ticker => (
                          <Badge key={ticker} variant="outline" className="text-xs">
                            {ticker}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Positions */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Active Positions</span>
                <Badge variant="outline" className="text-xs">
                  {holdings.length} Holdings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holdings.slice(0, 5).map((holding) => {
                  const currentPrice = 100 * (1 + Math.random() * 0.2);
                  const avgCost = parseFloat(holding.averageCost);
                  const quantity = parseFloat(holding.quantity);
                  const totalValue = currentPrice * quantity;
                  const gain = totalValue - (avgCost * quantity);
                  const gainPercent = (gain / (avgCost * quantity)) * 100;

                  return (
                    <div key={holding.id} className="flex items-center justify-between p-3 rounded-[16px] bg-white/5 hover-elevate active-elevate-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {holding.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{holding.symbol}</p>
                          <p className="text-xs text-muted-foreground">{quantity} shares</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">${totalValue.toLocaleString()}</p>
                        <p className={cn(
                          "text-xs flex items-center justify-end gap-1",
                          gainPercent >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {gainPercent >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {gainPercent >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="ghost" className="rounded-full h-8 px-3">
                          Buy
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-full h-8 px-3">
                          Sell
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {holdings.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 rounded-full"
                  size="sm"
                  data-testid="button-view-all-positions"
                >
                  View All Positions
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* View Toggle */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setExpandedView(!expandedView)}
            variant="ghost"
            size="sm"
            className="rounded-full"
            data-testid="button-toggle-view"
          >
            {expandedView ? "Compact View" : "Expanded View"}
          </Button>
        </div>
      </div>

      {/* Athena Chat Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[450px] bg-black/95 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 z-50",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AthenaTraderAvatar size="mini" showStatus={false} showName={false} />
              <div>
                <h3 className="text-lg font-light">Athena AI</h3>
                <p className="text-xs text-muted-foreground">Your Investment Advisor</p>
              </div>
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="rounded-full"
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AthenaTraderAvatar size="mini" isTyping={true} showStatus={false} showName={false} />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "ghost"}
                size="icon"
                className="rounded-full"
                data-testid="button-sidebar-voice"
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about investments..."
                className="flex-1 min-h-[40px] max-h-[100px] resize-none rounded-[20px]"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}