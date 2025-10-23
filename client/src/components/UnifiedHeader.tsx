import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMode } from "@/contexts/ModeContext";
import ModeSwitcherMenu from "@/components/ModeSwitcherMenu";
import AthenaOrb from "@/components/AthenaOrb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth";

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
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <h1 className="text-2xl font-extralight text-foreground tracking-wider hidden sm:block">
                Athena
              </h1>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="rounded-full"
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
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
              <Link href="/help">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="rounded-full text-destructive hover:text-destructive"
                data-testid="button-logout-desktop"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-testid="button-mobile-menu"
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
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className="w-full justify-start rounded-full"
                            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
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
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className="w-full justify-start rounded-full"
                            data-testid={`mobile-help-${item.label.toLowerCase()}`}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
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