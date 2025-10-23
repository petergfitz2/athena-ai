import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Keyboard, 
  Command, 
  Search,
  Home,
  Briefcase,
  Eye,
  MessageCircle,
  Settings,
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Shortcut {
  key: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: "navigation" | "actions" | "general";
}

export default function KeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: "⌘ + 1", description: "Go to Dashboard", icon: Home, category: "navigation" },
    { key: "⌘ + 2", description: "Go to Portfolio", icon: Briefcase, category: "navigation" },
    { key: "⌘ + 3", description: "Go to Watchlist", icon: Eye, category: "navigation" },
    { key: "⌘ + 4", description: "Go to Settings", icon: Settings, category: "navigation" },
    { key: "Escape", description: "Go Back", icon: ArrowLeft, category: "navigation" },
    
    // Actions
    { key: "⌘ + K", description: "Quick Search", icon: Search, category: "actions" },
    { key: "⌘ + /", description: "Open Chat with Athena", icon: MessageCircle, category: "actions" },
    { key: "⌘ + B", description: "Quick Buy", category: "actions" },
    { key: "⌘ + S", description: "Quick Sell", category: "actions" },
    
    // General
    { key: "?", description: "Show Keyboard Shortcuts", icon: Keyboard, category: "general" },
    { key: "⌘ + H", description: "Toggle Help", icon: HelpCircle, category: "general" },
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts on "?"
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Navigation shortcuts (Cmd/Ctrl + number)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch(e.key) {
          case "1":
            e.preventDefault();
            window.location.href = "/command-center";
            break;
          case "2":
            e.preventDefault();
            window.location.href = "/portfolio";
            break;
          case "3":
            e.preventDefault();
            window.location.href = "/watchlist";
            break;
          case "4":
            e.preventDefault();
            window.location.href = "/settings";
            break;
          case "k":
            e.preventDefault();
            // Trigger quick search
            const searchButton = document.querySelector('[data-testid="button-quick-search"]');
            if (searchButton instanceof HTMLElement) {
              searchButton.click();
            }
            break;
          case "/":
            e.preventDefault();
            // Open Athena chat
            const chatButton = document.querySelector('[data-testid="button-toggle-chat"]');
            if (chatButton instanceof HTMLElement) {
              chatButton.click();
            }
            break;
          case "h":
            e.preventDefault();
            // Toggle help
            const helpButton = document.querySelector('[data-testid="button-help"]');
            if (helpButton instanceof HTMLElement) {
              helpButton.click();
            }
            break;
        }
      }

      // Escape to go back
      if (e.key === "Escape") {
        // Close modal if open
        if (isOpen) {
          setIsOpen(false);
        } else {
          // Go back in history
          window.history.back();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case "navigation":
        return "Navigation";
      case "actions":
        return "Quick Actions";
      case "general":
        return "General";
      default:
        return category;
    }
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? "⌘" : "Ctrl";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn(
        "max-w-2xl bg-black/95 backdrop-blur-xl",
        "border-white/10 rounded-[28px]"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-light">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                {getCategoryLabel(category)}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <div
                      key={shortcut.key}
                      className={cn(
                        "flex items-center justify-between",
                        "p-3 rounded-[16px] bg-white/5",
                        "hover:bg-white/10 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.key.split(" + ").map((key, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {index > 0 && <span className="text-xs text-muted-foreground">+</span>}
                            <kbd className={cn(
                              "px-2 py-1 text-xs rounded-md",
                              "bg-white/10 border border-white/20",
                              "font-mono"
                            )}>
                              {key.replace("⌘", modifierKey)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-white/10" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Press <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/20 font-mono">?</kbd> anytime to show shortcuts</p>
          <Badge variant="outline" className="text-xs">
            {isMac ? "Mac" : "Windows/Linux"}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}