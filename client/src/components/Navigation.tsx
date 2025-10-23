import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
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
import { Settings, LogOut, LayoutDashboard, ListChecks, TrendingUp, History, Menu, HelpCircle, BookOpen, FileQuestion, Briefcase } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import ModeSwitcherMenu from "./ModeSwitcherMenu";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
    { href: "/watchlist", label: "Watchlist", icon: ListChecks, shortcut: "⌘2" },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase, shortcut: "⌘3" },
    { href: "/trades", label: "Trades", icon: History, shortcut: "⌘4" },
    { href: "/analytics", label: "Analytics", icon: TrendingUp, shortcut: "⌘5" },
  ];

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setLocation('/dashboard');
            break;
          case '2':
            e.preventDefault();
            setLocation('/watchlist');
            break;
          case '3':
            e.preventDefault();
            setLocation('/portfolio');
            break;
          case '4':
            e.preventDefault();
            setLocation('/trades');
            break;
          case '5':
            e.preventDefault();
            setLocation('/analytics');
            break;
        }
      }
      // Escape to go back
      if (e.key === 'Escape' && location !== '/dashboard') {
        e.preventDefault();
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location, setLocation]);

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
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover-elevate active-elevate-2 px-3 py-2 rounded-lg transition-colors" data-testid="link-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-light tracking-tight text-foreground">
              Athena
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link 
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-all relative ${
                        active
                          ? "bg-primary/20 text-primary font-normal"
                          : "text-muted-foreground hover-elevate active-elevate-2"
                      }`}
                      data-testid={`link-${link.label.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                      {active && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
                      )}
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

          {/* Mode Switcher (Desktop) */}
          <div className="hidden md:block">
            <ModeSwitcherMenu />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover-elevate active-elevate-2"
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-black/95 backdrop-blur-xl border-white/10">
              <SheetHeader>
                <SheetTitle className="text-foreground">Navigation</SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Access all pages and settings
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-8">
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
                      <span className="text-xs text-muted-foreground">{link.shortcut}</span>
                    </Link>
                  );
                })}
                <div className="border-t border-white/10 my-2"></div>
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 rounded-full hover-elevate active-elevate-2"
                data-testid="button-user-menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-light">
                  {user?.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card border-white/10 rounded-[20px]"
            >
              <DropdownMenuLabel className="font-light">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your account
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
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
              <DropdownMenuSeparator className="bg-white/10" />
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
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive hover-elevate active-elevate-2 rounded-lg"
                data-testid="menu-item-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
