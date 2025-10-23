import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  ArrowRight,
  DollarSign,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DemoModeBanner() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [balance] = useState(100000); // Demo balance

  useEffect(() => {
    const dismissed = localStorage.getItem("athena_demo_banner_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("athena_demo_banner_dismissed", "true");
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setIsMinimized(false);
    localStorage.removeItem("athena_demo_banner_dismissed");
  };

  // Show restore button if fully dismissed
  if (isDismissed) {
    return (
      <div className="fixed top-20 right-6 z-30">
        <Button
          onClick={handleRestore}
          variant="outline"
          size="sm"
          className="rounded-full bg-black/80 backdrop-blur-sm border-white/10 hover:bg-black/90"
          data-testid="button-restore-demo-banner"
        >
          <Zap className="w-4 h-4 mr-2 text-primary" />
          Demo Mode
        </Button>
      </div>
    );
  }

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed top-20 right-6 z-30">
        <div className="flex items-center gap-2">
          <Badge 
            className="rounded-full px-4 py-1.5 bg-gradient-to-r from-primary to-purple-600 border-0 cursor-pointer"
            onClick={() => setIsMinimized(false)}
            data-testid="badge-demo-minimized"
          >
            <Zap className="w-4 h-4 mr-2" />
            Demo Mode
            <ChevronDown className="w-3 h-3 ml-2" />
          </Badge>
        </div>
      </div>
    );
  }

  // Full banner
  return (
    <div className={cn(
      "fixed top-20 right-6 z-30",
      "animate-in slide-in-from-top duration-500"
    )}>
      <div className={cn(
        "bg-gradient-to-r from-primary/90 to-purple-600/90",
        "backdrop-blur-xl rounded-[20px] shadow-lg shadow-primary/20",
        "border border-white/20",
        "p-4 pr-3 max-w-sm"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Demo Trading Mode
              </h3>
              <div className="flex gap-1">
                <Button
                  onClick={() => setIsMinimized(true)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white hover:bg-white/20"
                  data-testid="button-minimize-demo"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white hover:bg-white/20"
                  data-testid="button-dismiss-demo"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white/80" />
                <span className="text-lg font-normal text-white">
                  ${balance.toLocaleString()} Virtual Cash
                </span>
              </div>
              <p className="text-xs text-white/80">
                Practice risk-free with virtual money
              </p>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
              data-testid="button-go-live"
            >
              Go Live
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}