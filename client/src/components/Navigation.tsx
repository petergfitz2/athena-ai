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
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Simplified navigation items - text only
  const navLinks = [
    { href: "/command-center", label: "Dashboard", shortcut: "⌘D" },
    { href: "/portfolio", label: "Portfolio", shortcut: "⌘P" },
    { href: "/watchlist", label: "Watchlist", shortcut: "⌘W" },
    { href: "/trades", label: "Trades", shortcut: "⌘T" },
    { href: "/profile", label: "Profile", shortcut: "⌘U" },
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
            setSearchExpanded(true);
            setTimeout(() => {
              searchInputRef.current?.focus();
            }, 100);
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
          case 'u':
            e.preventDefault();
            setLocation('/profile');
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
      className={`sticky top-0 z-50 h-[56px] border-b ${
        variant === "transparent"
          ? "bg-neutral-900/95 backdrop-blur-sm border-gray-800/60"
          : "bg-neutral-900 border-gray-800/60"
      }`}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Left Side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center h-12 hover-elevate active-elevate-2 px-3 rounded-lg transition-colors" data-testid="link-logo">
              <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white whitespace-nowrap leading-none">
                Athena AI
              </span>
            </Link>
          </div>

          {/* Center - Search Bar and Navigation Links */}
          <div className="flex-1 flex items-center gap-3 justify-center">
            {/* Expandable Search Bar - Responsive */}
            <motion.div 
              ref={searchRef} 
              className="relative flex-shrink-0 ml-4"
              initial={false}
              animate={{
                width: searchExpanded 
                  ? typeof window !== 'undefined' && window.innerWidth < 768 
                    ? "calc(100vw - 160px)" // Mobile: account for padding and buttons
                    : "280px" // Desktop: more reasonable width
                  : "144px" // Collapsed width
              }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94] // Cubic-bezier for natural feel
              }}
            >
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-all duration-200 ${
                  searchExpanded ? "opacity-70 scale-100" : "opacity-100 scale-110"
                }`} />
                
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSearchQuery(newValue);
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    setSearchExpanded(true);
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    // Only collapse if there's no text entered
                    if (!searchQuery.trim()) {
                      setSearchExpanded(false);
                    }
                  }}
                  placeholder={searchExpanded ? "Search tickers or companies..." : "Search..."}
                  className={`w-full h-11 min-h-[44px] pl-10 pr-10 rounded-[20px] transition-all duration-250 text-white text-sm md:text-base ${
                    searchExpanded 
                      ? "border-white/30 bg-white/10 ring-2 ring-primary/50 placeholder:opacity-70" 
                      : "border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer placeholder:opacity-60"
                  } placeholder:text-white/50 placeholder:text-xs placeholder:transition-opacity placeholder:duration-300 ${
                    !searchExpanded ? "placeholder:truncate" : ""
                  } focus:ring-2 focus:ring-primary focus:border-primary focus:text-white`}
                  data-testid="input-ticker-search"
                  onClick={() => {
                    if (!searchExpanded) {
                      setSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }
                  }}
                />
                
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchDropdownOpen(false);
                        // Also collapse the search bar when clearing
                        setSearchExpanded(false);
                        searchInputRef.current?.blur();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground 
                               hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Search Dropdown */}
              <SearchDropdown
                searchQuery={searchQuery}
                isOpen={searchDropdownOpen}
                onClose={() => {
                  setSearchDropdownOpen(false);
                  setSearchQuery("");
                  setSearchExpanded(false);
                }}
              />
            </motion.div>

            {/* Navigation Links - Text only with underline animation */}
            <div className="hidden md:flex items-center gap-8 flex-shrink-0">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                      <Link 
                        href={link.href}
                        className="relative group py-2 transition-colors"
                        data-testid={`link-${link.label.toLowerCase()}`}
                      >
                        <span className={`text-sm font-medium tracking-wide transition-colors ${
                          active
                            ? "text-purple-400"
                            : "text-gray-200 hover:text-white"
                        }`}>
                          {link.label}
                        </span>
                        {/* Underline animation */}
                        <span 
                          className={`absolute bottom-0 left-0 h-[2px] bg-purple-500 transition-all duration-300 ${
                            active 
                              ? "w-full" 
                              : "w-0 group-hover:w-full"
                          }`}
                        />
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
            {/* Mode Switcher - Enhanced Design */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 border border-white/20 hover:from-primary/30 hover:to-purple-600/30 hover:border-white/30 transition-all"
                  data-testid="button-mode-switcher"
                >
                  <div className="relative">
                    {currentMode === "athena" && (
                      <div className="flex flex-col items-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {currentMode === "hybrid" && (
                      <div className="relative">
                        <Layout className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {currentMode === "terminal" && (
                      <div className="relative">
                        <Grid3x3 className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
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
                  className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 p-0"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-primary/30 text-white text-base font-bold">
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
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg"
                  data-testid="menu-item-shortcuts"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  <span className="flex-1">Keyboard Shortcuts</span>
                  <span className="text-xs text-muted-foreground">⌘K</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Resources</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setLocation("/help")}
                  className="cursor-pointer hover-elevate active-elevate-2 rounded-lg text-sm"
                  data-testid="menu-item-help"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Tutorials
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
                
                {/* Navigation Links - Text only */}
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-[20px] text-lg font-medium transition-all min-h-[56px] ${
                        active
                          ? "bg-primary/20 text-primary font-semibold"
                          : "text-white hover-elevate active-elevate-2"
                      }`}
                      data-testid={`mobile-link-${link.label.toLowerCase()}`}
                    >
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
                    setLocation("/help");
                  }}
                  className="justify-start gap-3 rounded-[20px] hover-elevate active-elevate-2"
                  data-testid="mobile-menu-help"
                >
                  <HelpCircle className="w-5 h-5" />
                  Help & Support
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
