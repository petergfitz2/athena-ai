import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeTutorial from "./WelcomeTutorial";
import QuickStartGuide from "./QuickStartGuide";
import KeyboardShortcutsGuide from "./KeyboardShortcutsGuide";

export default function OnboardingDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem("hasSeenOnboarding");
    if (seen) {
      setHasSeenOnboarding(true);
    }
    // Start closed instead of auto-opening
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    setHasSeenOnboarding(true);
  };

  // Always show the help button in bottom-right corner when drawer is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="default"
          size="default"
          onClick={() => setIsOpen(true)}
          className="rounded-full min-h-[56px] min-w-[56px] p-0 shadow-lg bg-primary hover:bg-primary/90"
          data-testid="button-show-help"
        >
          <BookOpen className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-xl"
        >
          <div className="max-w-screen-2xl mx-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-medium text-white">
                    Getting Started with Athena
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-white/10"
                    data-testid="button-minimize-help"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="rounded-full hover:bg-white/10"
                    data-testid="button-dismiss-help"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Welcome Tutorial */}
                <div className="lg:col-span-1">
                  <WelcomeTutorial />
                </div>

                {/* Quick Start Guide */}
                <div className="lg:col-span-1">
                  <QuickStartGuide />
                </div>

                {/* Keyboard Shortcuts */}
                <div className="lg:col-span-1">
                  <KeyboardShortcutsGuide />
                </div>
              </div>

              {/* Quick Tip */}
              <div className="mt-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <p className="text-sm text-purple-200">
                  💡 <span className="font-medium">Pro Tip:</span> You can always access these guides by clicking the "Help & Guides" button in the top-right corner.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}