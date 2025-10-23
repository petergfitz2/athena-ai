import { useMode, InterfaceMode } from "@/contexts/ModeContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, LayoutDashboard, Terminal } from "lucide-react";

const modes: { value: InterfaceMode; label: string; icon: any; description: string }[] = [
  {
    value: "amanda",
    label: "Amanda",
    icon: MessageCircle,
    description: "Voice-first conversational interface",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    icon: LayoutDashboard,
    description: "Dashboard + Mini Amanda",
  },
  {
    value: "terminal",
    label: "Terminal",
    icon: Terminal,
    description: "Professional multi-panel view",
  },
];

export default function ModeSelector() {
  const { currentMode, setMode } = useMode();

  return (
    <div className="glass rounded-[28px] p-2 flex gap-2" data-testid="mode-selector">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.value;
        
        return (
          <Button
            key={mode.value}
            onClick={() => setMode(mode.value)}
            variant={isActive ? "default" : "ghost"}
            className={`flex-1 rounded-[20px] h-auto py-3 px-4 flex flex-col items-center gap-2 ${
              isActive ? "bg-primary text-primary-foreground" : ""
            }`}
            data-testid={`mode-${mode.value}`}
          >
            <Icon className="w-5 h-5" />
            <div className="text-center">
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs opacity-70 hidden lg:block">{mode.description}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
