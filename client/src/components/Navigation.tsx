import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, LayoutDashboard, ListChecks, TrendingUp, History, Menu, HelpCircle, BookOpen, FileQuestion, Briefcase, Activity, Users, Trophy, Bell, User, MessageCircle, Grid3x3, Layout, ChevronDown, Keyboard, Palette, MoreHorizontal, Search, X } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useMode } from "@/contexts/ModeContext";
import { useChatContext } from "@/contexts/ChatContext";
import ModeSwitcherMenu from "./ModeSwitcherMenu";
import AvatarStudio from "./AvatarStudio";
import SearchDropdown from "./SearchDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationProps {
  variant?: "default" | "transparent";
}

export default function Navigation({ variant = "default" }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentMode, setMode } = useMode();
  const { openPanelWithContext } = useChatContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarStudioOpen, setAvatarStudioOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await apiJson("POST", "/api/auth/logout", {});
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Core navigation items - always visible with text
  const navLinks = [
    { href: "/command-center", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘D" },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase, shortcut: "⌘P" },
    { href: "/watchlist", label: "Watchlist", icon: ListChecks, shortcut: "⌘W" },
    { href: "/trades", label: "Trades", icon: TrendingUp, shortcut: "⌘T" },
    { href: "/analytics", label: "Analytics", icon: Activity, shortcut: "⌘A" },
  ];

  const modes = [
    { id: "athena", label: "Athena Mode", icon: MessageCircle, href: "/athena", description: "Chat-first interface" },
    { id: "hybrid", label: "Hybrid Mode", icon: Layout, href: "/hybrid", description: "Dashboard + Chat" },
    { id: "terminal", label: "Terminal Mode", icon: Grid3x3, href: "/terminal", description: "Multi-panel pro" },
  ];

  const handleModeSwitch = (modeId: string, href: string) => {
    setMode(modeId as "athena" | "hybrid" | "terminal");
    setLocation(href);
  };

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchDropdownOpen(true);
    } else {
      setSearchDropdownOpen(false);
    }
  }, [searchQuery]);

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            const searchInput = document.querySelector('[data-testid="input-ticker-search"]') as HTMLInputElement;
            searchInput?.focus();
            break;
          case 'd':
            e.preventDefault();
            setLocation('/command-center');
            break;
          case 'p':
            e.preventDefault();
            setLocation('/portfolio');
            break;
          case 'w':
            e.preventDefault();
            setLocation('/watchlist');
            break;
          case 't':
            e.preventDefault();
            setLocation('/trades');
            break;
          case 'a':
            e.preventDefault();
            setLocation('/analytics');
            break;
          case '1':
            e.preventDefault();
            handleModeSwitch('athena', '/athena');
            break;
          case '2':
            e.preventDefault();
            handleModeSwitch('hybrid', '/hybrid');
            break;
          case '3':
            e.preventDefault();
            handleModeSwitch('terminal', '/terminal');
            break;
        }
      }
      // Escape to close search or go back
      if (e.key === 'Escape') {
        if (searchDropdownOpen) {
          e.preventDefault();
          setSearchDropdownOpen(false);
          setSearchQuery("");
        } else if (location !== '/command-center') {
          e.preventDefault();
          window.history.back();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location, setLocation, searchDropdownOpen]);

  const isActive = (href: string) => location === href;

  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b ${
        variant === "transparent"
          ? "bg-black/80 backdrop-blur-xl border-white/5"
          : "bg-black border-white/10"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Left Side - Logo with more breathing room */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center h-12 hover-elevate active-elevate-2 px-3 rounded-lg transition-colors" data-testid="link-logo">
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-white whitespace-nowrap leading-none">
                Athena AI
              </span>
            </Link>
          </div>

          {/* Center - Search Bar and Navigation Links */}
          <div className="flex-1 flex items-center gap-3 justify-center px-2">
            {/* Smart Search Bar - Responsive */}
            <div ref={searchRef} className="relative w-full max-w-md md:mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search stocks... (⌘K)"
                  className="w-full h-10 pl-10 pr-10 rounded-[20px] border-white/10 bg-white/5 
                           placeholder:text-muted-foreground focus:ring-2 focus:ring-primary 
                           focus:border-primary transition-all text-sm md:text-base"
                  data-testid="input-ticker-search"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchDropdownOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground 
                             hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Search Dropdown */}
              <SearchDropdown
                searchQuery={searchQuery}
                isOpen={searchDropdownOpen}
                onClose={() => {
                  setSearchDropdownOpen(false);
                  setSearchQuery("");
                }}
              />
            </div>

            {/* Navigation Links - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-none">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                      <Link 
                        href={link.href}
                        className={`flex items-center gap-1.5 h-9 px-2.5 rounded-full text-xs transition-all relative flex-shrink-0 ${
                          active
                            ? "bg-primary/20 text-primary font-bold"
                            : "text-white font-medium hover:text-white hover:bg-white/10"
                        }`}
                        data-testid={`link-${link.label.toLowerCase()}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <p>{link.label}</p>
                      <p className="text-muted-foreground">{link.shortcut}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Right Side - Mode Switcher and User Menu - ALWAYS VISIBLE */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {/* Mode Switcher - Larger icons */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20"
                  data-testid="button-mode-switcher"
                >
                  {currentMode === "athena" && <MessageCircle className="w-5 h-5 text-white" />}
                  {currentMode === "hybrid" && <Layout className="w-5 h-5 text-white" />}
                  {currentMode === "terminal" && <Grid3x3 className="w-5 h-5 text-white" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-card border-white/10 rounded-[20px]"
              >
                <DropdownMenuLabel className="font-medium text-xs text-muted-foreground">
                  Interface Mode
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;
                  return (
                    <DropdownMenuItem
                      key={mode.id}
                      onClick={() => handleModeSwitch(mode.id, mode.href)}
                      className={`cursor-pointer py-3 hover-elevate active-elevate-2 rounded-lg ${
                        isActive ? "bg-primary/10" : ""
                      }`}
                      data-testid={`menu-mode-${mode.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}>
                            {mode.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mode.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-1 h-6 bg-primary rounded-full" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - Larger profile icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 p-0"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/30 text-white text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card border-white/10 rounded-[20px]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setLocation("/profile")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvatarStudioOpen(true)}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-avatar-studio"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change Avatar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/settings")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-settings"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setLocation("/leaderboard")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-leaderboard"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/tutorials")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-tutorials"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Tutorials
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/faq")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-faq"
                >
                  <FileQuestion className="w-4 h-4 mr-2" />
                  FAQ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/help")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-help"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-shortcuts"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  <span className="flex-1">Keyboard Shortcuts</span>
                  <span className="text-xs text-muted-foreground">⌘K</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button - Shows on Mobile Only */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover-elevate active-elevate-2 bg-white/10 h-10 w-10"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-black/95 backdrop-blur-xl border-white/10">
              <SheetHeader className="pb-6">
                {/* User Profile Section */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/30 text-white text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">{user?.username || 'Guest User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'guest@example.com'}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-8">
                {/* Mode Selector */}
                <div className="mb-4 p-2 bg-card/50 rounded-[20px]">
                  <p className="text-xs text-muted-foreground mb-2 px-2">Interface Mode</p>
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = currentMode === mode.id;
                    return (
                      <Button
                        key={mode.id}
                        onClick={() => {
                          handleModeSwitch(mode.id, mode.href);
                          setMobileMenuOpen(false);
                        }}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3 rounded-[16px] mb-1"
                        data-testid={`mobile-mode-${mode.id}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{mode.label}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="border-t border-white/10 my-2"></div>
                
                {/* Navigation Links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-[20px] text-base font-light transition-all min-h-[56px] ${
                        active
                          ? "bg-primary/20 text-primary font-normal"
                          : "text-muted-foreground hover-elevate active-elevate-2"
                      }`}
                      data-testid={`mobile-link-${link.label.toLowerCase()}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{link.label}</span>
                      {active && (
                        <div className="w-1 h-6 bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
                <div className="border-t border-white/10 my-2"></div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocation("/leaderboard");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-leaderboard"
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocation("/tutorials");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-tutorials"
                >
                  <BookOpen className="w-5 h-5" />
                  Tutorials
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocation("/faq");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-faq"
                >
                  <FileQuestion className="w-5 h-5" />
                  FAQ
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocation("/help");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-help"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help Center
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLocation("/settings");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-settings"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="justify-start gap-3 rounded-[20px] text-destructive hover-elevate active-elevate-2"
                  data-testid="mobile-menu-logout"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
      
      {/* Avatar Studio Modal */}
      <AvatarStudio open={avatarStudioOpen} onClose={() => setAvatarStudioOpen(false)} />
    </nav>
  );
}
