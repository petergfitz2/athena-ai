import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTooltipProps {
  targetSelector: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function OnboardingTooltip({ 
  targetSelector, 
  title, 
  description, 
  position = "bottom",
  delay = 0 
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if already shown
    const storageKey = `onboarding-${targetSelector}`;
    if (localStorage.getItem(storageKey) === "shown") {
      return;
    }

    const timer = setTimeout(() => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        let top = rect.top;
        let left = rect.left;

        switch (position) {
          case "top":
            top = rect.top - 80;
            left = rect.left + rect.width / 2 - 150;
            break;
          case "bottom":
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2 - 150;
            break;
          case "left":
            top = rect.top + rect.height / 2 - 40;
            left = rect.left - 320;
            break;
          case "right":
            top = rect.top + rect.height / 2 - 40;
            left = rect.right + 10;
            break;
        }

        setCoords({ top, left: Math.max(10, left) });
        setIsVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [targetSelector, position, delay]);

  const handleDismiss = () => {
    localStorage.setItem(`onboarding-${targetSelector}`, "shown");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 w-[300px] p-4 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-[20px] shadow-xl"
          style={{ top: coords.top, left: coords.left }}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            data-testid="button-dismiss-tooltip"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
          
          <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
          <p className="text-xs text-white/70 pr-4">{description}</p>
          
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-4 bg-purple-500/20 border-t border-l border-purple-500/30 rotate-45"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}