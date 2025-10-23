import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Star,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Sparkles,
  Award,
  Clock,
  Activity,
  DollarSign,
  BarChart3,
  Calendar,
  Filter,
  ChevronRight,
  Zap,
  Crown
} from "lucide-react";

interface Trader {
  id: string;
  username: string;
  displayName: string;
  isAnonymous: boolean;
  rank: number;
  returns: number;
  winRate: number;
  followers: number;
  isFollowing: boolean;
  isVerified: boolean;
  strategy: string;
  riskLevel: "Low" | "Medium" | "High";
  recentTrades: Trade[];
  badges: string[];
}

interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  timestamp: Date;
  result?: number;
}

interface IdeaPost {
  id: string;
  author: string;
  authorId: string;
  title: string;
  description: string;
  strategy: string;
  expectedReturn: number;
  riskLevel: "Low" | "Medium" | "High";
  votes: number;
  userVote?: "up" | "down" | null;
  comments: number;
  isVerified: boolean;
  timestamp: Date;
  tags: string[];
}

const topTraders: Trader[] = [
  {
    id: "1",
    username: "EliteTrader",
    displayName: "Elite Trader",
    isAnonymous: false,
    rank: 1,
    returns: 145.2,
    winRate: 78,
    followers: 3420,
    isFollowing: false,
    isVerified: true,
    strategy: "Growth Momentum",
    riskLevel: "High",
    recentTrades: [
      { id: "t1", symbol: "NVDA", type: "buy", timestamp: new Date("2025-02-20"), result: 12.5 },
      { id: "t2", symbol: "AAPL", type: "sell", timestamp: new Date("2025-02-19"), result: 8.2 },
      { id: "t3", symbol: "TSLA", type: "buy", timestamp: new Date("2025-02-18"), result: -3.1 },
    ],
    badges: ["Top Performer", "Risk Master", "Verified"],
  },
  {
    id: "2",
    username: "anon_92847",
    displayName: "Anonymous Whale",
    isAnonymous: true,
    rank: 2,
    returns: 128.7,
    winRate: 72,
    followers: 2890,
    isFollowing: true,
    isVerified: false,
    strategy: "Value Investing",
    riskLevel: "Medium",
    recentTrades: [
      { id: "t4", symbol: "MSFT", type: "buy", timestamp: new Date("2025-02-20"), result: 6.3 },
      { id: "t5", symbol: "GOOGL", type: "buy", timestamp: new Date("2025-02-19"), result: 4.8 },
    ],
    badges: ["Consistent Winner", "Popular"],
  },
  {
    id: "3",
    username: "SafeHands",
    displayName: "Safe Hands",
    isAnonymous: false,
    rank: 3,
    returns: 98.5,
    winRate: 85,
    followers: 1567,
    isFollowing: false,
    isVerified: true,
    strategy: "Conservative",
    riskLevel: "Low",
    recentTrades: [
      { id: "t6", symbol: "SPY", type: "buy", timestamp: new Date("2025-02-20"), result: 2.1 },
      { id: "t7", symbol: "AGG", type: "buy", timestamp: new Date("2025-02-19"), result: 1.8 },
    ],
    badges: ["Risk Averse", "Steady Growth"],
  },
];

const investmentIdeas: IdeaPost[] = [
  {
    id: "i1",
    author: "TechBull",
    authorId: "u1",
    title: "AI Revolution Play: NVDA + AMD Combo",
    description: "With AI adoption accelerating, semiconductor leaders are positioned for massive growth. This strategy combines NVDA's AI dominance with AMD's competitive positioning.",
    strategy: "Long-term growth",
    expectedReturn: 45,
    riskLevel: "High",
    votes: 234,
    userVote: "up",
    comments: 45,
    isVerified: true,
    timestamp: new Date("2025-02-20"),
    tags: ["AI", "Tech", "Growth"],
  },
  {
    id: "i2",
    author: "ValueHunter",
    authorId: "u2",
    title: "Undervalued Energy Sector Opportunity",
    description: "Energy stocks trading at historical lows despite strong fundamentals. Focus on XOM and CVX for dividend income and capital appreciation.",
    strategy: "Value investing",
    expectedReturn: 25,
    riskLevel: "Medium",
    votes: 156,
    userVote: null,
    comments: 28,
    isVerified: false,
    timestamp: new Date("2025-02-19"),
    tags: ["Energy", "Value", "Dividends"],
  },
  {
    id: "i3",
    author: "SafetyFirst",
    authorId: "u3",
    title: "Defensive Portfolio for Market Uncertainty",
    description: "Build a recession-proof portfolio with consumer staples and utilities. Focus on JNJ, PG, and NEE for stability.",
    strategy: "Defensive",
    expectedReturn: 12,
    riskLevel: "Low",
    votes: 89,
    userVote: "down",
    comments: 12,
    isVerified: true,
    timestamp: new Date("2025-02-18"),
    tags: ["Defensive", "Stability", "Income"],
  },
];

