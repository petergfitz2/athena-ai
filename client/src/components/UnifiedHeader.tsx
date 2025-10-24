import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMode } from "@/contexts/ModeContext";
import ModeSwitcherMenu from "@/components/ModeSwitcherMenu";
import AthenaOrb from "@/components/AthenaOrb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  TrendingUp, 
  Eye, 
  Activity, 
  BookOpen, 
  HelpCircle,
  Settings,
  LogOut,
  User,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

interface UnifiedHeaderProps {
  showModeSwitcher?: boolean;
  transparentBg?: boolean;
  className?: string;
}

export default function UnifiedHeader({ 
  showModeSwitcher = true, 
  transparentBg = false,
  className = "" 
}: UnifiedHeaderProps) {
  const [location, setLocation] = useLocation();
  const { currentMode } = useMode();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch active avatar data
  const { data: activeAvatar } = useQuery<{
    name: string;
    imageUrl: string;
    personalityProfile: {
      catchphrase?: string;
      [key: string]: any;
    };
  }>({
    queryKey: ['/api/avatars/active'],
    refetchInterval: 10000,
  });

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/portfolio", label: "Portfolio", icon: TrendingUp },
    { path: "/watchlist", label: "Watchlist", icon: Eye },
    { path: "/trades", label: "Trades", icon: Activity },
  ];

  const helpItems = [
    { path: "/tutorials", label: "Tutorials", icon: BookOpen },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/help", label: "Help", icon: HelpCircle },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const bgClass = transparentBg ? "bg-black/50 backdrop-blur-xl" : "bg-black";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${bgClass} border-b border-white/10 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <AthenaOrb size="mini" showStatus={false} />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-extralight text-foreground tracking-wider">
                  Athena AI
                </h1>
                {activeAvatar && activeAvatar.name !== "Athena" && (
                  <p className="text-xs text-muted-foreground -mt-1">
                    with {activeAvatar.name}
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Link href={item.path}>
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Center: Mode Switcher - Always visible on desktop */}
          {showModeSwitcher && (
            <div className="hidden md:block">
              <ModeSwitcherMenu />
            </div>
          )}

          {/* Right: Help & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Desktop Help Menu - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/help">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Link>
              </Button>
              
              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activeAvatar?.imageUrl} alt={activeAvatar?.name} />
                      <AvatarFallback>{activeAvatar?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{activeAvatar?.name || 'Athena'}</p>
                        <Badge variant="outline" className="text-[10px]">AI Advisor</Badge>
                      </div>
                      {activeAvatar?.personalityProfile?.catchphrase && (
                        <p className="text-xs text-muted-foreground italic">
                          "{activeAvatar.personalityProfile.catchphrase}"
                        </p>
                      )}
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/avatar-studio">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Avatar Studio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-testid="button-mobile-menu"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-black border-white/10">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mode Switcher in Mobile */}
                  {showModeSwitcher && (
                    <div className="pb-6 border-b border-white/10">
                      <p className="text-xs text-muted-foreground mb-3 font-light">Interface Mode</p>
                      <ModeSwitcherMenu />
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3 font-light">Navigation</p>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      return (
                        <Button
                          key={item.path}
                          asChild
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start rounded-full"
                          data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                        >
                          <Link
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Help Items */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3 font-light">Resources</p>
                    {helpItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.path;
                      return (
                        <Button
                          key={item.path}
                          asChild
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start rounded-full"
                          data-testid={`mobile-help-${item.label.toLowerCase()}`}
                        >
                          <Link
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="pt-6 border-t border-white/10">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start rounded-full text-destructive hover:text-destructive"
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}