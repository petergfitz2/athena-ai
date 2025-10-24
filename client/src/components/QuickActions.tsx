import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingUp, Brain, LineChart } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: ShoppingCart,
      label: "Trade",
      onClick: () => setLocation('/trades'),
      color: 'text-green-400',
      bgColor: 'bg-green-400/10 hover:bg-green-400/20'
    },
    {
      icon: LineChart,
      label: "Analytics",
      onClick: () => setLocation('/analytics'),
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10 hover:bg-blue-400/20'
    },
    {
      icon: Brain,
      label: "AI Advice",
      onClick: () => {
        // Open the floating Athena orb
        const orbButton = document.querySelector('[data-testid="button-floating-athena"]') as HTMLElement;
        if (orbButton) {
          orbButton.click();
        }
      },
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10 hover:bg-purple-400/20'
    },
    {
      icon: TrendingUp,
      label: "Watchlist",
      onClick: () => setLocation('/watchlist'),
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10 hover:bg-orange-400/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant="ghost"
          className={`h-auto py-4 px-4 rounded-xl justify-start gap-3 ${action.bgColor} border-0 hover:scale-[1.02] transition-all`}
          data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
        >
          <div className={`p-2 rounded-lg bg-black/20`}>
            <action.icon className={`w-5 h-5 ${action.color}`} />
          </div>
          <span className="text-sm font-light text-white">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}