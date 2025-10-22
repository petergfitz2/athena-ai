import { Button } from "@/components/ui/button";
import { MessageSquare, LayoutDashboard, Briefcase, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const [location] = useLocation();

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-extralight text-foreground">Athena</h1>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/dashboard">
                <Button
                  variant={location === "/dashboard" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-[28px]"
                  data-testid="link-dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button
                  variant={location === "/portfolio" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-[28px]"
                  data-testid="link-portfolio"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Portfolio
                </Button>
              </Link>
              <Link href="/chat">
                <Button
                  variant={location === "/chat" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-[28px]"
                  data-testid="link-chat"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            </nav>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onLogout?.();
              console.log('Logout clicked');
            }}
            className="rounded-[28px]"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
