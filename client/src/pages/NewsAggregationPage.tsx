import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, Newspaper, AlertCircle, Clock, Filter,
  Search, Bell, Bookmark, Share2, ExternalLink, BarChart3,
  Globe, Building2, DollarSign, Briefcase, Zap, MessageSquare,
  ChevronRight, RefreshCw, Volume2, Play, Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TickerLink } from "@/components/TickerLink";

interface NewsItem {
  id: string;
  headline: string;
  summary?: string;
  source: string;
  author?: string;
  timestamp: Date;
  category: string;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  tickers: string[];
  imageUrl?: string;
  url?: string;
  readTime?: number;
}

export default function NewsAggregationPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");

  // Mock news data
  const newsCategories = [
    { id: "all", label: "All News", icon: Globe },
    { id: "markets", label: "Markets", icon: BarChart3 },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "deals", label: "M&A", icon: Briefcase },
    { id: "economy", label: "Economy", icon: Building2 },
    { id: "crypto", label: "Crypto", icon: Zap },
    { id: "analysis", label: "Analysis", icon: MessageSquare },
  ];

  // Fetch news data
  const { data: newsData, refetch, isLoading } = useQuery({
    queryKey: ['/api/news', selectedCategory, sortBy, selectedTimeRange],
    queryFn: async () => {
      // Mock comprehensive news data
      const mockNews: NewsItem[] = [
        {
          id: "1",
          headline: "Fed Signals Potential Rate Cut as Inflation Shows Signs of Cooling",
          summary: "Federal Reserve officials indicated openness to cutting interest rates in upcoming meetings as recent data shows inflation moderating toward the central bank's 2% target.",
          source: "Reuters",
          author: "Jane Smith",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          category: "economy",
          tags: ["Fed", "Interest Rates", "Inflation", "Monetary Policy"],
          sentiment: "positive",
          impact: "high",
          tickers: ["SPY", "QQQ", "DIA"],
          readTime: 5,
        },
        {
          id: "2",
          headline: "Apple Reports Record Q4 Revenue, Beats Analyst Expectations",
          summary: "Tech giant Apple posted quarterly revenue of $95 billion, surpassing Wall Street estimates driven by strong iPhone sales and services growth.",
          source: "Bloomberg",
          author: "John Doe",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          category: "earnings",
          tags: ["Earnings", "Technology", "iPhone", "Services"],
          sentiment: "positive",
          impact: "high",
          tickers: ["AAPL"],
          readTime: 3,
        },
        {
          id: "3",
          headline: "Microsoft Announces $75B Acquisition of Gaming Studio",
          summary: "Microsoft Corporation revealed plans to acquire a major gaming studio for $75 billion in cash, marking one of the largest tech acquisitions in history.",
          source: "WSJ",
          author: "Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          category: "deals",
          tags: ["M&A", "Gaming", "Technology"],
          sentiment: "neutral",
          impact: "high",
          tickers: ["MSFT"],
          readTime: 4,
        },
        {
          id: "4",
          headline: "Oil Prices Surge 5% on OPEC+ Production Cut Extension",
          summary: "Crude oil futures jumped following OPEC+ decision to extend production cuts through Q2, raising concerns about global energy costs.",
          source: "CNBC",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          category: "markets",
          tags: ["Energy", "Oil", "OPEC", "Commodities"],
          sentiment: "negative",
          impact: "medium",
          tickers: ["XOM", "CVX", "USO"],
          readTime: 3,
        },
        {
          id: "5",
          headline: "Tesla Unveils New Battery Technology, Stock Rises 8%",
          summary: "Electric vehicle maker Tesla announced breakthrough in battery technology that could reduce costs by 30% and increase range by 20%.",
          source: "TechCrunch",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          category: "markets",
          tags: ["EV", "Technology", "Innovation"],
          sentiment: "positive",
          impact: "medium",
          tickers: ["TSLA"],
          readTime: 4,
        },
        {
          id: "6",
          headline: "Bitcoin Breaks Through $45,000 Resistance Level",
          summary: "Leading cryptocurrency Bitcoin surged past key technical level as institutional interest continues to grow amid ETF approval speculation.",
          source: "CoinDesk",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          category: "crypto",
          tags: ["Bitcoin", "Cryptocurrency", "ETF"],
          sentiment: "positive",
          impact: "medium",
          tickers: ["COIN", "MSTR"],
          readTime: 2,
        },
      ];
      
      return mockNews.filter(news => 
        selectedCategory === "all" || news.category === selectedCategory
      );
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Market sentiment calculation
  const marketSentiment = newsData ? {
    positive: newsData.filter(n => n.sentiment === 'positive').length,
    negative: newsData.filter(n => n.sentiment === 'negative').length,
    neutral: newsData.filter(n => n.sentiment === 'neutral').length,
  } : { positive: 0, negative: 0, neutral: 0 };

  const totalSentiment = marketSentiment.positive + marketSentiment.negative + marketSentiment.neutral;

  // Breaking news ticker
  const breakingNews = newsData?.filter(n => n.impact === 'high').slice(0, 3) || [];

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600/20 border-y border-red-600/50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="animate-pulse">
                BREAKING
              </Badge>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-6 animate-scroll">
                  {breakingNews.map(news => (
                    <span key={news.id} className="text-sm whitespace-nowrap">
                      • {news.headline}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Market News & Analysis</h1>
              <p className="text-muted-foreground">Real-time financial news and market intelligence</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-9 w-9"
              >
                {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="h-9 w-9"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Market Sentiment Bar */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Market Sentiment (Last 24h)</span>
                <Badge variant="outline" className="text-xs">
                  {newsData?.length || 0} Articles
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-8 rounded-full overflow-hidden mb-3">
                {totalSentiment > 0 && (
                  <>
                    <div 
                      className="bg-green-600 flex items-center justify-center text-xs font-medium"
                      style={{ width: `${(marketSentiment.positive / totalSentiment) * 100}%` }}
                    >
                      {marketSentiment.positive > 0 && marketSentiment.positive}
                    </div>
                    <div 
                      className="bg-yellow-600 flex items-center justify-center text-xs font-medium"
                      style={{ width: `${(marketSentiment.neutral / totalSentiment) * 100}%` }}
                    >
                      {marketSentiment.neutral > 0 && marketSentiment.neutral}
                    </div>
                    <div 
                      className="bg-red-600 flex items-center justify-center text-xs font-medium"
                      style={{ width: `${(marketSentiment.negative / totalSentiment) * 100}%` }}
                    >
                      {marketSentiment.negative > 0 && marketSentiment.negative}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  Positive ({((marketSentiment.positive / totalSentiment) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-600" />
                  Neutral ({((marketSentiment.neutral / totalSentiment) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  Negative ({((marketSentiment.negative / totalSentiment) * 100).toFixed(0)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search news, companies, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Categories Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {newsCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 hover-elevate text-left transition-colors",
                      selectedCategory === category.id && "bg-primary/20 border-l-2 border-primary"
                    )}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm">{category.label}</span>
                    {selectedCategory === category.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Top Mentioned Tickers */}
            <Card className="bg-white/5 border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-base">Trending Tickers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["AAPL", "MSFT", "TSLA", "SPY", "QQQ"].map((ticker, i) => (
                    <div key={ticker} className="flex items-center justify-between">
                      <TickerLink symbol={ticker} />
                      <Badge variant="outline" className="text-xs">
                        {5 - i} mentions
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* News Feed */}
          <div className="col-span-12 lg:col-span-9">
            <ScrollArea className="h-[800px]">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : newsData?.map(news => (
                  <Card key={news.id} className="bg-white/5 border-white/10 hover-elevate cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {news.imageUrl && (
                          <div className="w-32 h-24 rounded-lg bg-white/10 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold leading-tight">
                              {news.headline}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant={news.sentiment === 'positive' ? 'default' : news.sentiment === 'negative' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {news.sentiment}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {news.impact}
                              </Badge>
                            </div>
                          </div>
                          
                          {news.summary && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {news.summary}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{news.source}</span>
                            {news.author && (
                              <>
                                <span>•</span>
                                <span>{news.author}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(news.timestamp)}
                            </span>
                            {news.readTime && (
                              <>
                                <span>•</span>
                                <span>{news.readTime} min read</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {news.tickers.map(ticker => (
                                <TickerLink key={ticker} symbol={ticker} />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}