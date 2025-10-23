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
import { Settings, LogOut, LayoutDashboard, ListChecks, TrendingUp, History, Menu, HelpCircle, BookOpen, FileQuestion } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ModeSwitcherMenu from "./ModeSwitcherMenu";

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
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/watchlist", label: "Watchlist", icon: ListChecks },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/trades", label: "Trades", icon: History },
  ];

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
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-all ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover-elevate active-elevate-2"
                  }`}
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
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
              <div className="flex flex-col gap-4 mt-8">
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
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover-elevate active-elevate-2"
                      }`}
                      data-testid={`mobile-link-${link.label.toLowerCase()}`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
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