export default function SocialTradingHub() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeframe, setTimeframe] = useState("week");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [followedTraders, setFollowedTraders] = useState<string[]>(["2"]);
  const [votedIdeas, setVotedIdeas] = useState<Record<string, "up" | "down">>({
    i1: "up",
    i3: "down",
  });

  const handleFollowTrader = (traderId: string) => {
    setFollowedTraders(prev =>
      prev.includes(traderId)
        ? prev.filter(id => id !== traderId)
        : [...prev, traderId]
    );
  };

  const handleVoteIdea = (ideaId: string, vote: "up" | "down") => {
    setVotedIdeas(prev => ({
      ...prev,
      [ideaId]: prev[ideaId] === vote ? undefined : vote,
    }));
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-success";
      case "Medium": return "text-warning";
      case "High": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Traders</p>
                <p className="text-3xl font-extralight">12,847</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Returns</p>
                <p className="text-3xl font-extralight text-success">+42.3%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ideas Shared</p>
                <p className="text-3xl font-extralight">3,256</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Following</p>
                <p className="text-3xl font-extralight">{followedTraders.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-[500px] mx-auto h-auto p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
          <TabsTrigger value="leaderboard" className="rounded-full py-3" data-testid="tab-leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="following" className="rounded-full py-3" data-testid="tab-following">
            <Users className="w-4 h-4 mr-2" />
            Following
          </TabsTrigger>
          <TabsTrigger value="ideas" className="rounded-full py-3" data-testid="tab-ideas">
            <Sparkles className="w-4 h-4 mr-2" />
            Ideas Feed
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          {/* Filters */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-40 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                  <SelectTrigger className="w-48 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Strategies</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="conservative">Conservative</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" className="rounded-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Show Names
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Table */}
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="font-light">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-4 rounded-[16px] bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-12">
                          {getRankIcon(trader.rank)}
                        </div>
                        
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {trader.isAnonymous ? "?" : trader.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {trader.isAnonymous ? "Anonymous" : trader.displayName}
                            </p>
                            {trader.isVerified && (
                              <Shield className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{trader.strategy}</span>
                            <span className={getRiskColor(trader.riskLevel)}>
                              {trader.riskLevel} Risk
                            </span>
                            <span>{trader.followers} followers</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-extralight text-success">
                            +{trader.returns}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {trader.winRate}% Win Rate
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleFollowTrader(trader.id)}
                            variant={followedTraders.includes(trader.id) ? "default" : "outline"}
                            className="rounded-full"
                            data-testid={`follow-${trader.id}`}
                          >
                            {followedTraders.includes(trader.id) ? (
                              <>
                                <Users className="w-4 h-4 mr-2" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            data-testid={`copy-${trader.id}`}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-muted-foreground mb-2">Recent Trades</p>
                      <div className="flex gap-2">
                        {trader.recentTrades.map((trade) => (
                          <Badge
                            key={trade.id}
                            variant={trade.type === "buy" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {trade.type === "buy" ? "↑" : "↓"} {trade.symbol}
                            {trade.result && (
                              <span className={cn(
                                "ml-1",
                                trade.result > 0 ? "text-success" : "text-destructive"
                              )}>
                                {trade.result > 0 ? "+" : ""}{trade.result}%
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4 rounded-full" variant="outline">
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Traders
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="font-light">Traders You Follow</CardTitle>
            </CardHeader>
            <CardContent>
              {followedTraders.length > 0 ? (
                <div className="space-y-4">
                  {topTraders
                    .filter(trader => followedTraders.includes(trader.id))
                    .map((trader) => (
                      <div
                        key={trader.id}
                        className="p-4 rounded-[16px] bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {trader.isAnonymous ? "?" : trader.displayName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{trader.displayName}</p>
                              <p className="text-sm text-muted-foreground">
                                Last trade: {trader.recentTrades[0]?.symbol}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-success">+{trader.returns}%</p>
                              <p className="text-xs text-muted-foreground">This week</p>
                            </div>
                            <Button
                              onClick={() => handleFollowTrader(trader.id)}
                              variant="ghost"
                              className="rounded-full"
                            >
                              Unfollow
                            </Button>
                          </div>
                        </div>
                        
                        {/* Activity Timeline */}
                        <div className="mt-4 space-y-2">
                          {trader.recentTrades.slice(0, 2).map((trade) => (
                            <div key={trade.id} className="flex items-center gap-2 text-sm">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {trade.timestamp.toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {trade.type === "buy" ? "Bought" : "Sold"} {trade.symbol}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You're not following any traders yet</p>
                  <Button
                    onClick={() => setActiveTab("leaderboard")}
                    className="rounded-full"
                  >
                    Browse Leaderboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ideas Feed Tab */}
        <TabsContent value="ideas" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-light">Investment Ideas</span>
                <Button className="rounded-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Idea
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investmentIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-4 rounded-[16px] bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          {idea.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {idea.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">by {idea.author}</span>
                          <Badge variant="outline" className={getRiskColor(idea.riskLevel)}>
                            {idea.riskLevel} Risk
                          </Badge>
                          <span className="text-success">+{idea.expectedReturn}% expected</span>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {idea.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleVoteIdea(idea.id, "up")}
                          className={cn(
                            "flex items-center gap-1 transition-colors",
                            votedIdeas[idea.id] === "up"
                              ? "text-success"
                              : "text-muted-foreground hover:text-success"
                          )}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{idea.votes}</span>
                        </button>
                        
                        <button
                          onClick={() => handleVoteIdea(idea.id, "down")}
                          className={cn(
                            "flex items-center gap-1 transition-colors",
                            votedIdeas[idea.id] === "down"
                              ? "text-destructive"
                              : "text-muted-foreground hover:text-destructive"
                          )}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>

                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{idea.comments}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Strategy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4 rounded-full" variant="outline">
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Ideas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Medal = Award; // Use Award icon as Medal