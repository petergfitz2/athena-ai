import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import AchievementBadge from "./AchievementBadge";
import type { AchievementTier, AchievementStatus } from "./AchievementBadge";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Star,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  Award,
  Medal,
  Crown,
  ChevronRight,
  Gift,
  Lock,
  Zap,
  Shield,
  Brain,
  Mic
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "learning" | "trading" | "engagement" | "wealth";
  tier: AchievementTier;
  status: AchievementStatus;
  progress?: number;
  maxProgress?: number;
  icon?: any;
  earnedDate?: Date;
  reward?: string;
}

const achievements: Achievement[] = [
  // Learning Milestones
  {
    id: "first-trade",
    name: "First Trade",
    description: "Execute your first trade on the platform",
    category: "learning",
    tier: "bronze",
    status: "unlocked",
    icon: Target,
    earnedDate: new Date("2025-01-15"),
    reward: "Unlock trade analytics"
  },
  {
    id: "tutorial-complete",
    name: "Tutorial Master",
    description: "Complete all platform tutorials",
    category: "learning",
    tier: "silver",
    status: "in-progress",
    progress: 7,
    maxProgress: 10,
    icon: BookOpen,
    reward: "Advanced tutorials access"
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Read 10 market analysis articles",
    category: "learning",
    tier: "bronze",
    status: "in-progress",
    progress: 6,
    maxProgress: 10,
    icon: Brain,
    reward: "Premium articles"
  },
  {
    id: "strategy-student",
    name: "Strategy Student",
    description: "Complete 5 strategy simulations",
    category: "learning",
    tier: "gold",
    status: "locked",
    progress: 0,
    maxProgress: 5,
    icon: Zap,
    reward: "Custom strategy builder"
  },

  // Trading Expertise
  {
    id: "profitable-10",
    name: "Profit Master",
    description: "Complete 10 profitable trades",
    category: "trading",
    tier: "silver",
    status: "in-progress",
    progress: 8,
    maxProgress: 10,
    icon: TrendingUp,
    reward: "Pro trader badge"
  },
  {
    id: "diversified",
    name: "Diversified Portfolio",
    description: "Hold positions in 5+ different sectors",
    category: "trading",
    tier: "gold",
    status: "unlocked",
    icon: Shield,
    earnedDate: new Date("2025-02-01"),
    reward: "Sector analysis tools"
  },
  {
    id: "risk-master",
    name: "Risk Master",
    description: "Maintain portfolio risk score below 5 for 30 days",
    category: "trading",
    tier: "platinum",
    status: "locked",
    icon: Shield,
    reward: "Risk management suite"
  },
  {
    id: "quick-trader",
    name: "Quick Trader",
    description: "Execute 50 trades in total",
    category: "trading",
    tier: "bronze",
    status: "in-progress",
    progress: 32,
    maxProgress: 50,
    icon: Zap,
    reward: "Fast trade execution"
  },

  // Engagement
  {
    id: "streak-7",
    name: "7-Day Streak",
    description: "Log in for 7 consecutive days",
    category: "engagement",
    tier: "bronze",
    status: "unlocked",
    icon: Calendar,
    earnedDate: new Date("2025-02-10"),
    reward: "Streak bonus insights"
  },
  {
    id: "voice-trader",
    name: "Voice Trader",
    description: "Execute 10 trades using voice commands",
    category: "engagement",
    tier: "silver",
    status: "in-progress",
    progress: 3,
    maxProgress: 10,
    icon: Mic,
    reward: "Advanced voice features"
  },
  {
    id: "social-learner",
    name: "Social Learner",
    description: "Follow 5 successful traders",
    category: "engagement",
    tier: "bronze",
    status: "locked",
    icon: Users,
    reward: "Social trading access"
  },
  {
    id: "community-contributor",
    name: "Community Star",
    description: "Share 10 successful strategies",
    category: "engagement",
    tier: "gold",
    status: "locked",
    icon: Star,
    reward: "Community leader badge"
  },

  // Wealth Builder
  {
    id: "gains-1k",
    name: "$1K Gains",
    description: "Achieve $1,000 in total gains",
    category: "wealth",
    tier: "bronze",
    status: "unlocked",
    icon: DollarSign,
    earnedDate: new Date("2025-01-20"),
    reward: "Wealth tracker tool"
  },
  {
    id: "portfolio-10k",
    name: "$10K Portfolio",
    description: "Reach $10,000 portfolio value",
    category: "wealth",
    tier: "silver",
    status: "in-progress",
    progress: 7500,
    maxProgress: 10000,
    icon: DollarSign,
    reward: "Premium portfolio analytics"
  },
  {
    id: "beat-market",
    name: "Market Beater",
    description: "Outperform S&P 500 for 3 months",
    category: "wealth",
    tier: "gold",
    status: "locked",
    icon: Trophy,
    reward: "Elite trader status"
  },
  {
    id: "millionaire",
    name: "Millionaire Club",
    description: "Reach $1M portfolio value",
    category: "wealth",
    tier: "platinum",
    status: "locked",
    icon: Crown,
    reward: "Exclusive millionaire perks"
  },
];

