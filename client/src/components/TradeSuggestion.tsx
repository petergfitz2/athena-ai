import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import GlassCard from "./GlassCard";

interface TradeSuggestionProps {
  symbol: string;
  action: "BUY" | "SELL";
  shares: number;
  price: number;
  reasoning: string;
  confidence: number;
  onApprove?: () => void;
  onDecline?: () => void;
}

export default function TradeSuggestion({
  symbol,
  action,
  shares,
  price,
  reasoning,
  confidence,
  onApprove,
  onDecline,
}: TradeSuggestionProps) {
  return (
    <GlassCard data-testid={`suggestion-${symbol}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-2xl font-light text-foreground">{symbol}</h3>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                action === "BUY"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-destructive/20 text-destructive border border-destructive/30"
              )}
            >
              {action}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {shares} shares @ ${price.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="text-lg font-light text-primary">{confidence}%</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">AI Reasoning</p>
        <p className="text-base text-foreground leading-relaxed">{reasoning}</p>
      </div>

      <div className="flex gap-3">
        <Button
          data-testid="button-approve-trade"
          onClick={() => {
            onApprove?.();
            console.log('Trade approved:', symbol, action);
          }}
          className="flex-1 rounded-[28px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 animate-purple-pulse"
          size="lg"
        >
          <Check className="h-5 w-5 mr-2" />
          <span className="font-medium">Approve Trade</span>
        </Button>
        <Button
          data-testid="button-decline-trade"
          onClick={() => {
            onDecline?.();
            console.log('Trade declined:', symbol);
          }}
          variant="ghost"
          className="rounded-[28px] bg-white/5 border-white/10 hover:bg-white/10"
          size="default"
        >
          <X className="h-4 w-4 mr-1" />
          <span className="text-sm">Decline</span>
        </Button>
      </div>
    </GlassCard>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
