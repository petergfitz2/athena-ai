import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import DailyBriefing from "@/components/DailyBriefing";
import ChatMessage from "@/components/ChatMessage";
import OnboardingDrawer from "@/components/OnboardingDrawer";
import DemoModeBanner from "@/components/DemoModeBanner";
import PortfolioSnapshot from "@/components/PortfolioSnapshot";
import AIInsights from "@/components/AIInsights";
import ExecuteTradeModal from "@/components/ExecuteTradeModal";
import NewsDetailModal from "@/components/NewsDetailModal";
import MarketOverview from "@/components/MarketOverview";
import AnimatedCounter, { formatCurrency, formatPercent } from "@/components/AnimatedCounter";
import { LoadingMessage, MarketDataSkeleton, PortfolioSkeleton } from "@/components/LoadingSkeletons";
import { TickerLink } from "@/components/TickerLink";
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
  const [sidebarOpen, setSidebarOpen] = useState(true); // AI chat open by default for AI-native experience
  const [showBriefing, setShowBriefing] = useState(false); // Skip briefing when chat is primary
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `👋 Hi Peter! Welcome to your AI-powered investment command center.

I'm Athena, your personal investment advisor. I can help you:
• Analyze any stock instantly - just mention a ticker like AAPL or TSLA
• Execute trades with simple commands like "buy 100 shares of NVDA"
• Get real-time market insights and personalized recommendations
• Research companies and sectors with institutional-grade analysis

Your portfolio is up +0.76% today at $125,850. What would you like to explore?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(localStorage.getItem('athena_expanded_view') === 'true');
  const [searchInput, setSearchInput] = useState("");
  
  // Ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref for chat input to maintain focus
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);
  
  // Add keyboard shortcut to close chat with Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);
  
  // Trade modal state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [prefilledSymbol, setPrefilledSymbol] = useState<string>("");
  
  // Ticker search state
  const [tickerSearch, setTickerSearch] = useState("");
  
  // News modal state
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  
  // Stock detail modal state
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockDetailOpen, setStockDetailOpen] = useState(false);

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

  // Fetch watchlist data
  const { data: watchlist = [] } = useQuery<Array<{ id: string; symbol: string; addedAt: string }>>({
    queryKey: ["/api/watchlist"],
  });

  // Fetch live quotes for all holdings
  const holdingSymbols = holdings.map(h => h.symbol);
  const { data: holdingQuotes = {} } = useQuery<Record<string, { price: number; change: number; changePercent: number }>>({
    queryKey: ["/api/market/quotes-batch", holdingSymbols.join(',')],
    enabled: holdingSymbols.length > 0,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch quotes for watchlist symbols
  const watchlistSymbols = watchlist.map(w => w.symbol);
  const { data: watchlistQuotes = {} } = useQuery<Record<string, { price: number; change: number; changePercent: number }>>({
    queryKey: ["/api/market/quotes-batch", watchlistSymbols.join(',')],
    enabled: watchlistSymbols.length > 0,
    refetchInterval: 60000, // Refetch every minute
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
  
  // ESC key handler for closing the chat sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

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
      // Keep focus on the input field for continuous conversation
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
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
        {/* Navigation Bar - Sticky */}
        <Navigation />
        <NavigationBreadcrumbs />
        
        {/* Consolidated Onboarding Drawer */}
        <OnboardingDrawer />
        
        {/* Compact Header Bar */}
        <div className="border-b border-white/10">
          <div className="w-full max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AthenaTraderAvatar size="small" showStatus={true} showName={false} />
                <div>
                  <h1 className="text-xl sm:text-2xl font-light text-white">
                    {getGreeting()}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <marketStatus.icon className="w-4 h-4" />
                    <span className={cn("text-sm font-medium", marketStatus.color)}>
                      {marketStatus.text}
                    </span>
                  </div>
                </div>
              </div>
            
              <div className="flex items-center gap-3">
                {!user && <DemoModeBanner inline />}
                {/* Unified Conversation Interface */}
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={cn(
                    "rounded-[20px] px-4 py-2 transition-all duration-300 flex items-center gap-2",
                    sidebarOpen 
                      ? "bg-white/10 text-white border border-white/20 hover:bg-white/15" 
                      : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  )}
                  data-testid="button-athena-chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Talk to Athena</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area - Luxury Grid Layout */}
        <div className={cn(
          "w-full px-8 py-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
          sidebarOpen ? "sm:mr-[320px] md:mr-[340px] lg:mr-[360px]" : "" // Account for chat sidebar width
        )}>
          
          {/* Daily Briefing - Floating Above Content */}
          {showBriefing && (
            <div className="mb-8">
              <DailyBriefing onDismiss={() => setShowBriefing(false)} />
            </div>
          )}
          
          {/* Master Grid - Clean 3-Column Layout with Proper Hierarchy */}
          <div className="max-w-[1600px] mx-auto">
            {/* Primary Section - Portfolio & Market Data */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Portfolio Snapshot - Primary Focus */}
              <div className="xl:col-span-1">
                <PortfolioSnapshot 
                  portfolioSummary={portfolioSummary} 
                  topMovers={topMovers} 
                />
              </div>
              
              {/* Market Overview - Equal Importance */}
              <div className="xl:col-span-1">
                <MarketOverview onTrade={handleOpenTradeModal} />
              </div>
            </div>
            
            {/* Secondary Section - Action Items & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* AI Insights */}
            <AIInsights />

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[28px] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-white/20">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="font-light text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <Tooltip key={action.label}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={action.action}
                        variant="outline"
                        className="rounded-[20px] h-20 sm:h-24 flex flex-col gap-2 hover-elevate active-elevate-2 p-3 sm:p-4 backdrop-blur-xl bg-white/5 border-white/10"
                        data-testid={`button-quick-${action.label.toLowerCase()}`}
                      >
                        <action.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", action.color)} />
                        <span className="text-xs sm:text-sm font-medium">{action.label}</span>
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

            {/* Market Pulse - News Feed */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[28px] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-white/20">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light text-lg sm:text-xl">Market Pulse</span>
                <Activity className="w-5 h-5 text-primary animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
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
                    className="p-4 bg-white/5 hover:bg-white/10 border-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.02] rounded-[20px]"
                    onClick={() => handleNewsClick(article)}
                    data-testid={`news-item-${article.id}`}
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white line-clamp-2 hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {article.source && (
                            <span className="text-xs text-white/60 font-light">
                              {article.source}
                            </span>
                          )}
                          <span className="text-xs text-white/60 font-light">
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
                            <button
                              key={ticker}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStock(ticker);
                                setStockDetailOpen(true);
                              }}
                              data-testid={`ticker-${ticker}`}
                            >
                              ${ticker}
                            </button>
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
          </div>
          
            {/* Tertiary Section - Full-width Cards */}
            <div className="space-y-8">
            {/* Active Positions */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[28px] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-white/20">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <span className="font-light">Active Positions</span>
                <Badge variant="outline" className="text-xs">
                  {holdings.length} Holdings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holdings.slice(0, 5).map((holding) => {
                  const quote = holdingQuotes[holding.symbol];
                  const currentPrice = quote?.price || parseFloat(holding.averageCost);
                  const avgCost = parseFloat(holding.averageCost);
                  const quantity = parseFloat(holding.quantity);
                  const totalValue = currentPrice * quantity;
                  const gain = totalValue - (avgCost * quantity);
                  const gainPercent = (gain / (avgCost * quantity)) * 100;

                  return (
                    <div key={holding.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-[16px] bg-white/5 hover-elevate active-elevate-2 cursor-pointer space-y-3 sm:space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {holding.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <TickerLink symbol={holding.symbol} />
                          <p className="text-xs text-muted-foreground">{quantity} shares @ ${currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right sm:hidden">
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
                      </div>
                      
                      <div className="hidden sm:block text-right">
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
                      
                      <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-full h-11 min-h-[44px] px-4 font-semibold hover:bg-primary/20 flex-1 sm:flex-none"
                          onClick={() => handleOpenTradeModal("buy", holding.symbol)}
                          data-testid={`button-buy-${holding.symbol}`}
                        >
                          Buy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="rounded-full h-11 min-h-[44px] px-4 font-semibold hover:bg-destructive/20 flex-1 sm:flex-none"
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

            {/* Watchlist */}
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[28px] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-white/20">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="font-light text-lg sm:text-xl">Watchlist</span>
                <Badge variant="outline" className="text-xs">
                  {watchlist.length} Watching
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {watchlist.slice(0, 5).map((item) => {
                  const quote = watchlistQuotes[item.symbol];
                  const price = quote?.price || 100;
                  const change = quote?.change || 0;
                  const changePercent = quote?.changePercent || 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-2.5 rounded-[16px] bg-white/5 hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => {
                        setSelectedStock(item.symbol);
                        setStockDetailOpen(true);
                      }}
                      data-testid={`watchlist-${item.symbol}`}
                    >
                      <div className="flex items-center gap-2">
                        <TickerLink symbol={item.symbol} />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">${price.toFixed(2)}</p>
                          <p className={cn(
                            "text-xs",
                            changePercent >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full h-7 px-2 hover:bg-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTradeModal("buy", item.symbol);
                          }}
                          data-testid={`button-buy-${item.symbol}`}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {watchlist.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No stocks in watchlist
                  </p>
                )}
              </div>
              
              {watchlist.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4 rounded-full"
                  size="sm"
                  onClick={() => {
                    // Navigate to watchlist page
                  }}
                  data-testid="button-view-all-watchlist"
                >
                  View Full Watchlist
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
      
      {/* Athena AI Chat - Primary Interface for AI-Native Experience */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-[320px] md:w-[340px] lg:w-[360px] bg-gradient-to-br from-black via-black/98 to-primary/5 backdrop-blur-xl border-l border-white/12 transform z-[200] shadow-2xl shadow-black/20",
        sidebarOpen 
          ? "translate-x-0 opacity-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" 
          : "translate-x-full opacity-95 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      )}>
        <div className={cn(
          "flex flex-col h-full transition-all duration-700",
          sidebarOpen ? "scale-100" : "scale-[0.98]"
        )}>
          {/* Refined Chat Header - Minimalist Luxury */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-white/[0.04] backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0">
                  <AthenaTraderAvatar size="small" showStatus={true} showName={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-light text-white">Athena AI</h3>
                </div>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full flex-shrink-0 hover:bg-white/10 transition-all"
                data-testid="button-close-sidebar"
                title="Close chat (Esc)"
              >
                <X className="w-4 h-4 text-white/60 hover:text-white" />
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
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Enhanced Chat Input - AI-First Design */}
          <div className="p-4 border-t border-white/20 bg-gradient-to-t from-black/50 to-transparent">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  ref={chatInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about stocks, trades, or markets..."
                  className="flex-1 min-h-[60px] max-h-[100px] resize-none rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 text-sm px-4 py-3 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  disabled={isLoading}
                  data-testid="textarea-chat-message"
                  autoFocus
                />
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    data-testid="button-send-chat"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={cn(
                      "rounded-full h-12 w-12 transition-all",
                      isRecording 
                        ? "bg-destructive animate-pulse shadow-lg shadow-destructive/25" 
                        : "bg-white/10 border-white/20 hover:bg-white/15"
                    )}
                    data-testid="button-voice-chat"
                  >
                    {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Powered by GPT-4</span>
                </div>
                <span className="text-white/30">•</span>
                <span className="text-xs text-white/50">Press Enter to send, Shift+Enter for new line</span>
              </div>
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
    </TooltipProvider>
  );
}