export default function AchievementSystem() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const categories = [
    { id: "all", label: "All", icon: Star },
    { id: "learning", label: "Learning", icon: BookOpen },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "engagement", label: "Engagement", icon: Users },
    { id: "wealth", label: "Wealth", icon: DollarSign },
  ];

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== "all" && achievement.category !== selectedCategory) {
      return false;
    }
    if (showUnlockedOnly && achievement.status !== "unlocked") {
      return false;
    }
    return true;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.status === "unlocked").length,
    inProgress: achievements.filter(a => a.status === "in-progress").length,
    locked: achievements.filter(a => a.status === "locked").length,
  };

  const overallProgress = (stats.unlocked / stats.total) * 100;

  // Calculate tier distribution
  const tierStats = {
    bronze: achievements.filter(a => a.tier === "bronze" && a.status === "unlocked").length,
    silver: achievements.filter(a => a.tier === "silver" && a.status === "unlocked").length,
    gold: achievements.filter(a => a.tier === "gold" && a.status === "unlocked").length,
    platinum: achievements.filter(a => a.tier === "platinum" && a.status === "unlocked").length,
  };

  const nextAchievements = achievements
    .filter(a => a.status === "in-progress")
    .sort((a, b) => {
      const progressA = (a.progress || 0) / (a.maxProgress || 1);
      const progressB = (b.progress || 0) / (b.maxProgress || 1);
      return progressB - progressA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Progress</p>
                <p className="text-3xl font-extralight text-primary">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unlocked</p>
                <p className="text-3xl font-extralight">{stats.unlocked}</p>
              </div>
              <Award className="w-8 h-8 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievement Points</p>
                <p className="text-3xl font-extralight">2,450</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Top 15% of users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-extralight">12 days</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Best: 28 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
        <CardHeader>
          <CardTitle className="font-light">Tier Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center mb-2">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Bronze</p>
              <p className="text-xl font-light">{tierStats.bronze}/4</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Silver</p>
              <p className="text-xl font-light">{tierStats.silver}/4</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Gold</p>
              <p className="text-xl font-light">{tierStats.gold}/4</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Platinum</p>
              <p className="text-xl font-light">{tierStats.platinum}/4</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Achievements */}
      <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="font-light">Almost There!</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextAchievements.map((achievement) => {
              const progressPercentage = achievement.maxProgress 
                ? (achievement.progress! / achievement.maxProgress) * 100 
                : 0;
              const Icon = achievement.icon || Star;
              
              return (
                <div key={achievement.id} className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">{achievement.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {achievement.progress}/{achievement.maxProgress}
                        </Badge>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="rounded-full"
                data-testid={`filter-${category.id}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
        <Button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          variant="outline"
          className="rounded-full"
          data-testid="toggle-unlocked"
        >
          {showUnlockedOnly ? "Show All" : "Show Unlocked"}
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            {...achievement}
            onClick={() => setSelectedAchievement(achievement)}
          />
        ))}
      </div>

      {/* Rewards Section */}
      <Card className="bg-gradient-to-br from-primary/20 to-purple-600/20 border-white/10 rounded-[20px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="font-light">Available Rewards</span>
            <Gift className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements
              .filter(a => a.status === "unlocked" && a.reward)
              .slice(0, 4)
              .map((achievement) => (
                <div key={achievement.id} className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{achievement.reward}</span>
                    <Badge variant="outline" className="text-xs">
                      Unlocked
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From: {achievement.name}
                  </p>
                </div>
              ))}
          </div>
          <Button className="w-full mt-4 rounded-full" variant="default">
            <ChevronRight className="w-4 h-4 mr-2" />
            View All Rewards
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}