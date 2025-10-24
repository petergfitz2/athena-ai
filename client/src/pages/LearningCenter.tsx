import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProtectedRoute } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Zap, 
  Award, 
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  Star,
  Brain,
  Target
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  completed: number;
  locked: boolean;
  icon: any;
  xpReward: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  icon: any;
  xpReward: number;
}

function LearningCenterContent() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userLevel] = useState(3);
  const [totalXP] = useState(2450);
  const [nextLevelXP] = useState(3000);

  const courses: Course[] = [
    {
      id: "investing-101",
      title: "Investing 101: Start Your Journey",
      description: "Learn the fundamentals of stock market investing, from opening a brokerage account to making your first trade",
      difficulty: "beginner",
      duration: "2 hours",
      lessons: 12,
      completed: 12,
      locked: false,
      icon: BookOpen,
      xpReward: 100
    },
    {
      id: "risk-management",
      title: "Risk Management Mastery",
      description: "Understand how to protect your portfolio with proper position sizing, stop losses, and diversification",
      difficulty: "intermediate",
      duration: "3 hours",
      lessons: 15,
      completed: 8,
      locked: false,
      icon: Shield,
      xpReward: 150
    },
    {
      id: "technical-analysis",
      title: "Technical Analysis Deep Dive",
      description: "Master chart patterns, indicators, and market psychology to time your trades better",
      difficulty: "advanced",
      duration: "5 hours",
      lessons: 20,
      completed: 3,
      locked: false,
      icon: TrendingUp,
      xpReward: 250
    },
    {
      id: "options-strategies",
      title: "Options Trading Strategies",
      description: "Learn how to use options for income generation, hedging, and leveraged plays",
      difficulty: "advanced",
      duration: "4 hours",
      lessons: 18,
      completed: 0,
      locked: true,
      icon: Zap,
      xpReward: 300
    },
    {
      id: "fundamental-analysis",
      title: "Fundamental Analysis Bootcamp",
      description: "Analyze company financials, read earnings reports, and calculate intrinsic value",
      difficulty: "intermediate",
      duration: "3.5 hours",
      lessons: 16,
      completed: 5,
      locked: false,
      icon: Brain,
      xpReward: 200
    },
    {
      id: "portfolio-construction",
      title: "Building a Winning Portfolio",
      description: "Design a balanced portfolio aligned with your goals, risk tolerance, and time horizon",
      difficulty: "intermediate",
      duration: "2.5 hours",
      lessons: 10,
      completed: 0,
      locked: false,
      icon: Target,
      xpReward: 180
    }
  ];

  const achievements: Achievement[] = [
    {
      id: "first-course",
      title: "Knowledge Seeker",
      description: "Complete your first course",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      icon: Award,
      xpReward: 50
    },
    {
      id: "streak-7",
      title: "Weekly Warrior",
      description: "Learn for 7 days in a row",
      progress: 5,
      maxProgress: 7,
      unlocked: false,
      icon: Zap,
      xpReward: 100
    },
    {
      id: "complete-5",
      title: "Scholar",
      description: "Complete 5 courses",
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      icon: BookOpen,
      xpReward: 200
    },
    {
      id: "perfect-quiz",
      title: "Quiz Master",
      description: "Score 100% on 10 quizzes",
      progress: 6,
      maxProgress: 10,
      unlocked: false,
      icon: Star,
      xpReward: 150
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredCourses = courses.filter(course => {
    if (selectedCategory === "all") return true;
    return course.difficulty === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <NavigationBreadcrumbs />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-extralight mb-2">Learning Center</h1>
          <p className="text-muted-foreground text-lg">
            Level up your investing knowledge and earn XP
          </p>
        </div>

        {/* User Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20 rounded-[28px] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-light">Your Progress</CardTitle>
                <CardDescription className="mt-2">
                  Level {userLevel} Investor • {totalXP} / {nextLevelXP} XP
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-light text-primary">{courses.filter(c => c.completed === c.lessons).length}</p>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light text-primary">
                    {achievements.filter(a => a.unlocked).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(totalXP / nextLevelXP) * 100} 
              className="h-3 bg-white/10"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {nextLevelXP - totalXP} XP to Level {userLevel + 1}
            </p>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            onClick={() => setSelectedCategory("all")}
            className="rounded-full"
            data-testid="filter-all"
          >
            All Courses
          </Button>
          <Button
            variant={selectedCategory === "beginner" ? "default" : "ghost"}
            onClick={() => setSelectedCategory("beginner")}
            className="rounded-full"
            data-testid="filter-beginner"
          >
            Beginner
          </Button>
          <Button
            variant={selectedCategory === "intermediate" ? "default" : "ghost"}
            onClick={() => setSelectedCategory("intermediate")}
            className="rounded-full"
            data-testid="filter-intermediate"
          >
            Intermediate
          </Button>
          <Button
            variant={selectedCategory === "advanced" ? "default" : "ghost"}
            onClick={() => setSelectedCategory("advanced")}
            className="rounded-full"
            data-testid="filter-advanced"
          >
            Advanced
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-light mb-4">Available Courses</h2>
            <div className="grid gap-4">
              {filteredCourses.map((course) => {
                const Icon = course.icon;
                const progressPercent = (course.completed / course.lessons) * 100;
                
                return (
                  <Card
                    key={course.id}
                    className={`bg-card/50 border-white/10 rounded-[28px] ${
                      course.locked ? 'opacity-60' : 'hover-elevate cursor-pointer'
                    }`}
                    data-testid={`course-${course.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${
                            course.locked ? 'bg-gray-500/10' : 'bg-primary/10'
                          }`}>
                            {course.locked ? (
                              <Lock className="w-6 h-6 text-gray-500" />
                            ) : (
                              <Icon className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-light flex items-center gap-2">
                              {course.title}
                              {course.completed === course.lessons && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge 
                                variant="outline" 
                                className={`${getDifficultyColor(course.difficulty)} border-0`}
                              >
                                {course.difficulty}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {course.duration}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {course.lessons} lessons
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-primary">
                          +{course.xpReward} XP
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {course.description}
                      </p>
                      {!course.locked && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress: {course.completed}/{course.lessons} lessons
                            </span>
                            <span className="text-primary">
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <Button 
                            className="w-full rounded-full mt-3"
                            variant={course.completed === 0 ? "default" : "outline"}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {course.completed === 0 ? "Start Course" : 
                             course.completed === course.lessons ? "Review Course" : 
                             "Continue Learning"}
                          </Button>
                        </div>
                      )}
                      {course.locked && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
                          <p className="text-yellow-500">
                            Complete "Technical Analysis Deep Dive" to unlock
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div>
            <h2 className="text-2xl font-light mb-4">Achievements</h2>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                  
                  return (
                    <Card
                      key={achievement.id}
                      className={`bg-card/50 border-white/10 rounded-[20px] ${
                        achievement.unlocked ? 'border-primary/30' : ''
                      }`}
                      data-testid={`achievement-${achievement.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.unlocked ? 'bg-primary/20' : 'bg-white/5'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              achievement.unlocked ? 'text-primary' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {achievement.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{achievement.xpReward} XP
                            </p>
                          </div>
                          {achievement.unlocked && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="space-y-1">
                          <Progress 
                            value={progressPercent} 
                            className="h-1.5"
                          />
                          <p className="text-xs text-right text-muted-foreground">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningCenter() {
  return (
    <ProtectedRoute>
      <LearningCenterContent />
    </ProtectedRoute>
  );
}