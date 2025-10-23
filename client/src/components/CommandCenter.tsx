import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import FloatingAthenaOrb from "@/components/FloatingAthenaOrb";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import DailyBriefing from "@/components/DailyBriefing";
import ChatMessage from "@/components/ChatMessage";
import WelcomeTutorial from "@/components/WelcomeTutorial";
import QuickStartGuide from "@/components/QuickStartGuide";
import DemoModeBanner from "@/components/DemoModeBanner";
import KeyboardShortcutsGuide from "@/components/KeyboardShortcutsGuide";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import NewsDetailModal from "@/components/NewsDetailModal";
import AnimatedCounter, { formatCurrency, formatPercent } from "@/components/AnimatedCounter";
import { LoadingMessage, MarketDataSkeleton, PortfolioSkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Square,
  Trophy,
  Users,
  Search
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
  sentimentLabel?: string;
  sentimentScore?: number;
  tickers?: string[];
  source?: string;
  url?: string;
  imageUrl?: string;
}

export default function CommandCenter() {
  const [location, setLocation] = useLocation();
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
  const [searchInput, setSearchInput] = useState("");
  
  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [prefilledSymbol, setPrefilledSymbol] = useState<string>("");
  
  // Ticker search state
  const [tickerSearch, setTickerSearch] = useState("");
  
  // News modal state
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);

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
    
    return { text: "After Hours", color: "text-warning font-semibold", icon: Clock };
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

  const { data: newsFromAPI = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/market/news"],
  });
  
  // Mock news data for Market Pulse - mix with API data
  const mockNews: NewsArticle[] = [
    {
      id: "mock-1",
      title: "Fed Maintains Interest Rates, Markets Rally on Dovish Tone",
      summary: "The Federal Reserve kept interest rates unchanged at their latest meeting, signaling a potential pause in the hiking cycle. Markets responded positively to the dovish commentary, with major indices closing up over 2%.",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Bullish",
      sentimentScore: 0.8,
      tickers: ["SPY", "QQQ", "IWM"],
      source: "Financial Times",
      url: "https://example.com/fed-news",
    },
    {
      id: "mock-2", 
      title: "NVIDIA Announces Revolutionary AI Chip, Stock Surges 8%",
      summary: "NVIDIA unveiled its next-generation AI processor at GTC, claiming 10x performance improvements. The announcement sent the stock soaring to new all-time highs, lifting the entire semiconductor sector.",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Very Bullish",
      sentimentScore: 0.95,
      tickers: ["NVDA", "AMD", "INTC"],
      source: "TechCrunch",
      url: "https://example.com/nvidia-chip",
    },
    {
      id: "mock-3",
      title: "Apple Faces Regulatory Challenges in EU Over App Store Policies",
      summary: "European regulators have opened a new investigation into Apple's App Store practices, potentially leading to significant fines. The news weighed on Apple shares, which fell 2.3% in after-hours trading.",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Bearish",
      sentimentScore: 0.3,
      tickers: ["AAPL", "GOOGL"],
      source: "Reuters",
      url: "https://example.com/apple-eu",
    },
    {
      id: "mock-4",
      title: "Tesla Delivers Record Q4 Vehicles, Beats Analyst Expectations",
      summary: "Tesla reported delivering 485,000 vehicles in Q4, surpassing Wall Street estimates. The strong delivery numbers suggest robust demand despite economic headwinds and increased competition in the EV market.",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Bullish",
      sentimentScore: 0.75,
      tickers: ["TSLA", "RIVN", "LCID"],
      source: "Bloomberg",
      url: "https://example.com/tesla-deliveries",
    },
    {
      id: "mock-5",
      title: "Oil Prices Spike on OPEC+ Production Cuts",
      summary: "OPEC+ announced surprise production cuts of 1.2 million barrels per day, sending crude oil prices up 5%. Energy stocks rallied while airlines and transportation companies faced pressure from higher fuel costs.",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Mixed",
      sentimentScore: 0.5,
      tickers: ["XOM", "CVX", "USO"],
      source: "Wall Street Journal",
      url: "https://example.com/opec-cuts",
    },
    {
      id: "mock-6",
      title: "Small Modular Reactor Stocks Surge on Clean Energy Push",
      summary: "SMR technology companies like Oklo and NuScale saw significant gains as the Biden administration announced new funding for next-generation nuclear reactors. The sector is attracting increased institutional investment.",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sentimentLabel: "Very Bullish",
      sentimentScore: 0.9,
      tickers: ["OKLO", "SMR", "CCJ"],
      source: "Clean Energy Wire",
      url: "https://example.com/smr-surge",
    }
  ];
  
  // Combine mock news with API news, prioritizing recent items
  const news = [...mockNews, ...newsFromAPI].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 10);

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
    { icon: Activity, label: "Simulator", color: "text-primary", action: () => setLocation("/simulator") },
    { icon: Users, label: "Social", color: "text-purple-500", action: () => setLocation("/social") },
    { icon: Trophy, label: "Rewards", color: "text-yellow-500", action: () => setLocation("/achievements") },
    { icon: Shield, label: "X-Ray", color: "text-blue-500", action: () => setLocation("/portfolio") },
  ];

  const topMovers = holdings.slice(0, 3).map(h => ({
    symbol: h.symbol,
    change: Math.random() * 10 - 5,
    value: parseFloat(h.quantity) * 100 * (1 + Math.random() * 0.1),
  }));
  
  // Handle opening trade modal with prefilled data
  const handleOpenTradeModal = (action: "buy" | "sell", symbol?: string) => {
    setTradeAction(action);
    setPrefilledSymbol(symbol || "");
    setTradeModalOpen(true);
  };
  
  // Smart contextual detection to determine if input is likely a stock ticker or conversational
  const isLikelyStockTicker = (input: string): boolean => {
    const trimmed = input.trim();
    
    // Check for explicit stock intent indicators
    const hasExplicitStockIntent = /^[$]|^(buy|sell|trade|stock|quote)\s+/i.test(trimmed);
    if (hasExplicitStockIntent) {
      return true;
    }
    
    // If it contains spaces, punctuation, or lowercase letters, it's likely conversational
    if (/[\s.,!?;:]/.test(trimmed) || /[a-z]/.test(trimmed)) {
      return false;
    }
    
    const upperTrimmed = trimmed.toUpperCase();
    
    // Only auto-detect as ticker if it's 3-5 uppercase letters
    // This avoids false positives for common 1-2 letter words like: 
    // HI, SO, AT, IT, OR, IF, BY, TO, GO, IN, UP, NO, OK, etc.
    if (upperTrimmed.length >= 3 && upperTrimmed.length <= 5 && /^[A-Z]+$/.test(upperTrimmed)) {
      return true;
    }
    
    // For 1-2 character inputs without explicit intent, default to conversational
    // Users can still look up 1-2 letter tickers by using $ prefix (e.g., "$F" for Ford)
    return false;
  };
  
  // Extract ticker from input with explicit intent (e.g., "$AAPL" or "buy AAPL")
  const extractTicker = (input: string): string | null => {
    const trimmed = input.trim();
    
    // Check for $ prefix (e.g., "$AAPL")
    const dollarMatch = trimmed.match(/^\$([A-Z]{1,5})/i);
    if (dollarMatch) {
      return dollarMatch[1].toUpperCase();
    }
    
    // Check for explicit commands (e.g., "buy AAPL", "trade MSFT")
    const commandMatch = trimmed.match(/^(?:buy|sell|trade|stock|quote)\s+([A-Z]{1,5})/i);
    if (commandMatch) {
      return commandMatch[1].toUpperCase();
    }
    
    // If no explicit intent, return the input if it matches ticker pattern
    const upper = trimmed.toUpperCase();
    if (upper.length >= 1 && upper.length <= 5 && /^[A-Z]+$/.test(upper)) {
      return upper;
    }
    
    return null;
  };
  
  // Handle ticker search - with smart contextual detection
  const handleTickerSearch = async (searchTerm: string) => {
    if (searchTerm.trim().length === 0) return;
    
    // Common stock mappings for company names
    const companyMappings: Record<string, string> = {
      "APPLE": "AAPL",
      "GOOGLE": "GOOGL",
      "MICROSOFT": "MSFT",
      "AMAZON": "AMZN",
      "TESLA": "TSLA",
      "META": "META",
      "FACEBOOK": "META",
      "NVIDIA": "NVDA",
      "NETFLIX": "NFLX",
      "DISNEY": "DIS",
    };
    
    const upperTerm = searchTerm.trim().toUpperCase();
    const mappedTicker = companyMappings[upperTerm];
    
    // If it's a known company name, treat it as a stock lookup
    if (mappedTicker) {
      handleOpenTradeModal("buy", mappedTicker);
      setTickerSearch("");
      
      // Also send query to Athena AI for insights
      if (!sidebarOpen) {
        setSidebarOpen(true);
      }
      
      const aiQuery = `Tell me about ${mappedTicker} stock. What's the current market sentiment and any recent news?`;
      handleSendMessage(aiQuery);
      return;
    }
    
    // Use smart contextual detection
    if (isLikelyStockTicker(searchTerm)) {
      const ticker = extractTicker(searchTerm);
      if (ticker) {
        // Open trade modal for the ticker
        handleOpenTradeModal("buy", ticker);
        setTickerSearch("");
        
        // Also send query to Athena AI for insights
        if (!sidebarOpen) {
          setSidebarOpen(true);
        }
        
        const aiQuery = `Tell me about ${ticker} stock. What's the current market sentiment and any recent news?`;
        handleSendMessage(aiQuery);
      }
    } else {
      // Default to conversational AI for everything else
      if (!sidebarOpen) {
        setSidebarOpen(true);
      }
      handleSendMessage(searchTerm);
      setTickerSearch("");
    }
  };
  
  // Handle news article click
  const handleNewsClick = (article: NewsArticle) => {
    setSelectedNewsArticle(article);
    setNewsModalOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black">
        {/* Navigation Bar */}
        <Navigation />
        <NavigationBreadcrumbs />
        <FloatingAthenaOrb />
        
        {/* Welcome Tutorial */}
        <WelcomeTutorial />
        
        {/* Quick Start Guide */}
        <QuickStartGuide />
        
        {/* Keyboard Shortcuts Guide */}
        <KeyboardShortcutsGuide />
        
        {/* Header with Avatar and Greeting */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AthenaTraderAvatar size="small" showStatus={true} showName={false} />
                <div>
                  <h1 className="text-2xl font-medium text-foreground">
                    {getGreeting()}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <marketStatus.icon className="w-4 h-4" />
                    <span className={cn("text-base font-medium", marketStatus.color)}>
                      {marketStatus.text}
                    </span>
                  </div>
                </div>
              </div>
            
            <div className="flex items-center gap-3">
              <DemoModeBanner inline />
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                className="rounded-full font-medium"
                data-testid="button-voice-command"
              >
                {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                <span className="font-semibold">{isRecording ? "Recording..." : "Voice Command"}</span>
              </Button>
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant="ghost"
                size="sm"
                className="rounded-full font-medium"
                data-testid="button-toggle-chat"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="font-semibold">Chat</span>
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
        {/* Prominent Search Bar - FIRST THING USERS SEE */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks or ask Athena anything..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchInput.trim()) {
                  // Use smart contextual detection
                  if (isLikelyStockTicker(searchInput)) {
                    handleTickerSearch(searchInput);
                  } else {
                    // Default to AI chat for conversational input
                    if (!sidebarOpen) setSidebarOpen(true);
                    handleSendMessage(searchInput);
                  }
                  setSearchInput("");
                }
              }}
              className="w-full pl-12 pr-4 h-14 text-lg rounded-full bg-white/5 border-white/20 text-foreground placeholder:text-white/40 focus:border-primary focus:bg-white/8 transition-all"
              data-testid="input-main-search"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (searchInput.trim()) {
                    // Use smart contextual detection
                    if (isLikelyStockTicker(searchInput)) {
                      handleTickerSearch(searchInput);
                    } else {
                      // Default to AI chat for conversational input
                      if (!sidebarOpen) setSidebarOpen(true);
                      handleSendMessage(searchInput);
                    }
                    setSearchInput("");
                  }
                }}
                data-testid="button-search-submit"
              >
                Press Enter
              </Button>
            </div>
          </div>
        </div>

        {/* Investment Dashboard - ACTUAL CONTENT */}
        <div className="mb-6">
          <h2 className="text-2xl font-normal text-foreground mb-4">Investment Dashboard</h2>
        </div>

        <div className={cn(
          "grid gap-6",
          expandedView ? "lg:grid-cols-3 md:grid-cols-2" : "lg:grid-cols-2"
        )}>
          {/* Portfolio Snapshot */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-medium">Portfolio Snapshot</span>
                <Shield className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-medium text-foreground">
                  <AnimatedCounter 
                    value={portfolioSummary?.totalValue || 0} 
                    formatValue={formatCurrency}
                    duration={1500}
                  />
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
                <span className="font-medium">AI Insights</span>
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
              <CardTitle className="font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Tooltip key={action.label}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={action.action}
                        variant="outline"
                        className="rounded-[16px] h-20 flex flex-col gap-2 hover-elevate active-elevate-2"
                        data-testid={`button-quick-${action.label.toLowerCase()}`}
                      >
                        <action.icon className={cn("w-6 h-6", action.color)} />
                        <span className="text-sm font-medium">{action.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {action.label === "Simulator" && "Practice trading with virtual money"}
                        {action.label === "Social" && "Connect with other traders"}
                        {action.label === "Rewards" && "View your achievements and badges"}
                        {action.label === "X-Ray" && "Analyze your portfolio health"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Pulse - Fully Interactive */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-medium">Market Pulse</span>
                <Activity className="w-5 h-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {news.slice(0, 4).map((article) => {
                const getSentimentBadgeVariant = (sentiment?: string) => {
                  if (!sentiment) return "outline";
                  const s = sentiment.toLowerCase();
                  if (s.includes("bullish")) return "default";
                  if (s.includes("bearish")) return "destructive";
                  return "secondary";
                };
                
                const getSentimentColor = (sentiment?: string) => {
                  if (!sentiment) return "";
                  const s = sentiment.toLowerCase();
                  if (s.includes("very bullish")) return "text-green-500";
                  if (s.includes("bullish")) return "text-success";
                  if (s.includes("bearish")) return "text-destructive";
                  if (s.includes("mixed")) return "text-warning";
                  return "";
                };
                
                return (
                  <Card 
                    key={article.id} 
                    className="p-3 bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-[16px]"
                    onClick={() => handleNewsClick(article)}
                    data-testid={`news-item-${article.id}`}
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {article.source && (
                            <span className="text-xs text-muted-foreground">
                              {article.source}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(article.publishedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        
                        {article.sentimentLabel && (
                          <Badge 
                            variant={getSentimentBadgeVariant(article.sentimentLabel)}
                            className={cn("text-xs", getSentimentColor(article.sentimentLabel))}
                          >
                            {article.sentimentLabel}
                          </Badge>
                        )}
                      </div>
                      
                      {article.tickers && article.tickers.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tickers.slice(0, 3).map(ticker => (
                            <Badge 
                              key={ticker} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTradeModal("buy", ticker);
                              }}
                            >
                              {ticker}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              
              <Button 
                variant="outline" 
                className="w-full rounded-full mt-2"
                size="sm"
                onClick={() => setLocation("/news")}
                data-testid="button-view-all-news"
              >
                View All Market News
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Active Positions */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px] lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-medium">Active Positions</span>
                <Badge variant="outline" className="text-xs">
                  {holdings.length} Holdings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ticker Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search Stocks (e.g., AAPL, GOOGL, $F)"
                    value={tickerSearch}
                    onChange={(e) => setTickerSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tickerSearch.trim()) {
                        handleTickerSearch(tickerSearch);
                      }
                    }}
                    className="pl-10 rounded-full bg-white/5 border-white/20 text-foreground placeholder:text-white/30 h-10 focus:border-primary/50 focus:bg-white/8"
                    data-testid="input-ticker-search"
                  />
                </div>
              </div>
              
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
                          <p 
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleOpenTradeModal("buy", holding.symbol)}
                            data-testid={`ticker-${holding.symbol}`}
                          >
                            {holding.symbol}
                          </p>
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
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-full h-8 px-3 font-semibold hover:bg-primary/20"
                          onClick={() => handleOpenTradeModal("buy", holding.symbol)}
                          data-testid={`button-buy-${holding.symbol}`}
                        >
                          Buy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-full h-8 px-3 font-semibold hover:bg-destructive/20"
                          onClick={() => handleOpenTradeModal("sell", holding.symbol)}
                          data-testid={`button-sell-${holding.symbol}`}
                        >
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
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <AthenaTraderAvatar size="mini" showStatus={false} showName={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium">Athena AI</h3>
                  <p className="text-xs text-muted-foreground">Your Investment Advisor</p>
                </div>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0"
                data-testid="button-close-sidebar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
      
      {/* Execute Trade Modal */}
      <ExecuteTradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        action={tradeAction}
        prefilledSymbol={prefilledSymbol}
      />
      
      {/* News Detail Modal */}
      <NewsDetailModal
        article={selectedNewsArticle ? {
          ...selectedNewsArticle,
          source: selectedNewsArticle.source || 'Unknown Source',
          url: selectedNewsArticle.url || '#'
        } : null}
        open={newsModalOpen}
        onClose={() => {
          setNewsModalOpen(false);
          setSelectedNewsArticle(null);
        }}
      />
    </div>
    </TooltipProvider>
  );
}