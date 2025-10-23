import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Target, Medal, Crown, Award, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import { ProtectedRoute } from "@/lib/auth";

interface Trader {
  id: string;
  username: string;
  avatar?: string;
  totalReturn: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  riskScore: number;
  achievementPoints: number;
  rank: number;
  previousRank: number;
  streak?: number;
}

function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [category, setCategory] = useState("overall");

  // Mock data for demonstration
  const mockTraders: Trader[] = [
    {
      id: "1",
      username: "AlphaTrader",
      totalReturn: 45.8,
      sharpeRatio: 2.3,
      winRate: 68,
      totalTrades: 234,
      riskScore: 8.5,
      achievementPoints: 15420,
      rank: 1,
      previousRank: 2,
      streak: 7
    },
    {
      id: "2",
      username: "MarketMaven",
      totalReturn: 38.2,
      sharpeRatio: 2.8,
      winRate: 72,
      totalTrades: 189,
      riskScore: 6.2,
      achievementPoints: 13850,
      rank: 2,
      previousRank: 1,
      streak: 5
    },
    {
      id: "3",
      username: "RiskReward",
      totalReturn: 32.5,
      sharpeRatio: 3.1,
      winRate: 65,
      totalTrades: 156,
      riskScore: 5.8,
      achievementPoints: 12300,
      rank: 3,
      previousRank: 4,
      streak: 3
    },
    {
      id: "4",
      username: "TechBull",
      totalReturn: 28.9,
      sharpeRatio: 1.9,
      winRate: 61,
      totalTrades: 298,
      riskScore: 7.2,
      achievementPoints: 11500,
      rank: 4,
      previousRank: 3,
    },
    {
      id: "5",
      username: "ValueHunter",
      totalReturn: 25.4,
      sharpeRatio: 2.5,
      winRate: 70,
      totalTrades: 134,
      riskScore: 4.5,
      achievementPoints: 10800,
      rank: 5,
      previousRank: 6,
    }
  ];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change > 0) {
      return (
        <span className="flex items-center text-green-500 text-xs font-medium">
          <ChevronUp className="w-3 h-3" />
          {change}
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-500 text-xs font-medium">
          <ChevronDown className="w-3 h-3" />
          {Math.abs(change)}
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-xs">
        <Minus className="w-3 h-3" />
      </span>
    );
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "overall": return "Overall Performance";
      case "risk-adjusted": return "Risk-Adjusted Returns";
      case "consistency": return "Most Consistent";
      case "volume": return "Most Active";
      case "achievements": return "Achievement Points";
      default: return "Overall Performance";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Global Leaderboards
          </h1>
          <p className="text-muted-foreground font-normal">
            Compete with traders worldwide and climb the ranks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Traders</p>
                  <p className="text-2xl font-bold text-foreground">12,847</p>
                </div>
                <Trophy className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Avg. Sharpe Ratio</p>
                  <p className="text-2xl font-bold text-foreground">1.85</p>
                </div>
                <Target className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Your Rank</p>
                  <p className="text-2xl font-bold text-foreground">#127</p>
                </div>
                <Award className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/20 border-primary/30 backdrop-blur-xl rounded-[28px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary/80 font-medium">Prize Pool</p>
                  <p className="text-2xl font-bold text-primary">$25,000</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Leaderboard */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Top Traders</CardTitle>
                <CardDescription className="font-normal">
                  Rankings based on {getCategoryLabel(category)}
                </CardDescription>
              </div>
              
              {/* Timeframe Selector */}
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="bg-white/5">
                  <TabsTrigger value="daily" className="font-medium">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="font-medium">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="font-medium">Monthly</TabsTrigger>
                  <TabsTrigger value="all-time" className="font-medium">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Category Tabs */}
            <div className="px-6 pb-4">
              <Tabs value={category} onValueChange={setCategory}>
                <TabsList className="bg-white/5 w-full">
                  <TabsTrigger value="overall" className="flex-1 font-medium">Overall</TabsTrigger>
                  <TabsTrigger value="risk-adjusted" className="flex-1 font-medium">Risk-Adjusted</TabsTrigger>
                  <TabsTrigger value="consistency" className="flex-1 font-medium">Consistency</TabsTrigger>
                  <TabsTrigger value="volume" className="flex-1 font-medium">Most Active</TabsTrigger>
                  <TabsTrigger value="achievements" className="flex-1 font-medium">Achievements</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Leaderboard Table */}
            <div className="border-t border-white/10">
              {mockTraders.map((trader, index) => (
                <div
                  key={trader.id}
                  className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${
                    index !== mockTraders.length - 1 ? "border-b border-white/10" : ""
                  }`}
                  data-testid={`leaderboard-row-${trader.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(trader.rank)}
                    </div>
                    
                    {/* Rank Change */}
                    <div className="w-8">
                      {getRankChange(trader.rank, trader.previousRank)}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                          {trader.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{trader.username}</p>
                          {trader.streak && trader.streak >= 5 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              🔥 {trader.streak} day streak
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-normal">
                          {trader.totalTrades} trades · {trader.winRate}% win rate
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">Return</p>
                      <p className={`font-bold ${trader.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trader.totalReturn >= 0 ? '+' : ''}{trader.totalReturn}%
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">Sharpe Ratio</p>
                      <p className="font-bold text-foreground">
                        {trader.sharpeRatio.toFixed(1)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">Risk Score</p>
                      <p className="font-bold text-foreground">
                        {trader.riskScore.toFixed(1)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">Points</p>
                      <p className="font-bold text-primary">
                        {trader.achievementPoints.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competition Banner */}
        <Card className="mt-8 bg-gradient-to-r from-primary/20 to-purple-600/20 border-primary/30 backdrop-blur-xl rounded-[28px]">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Monthly Trading Competition
                </h3>
                <p className="text-muted-foreground font-normal mb-4">
                  Compete for prizes with risk-adjusted performance metrics
                </p>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-medium">
                    15 days remaining
                  </Badge>
                  <span className="text-sm text-muted-foreground font-normal">
                    Entry: Free for all users
                  </span>
                </div>
              </div>
              <Trophy className="w-24 h-24 text-primary opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardPageContent() {
  return <LeaderboardPage />;
}

export default function LeaderboardPageWrapper() {
  return (
    <ProtectedRoute>
      <LeaderboardPageContent />
    </ProtectedRoute>
  );
}