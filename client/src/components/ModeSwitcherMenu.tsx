import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout, MessageCircle, Grid3x3, ChevronDown, LogOut } from "lucide-react";

const MODES = [
  {
    id: "amanda" as const,
    name: "Amanda Mode",
    description: "Voice-first conversational",
    icon: MessageCircle,
    shortcut: "⌘1",
  },
  {
    id: "hybrid" as const,
    name: "Hybrid Mode",
    description: "Dashboard + Amanda",
    icon: Layout,
    shortcut: "⌘2",
  },
  {
    id: "terminal" as const,
    name: "Terminal Mode",
    description: "Multi-panel professional",
    icon: Grid3x3,
    shortcut: "⌘3",
  },
];

export default function ModeSwitcherMenu() {
  const { currentMode, setMode } = useMode();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleModeChange = (modeId: "amanda" | "hybrid" | "terminal") => {
    setMode(modeId);
    setLocation(`/${modeId}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  const currentModeData = MODES.find((m) => m.id === currentMode) || MODES[0];
  const CurrentIcon = currentModeData.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 rounded-full hover-elevate"
          data-testid="button-mode-switcher"
        >
          <CurrentIcon className="w-4 h-4" />
          <span className="font-light">{currentModeData.name}</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-card border-white/10 backdrop-blur-md">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Interface Mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <DropdownMenuItem
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`cursor-pointer py-3 ${
                isActive ? "bg-primary/10" : ""
              }`}
              data-testid={`menu-item-${mode.id}`}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                      {mode.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{mode.shortcut}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mode.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
          data-testid="menu-item-logout"
        >
          <div className="flex items-center gap-3 w-full">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
