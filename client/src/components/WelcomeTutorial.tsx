import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  MessageCircle, 
  DollarSign, 
  TrendingUp,
  Trophy,
  Home,
  Check,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  targetElement?: string;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  content: React.ReactNode;
}

export default function WelcomeTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Athena",
      description: "Your Personal AI Investment Advisor",
      icon: Sparkles,
      position: "center",
      content: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AthenaTraderAvatar size="large" showStatus={false} showName={false} />
          </div>
          <div>
            <h2 className="text-3xl font-extralight text-foreground mb-3">
              Meet Athena, Your AI Investment Partner
            </h2>
            <p className="text-muted-foreground font-light">
              I'll guide you through smart investment decisions with real-time analysis 
              and personalized recommendations. Let me show you around!
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge className="rounded-full px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Demo Mode - $100,000 Virtual Cash
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Risk-Free Learning
            </Badge>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Your Command Center",
      description: "Everything you need at a glance",
      icon: Home,
      targetElement: "[data-spotlight='portfolio-snapshot']",
      position: "center",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-extralight text-foreground">
            Your Investment Dashboard
          </h2>
          <p className="text-muted-foreground font-light">
            This is your Command Center - a unified dashboard showing your portfolio value, 
            AI insights, market pulse, and quick access to all features.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 rounded-[16px] p-4">
              <TrendingUp className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium">Real-time Portfolio</p>
              <p className="text-xs text-muted-foreground">Track performance 24/7</p>
            </div>
            <div className="bg-white/5 rounded-[16px] p-4">
              <Sparkles className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium">AI Insights</p>
              <p className="text-xs text-muted-foreground">Personalized recommendations</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Chat with Athena",
      description: "Get instant investment advice",
      icon: MessageCircle,
      targetElement: "[data-testid='button-toggle-chat']",
      position: "top-right",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-extralight text-foreground">
            Your AI Conversation Partner
          </h2>
          <p className="text-muted-foreground font-light">
            Click the Chat button or use voice commands to ask me anything about investments. 
            I can analyze stocks, suggest trades, and explain market trends.
          </p>
          <div className="bg-white/5 rounded-[20px] p-4">
            <p className="text-sm font-medium mb-3">Try asking:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                "What stocks should I buy today?"
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                "Analyze my portfolio risk"
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-success" />
                "Explain market trends"
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Start Investing",
      description: "Make your first demo trade",
      icon: DollarSign,
      targetElement: "[data-testid='button-quick-simulator']",
      position: "center",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-extralight text-foreground">
            Practice Risk-Free Trading
          </h2>
          <p className="text-muted-foreground font-light">
            Start with $100,000 in virtual cash to practice trading. Build your portfolio, 
            test strategies, and learn without any real financial risk.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="rounded-full flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              Buy Stocks
            </Button>
            <Button variant="outline" className="rounded-full flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-[20px] p-4 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Demo Account Balance</p>
            <p className="text-2xl font-extralight text-primary">$100,000.00</p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Track Your Progress",
      description: "Unlock achievements and improve",
      icon: Trophy,
      targetElement: "[data-testid='button-quick-rewards']",
      position: "center",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-extralight text-foreground">
            Earn Achievements & Learn
          </h2>
          <p className="text-muted-foreground font-light">
            Complete challenges, unlock badges, and track your investment journey. 
            View detailed analytics to understand your performance and improve your strategies.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-xs">First Trade</p>
            </div>
            <div className="text-center opacity-50">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs">Portfolio Pro</p>
            </div>
            <div className="text-center opacity-50">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs">Market Master</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const hasSeen = localStorage.getItem("athena_tutorial_completed");
    if (!hasSeen) {
      setIsVisible(true);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("athena_tutorial_completed", "true");
    setIsVisible(false);
    setHasSeenTutorial(true);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isVisible && hasSeenTutorial) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={handleRestart}
          variant="outline"
          size="sm"
          className="rounded-full bg-black/80 backdrop-blur-sm border-white/10 hover:bg-black/90"
          data-testid="button-restart-tutorial"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Tutorial
        </Button>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with spotlight effect */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={handleSkip}
      />
      
      {/* Tutorial Card */}
      <Card className={cn(
        "relative z-10 w-full max-w-2xl mx-4",
        "bg-black/95 backdrop-blur-xl border-white/20",
        "rounded-[32px] shadow-2xl",
        "animate-in slide-in-from-bottom duration-700"
      )}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-[32px] overflow-hidden">
          <Progress value={progress} className="h-full rounded-none" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <currentStepData.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{currentStepData.title}</h3>
              <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-testid="button-skip-tutorial"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0">
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="rounded-full"
            data-testid="button-skip-all"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              className="rounded-full"
              data-testid="button-previous-step"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              size="sm"
              className="rounded-full"
              data-testid="button-next-step"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}