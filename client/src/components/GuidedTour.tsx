import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Athena! 🚀",
    description: "Let me show you around your new AI-powered investment platform. This quick tour will help you get started.",
    position: "center",
  },
  {
    id: "portfolio-value",
    title: "Your Portfolio Value",
    description: "This is your total portfolio value. It updates in real-time as market prices change.",
    targetSelector: "[data-tour='portfolio-value']",
    position: "bottom",
  },
  {
    id: "athena-orb",
    title: "Meet Athena AI",
    description: "Click this orb anytime to chat with your AI investment assistant. I can help with stock analysis, trade suggestions, and answer any questions!",
    targetSelector: "[data-testid='button-floating-athena']",
    position: "left",
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Use these buttons to quickly access the most important features - chat with Athena, buy stocks, or view your portfolio.",
    targetSelector: "[data-tour='quick-actions']",
    position: "top",
  },
  {
    id: "market-news",
    title: "Stay Informed",
    description: "Keep up with the latest market news. We curate the most relevant stories for your portfolio.",
    targetSelector: "[data-tour='market-news']",
    position: "top",
  },
  {
    id: "make-trade",
    title: "Ready to Trade?",
    description: "When you're ready, click 'Buy Stocks' to make your first trade. Don't worry - this is a demo environment with virtual money!",
    targetSelector: "[data-tour='buy-stocks']",
    position: "top",
  },
  {
    id: "complete",
    title: "You're All Set! 🎉",
    description: "That's all the basics! Remember, you can always click on Athena for help or explore the Learn section for tutorials.",
    position: "center",
  },
];

export default function GuidedTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem("athena-tour-completed") === "true";
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if this is a new user and hasn't seen the tour
    const isNewUser = localStorage.getItem("athena-new-user") === "true";
    if (isNewUser && !hasSeenTour) {
      // Start the tour after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
        localStorage.removeItem("athena-new-user");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    setHasSeenTour(true);
    localStorage.setItem("athena-tour-completed", "true");
    setCurrentStep(0);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const currentTourStep = tourSteps[currentStep];

  const getPositionStyles = (position: string) => {
    switch (position) {
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-4";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-4";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-4";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-4";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  // Render restart button for users who have completed the tour
  if (!isActive && hasSeenTour) {
    return (
      <Button
        onClick={handleRestart}
        variant="ghost"
        size="sm"
        className="fixed bottom-6 left-6 z-40 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 hover-elevate"
        data-testid="button-restart-tour"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Restart Tour
      </Button>
    );
  }

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleSkip}
          />

          {/* Highlight */}
          {currentTourStep.targetSelector && (
            <motion.div
              key={currentTourStep.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="tour-highlight"
              style={{
                position: "fixed",
                zIndex: 101,
              }}
            />
          )}

          {/* Tour Card */}
          <motion.div
            key={currentTourStep.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed z-[102] ${
              currentTourStep.position === "center"
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : ""
            }`}
          >
            <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-[24px] p-6 max-w-md shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-light text-white mb-2">
                    {currentTourStep.title}
                  </h3>
                  <p className="text-sm text-white/70 font-light leading-relaxed">
                    {currentTourStep.description}
                  </p>
                </div>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 -mt-2 -mr-2"
                  data-testid="button-skip-tour"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {tourSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? "w-6 bg-primary"
                          : index < currentStep
                          ? "w-1.5 bg-primary/50"
                          : "w-1.5 bg-white/20"
                      }`}
                      animate={{
                        scale: index === currentStep ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: index === currentStep ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white/70"
                    data-testid="button-skip-tour-bottom"
                  >
                    Skip Tour
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="rounded-full bg-primary hover:bg-primary/90"
                    data-testid="button-next-tour"
                  >
                    {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}