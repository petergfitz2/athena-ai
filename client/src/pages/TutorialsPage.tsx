import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import { BookOpen, TrendingUp, Shield, Zap, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tutorials = [
  {
    category: "Getting Started",
    icon: Zap,
    lessons: [
      {
        title: "Your First Trade",
        duration: "5 min",
        description: "Learn how to execute your first trade using Athena's interface",
        topics: ["Market orders", "Limit orders", "Order execution"],
      },
      {
        title: "Understanding Your Portfolio",
        duration: "8 min",
        description: "Navigate your portfolio dashboard and understand key metrics",
        topics: ["Portfolio value", "Gain/loss", "Asset allocation"],
      },
      {
        title: "Using Voice Commands",
        duration: "4 min",
        description: "Control your portfolio using natural language with Amanda",
        topics: ["Voice trading", "Portfolio queries", "Market insights"],
      },
    ],
  },
  {
    category: "Investment Strategies",
    icon: TrendingUp,
    lessons: [
      {
        title: "Diversification Fundamentals",
        duration: "12 min",
        description: "Build a balanced portfolio across sectors and asset classes",
        topics: ["Asset allocation", "Sector diversification", "Risk management"],
      },
      {
        title: "Dollar-Cost Averaging",
        duration: "10 min",
        description: "Invest consistently over time to reduce market timing risk",
        topics: ["Regular investing", "Market volatility", "Long-term growth"],
      },
      {
        title: "Reading Market Indicators",
        duration: "15 min",
        description: "Understand technical and fundamental indicators",
        topics: ["RSI", "Moving averages", "P/E ratios"],
      },
    ],
  },
  {
    category: "Risk Management",
    icon: Shield,
    lessons: [
      {
        title: "Stop-Loss Orders",
        duration: "7 min",
        description: "Protect your investments with automated sell orders",
        topics: ["Stop orders", "Stop-limit orders", "Risk protection"],
      },
      {
        title: "Portfolio Hedging",
        duration: "18 min",
        description: "Use hedging strategies to protect against market downturns",
        topics: ["Options", "Inverse ETFs", "Correlation analysis"],
      },
      {
        title: "Position Sizing",
        duration: "10 min",
        description: "Determine optimal investment amounts for each position",
        topics: ["Risk percentage", "Portfolio allocation", "Capital preservation"],
      },
    ],
  },
  {
    category: "Advanced Analytics",
    icon: BookOpen,
    lessons: [
      {
        title: "Correlation Analysis",
        duration: "14 min",
        description: "Understand how your holdings move in relation to each other",
        topics: ["Correlation matrix", "Portfolio optimization", "Diversification metrics"],
      },
      {
        title: "Factor Exposure",
        duration: "16 min",
        description: "Analyze your portfolio's exposure to market factors",
        topics: ["Beta", "Factor models", "Systematic risk"],
      },
      {
        title: "Stress Testing",
        duration: "12 min",
        description: "Model how your portfolio performs under extreme conditions",
        topics: ["Scenario analysis", "Market crashes", "Risk assessment"],
      },
    ],
  },
];

function TutorialsContent() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4">
            <BackButton to="/help" label="Back to Help" />
          </div>
          <h1 className="text-6xl font-extralight text-foreground mb-4">
            Learn to Invest
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl">
            Master investing with our comprehensive tutorials. From basics to advanced strategies,
            build the knowledge you need to succeed.
          </p>
        </div>

        {/* Quick Start Guide */}
        <GlassCard className="mb-12 p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-light text-foreground mb-2">
                New to Athena?
              </h2>
              <p className="text-muted-foreground mb-4">
                Start with our 15-minute quick start course covering essential platform features
                and your first trade.
              </p>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-quick-start"
              >
                Start Quick Course
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Tutorials by Category */}
        <div className="grid gap-8">
          {tutorials.map((category) => {
            const Icon = category.icon;
            return (
              <GlassCard key={category.category} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-3xl font-light text-foreground">
                    {category.category}
                  </h2>
                </div>

                <div className="grid gap-4">
                  {category.lessons.map((lesson, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedLesson(`${category.category}-${idx}`)}
                      className="group p-6 rounded-[20px] bg-white/5 border border-white/10 hover-elevate active-elevate-2 text-left transition-all"
                      data-testid={`lesson-${category.category.toLowerCase().replace(/\s+/g, '-')}-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-light text-foreground group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-white/5">
                              {lesson.duration}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {lesson.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.topics.map((topic, topicIdx) => (
                              <span
                                key={topicIdx}
                                className="text-xs text-primary/80 px-3 py-1 rounded-full bg-primary/10"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Learning Path */}
        <GlassCard className="mt-12 p-8">
          <h2 className="text-3xl font-light text-foreground mb-6">
            Recommended Learning Path
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-[20px] bg-primary/5 border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="text-foreground font-medium">Beginner</p>
                <p className="text-sm text-muted-foreground">Getting Started → Your First Trade → Portfolio Basics</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 text-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="text-foreground font-medium">Intermediate</p>
                <p className="text-sm text-muted-foreground">Investment Strategies → Risk Management → Market Indicators</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 text-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="text-foreground font-medium">Advanced</p>
                <p className="text-sm text-muted-foreground">Advanced Analytics → Portfolio Optimization → Factor Analysis</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function TutorialsPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/" />;
  }

  return <TutorialsContent />;
}
