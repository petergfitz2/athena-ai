import { useMode } from "@/contexts/ModeContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModeSuggestionProps {
  recommendedMode: "athena" | "hybrid" | "terminal";
  reason: string;
  onDismiss: () => void;
}

const MODE_LABELS = {
  athena: "Athena Mode",
  hybrid: "Hybrid Mode",
  terminal: "Terminal Mode",
};

const MODE_DESCRIPTIONS = {
  athena: "Voice-first conversational interface for quick updates",
  hybrid: "Desktop trading with portfolio dashboard and Athena assistant",
  terminal: "Multi-panel institutional analysis for deep research",
};

export default function ModeSuggestion({
  recommendedMode,
  reason,
  onDismiss,
}: ModeSuggestionProps) {
  const { setMode } = useMode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSwitch = () => {
    setMode(recommendedMode);
    setLocation(`/${recommendedMode}`);
    toast({
      title: `Switched to ${MODE_LABELS[recommendedMode]}`,
      description: MODE_DESCRIPTIONS[recommendedMode],
    });
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
        data-testid="mode-suggestion"
      >
        <div className="glass rounded-[28px] p-6 border border-purple-500/20 bg-black/80 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Try {MODE_LABELS[recommendedMode]}
                </h3>
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-dismiss-suggestion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {reason}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSwitch}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="button-switch-mode"
                >
                  Switch Now
                </Button>
                <Button
                  onClick={onDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-stay-current"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
