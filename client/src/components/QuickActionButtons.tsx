import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, Calculator, BarChart3 } from "lucide-react";

interface QuickActionButtonsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const quickActions = [
  {
    icon: Wallet,
    label: "Show Portfolio",
    message: "Show me my current portfolio performance",
    testId: "quick-portfolio",
  },
  {
    icon: TrendingUp,
    label: "Market Update",
    message: "What's happening in the market today?",
    testId: "quick-market",
  },
  {
    icon: Calculator,
    label: "Calculate Returns",
    message: "Calculate my portfolio returns",
    testId: "quick-returns",
  },
  {
    icon: BarChart3,
    label: "Suggest Trades",
    message: "Do you have any trade suggestions based on my portfolio?",
    testId: "quick-trades",
  },
];

export default function QuickActionButtons({ onAction, disabled }: QuickActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {quickActions.map((action) => (
        <Button
          key={action.testId}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          variant="outline"
          className="glass rounded-[20px] h-auto py-4 px-4 justify-start gap-3 hover:glass-hover"
          data-testid={`button-${action.testId}`}
        >
          <action.icon className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm font-light text-foreground">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
