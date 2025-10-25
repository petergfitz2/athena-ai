import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Brain, TrendingUp, Shield, Trophy, Star, LogIn, Sparkles, Users } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to command center if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Handle Replit Auth login - supports Google, GitHub, Apple, and email
  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Login button clicked!");
    
    // Try to open in a new tab first (works better in Replit preview)
    const loginUrl = window.location.origin + "/api/login";
    console.log("Attempting to open:", loginUrl);
    
    const newWindow = window.open(loginUrl, '_blank');
    
    // If popup blocked, fallback to redirect
    if (!newWindow) {
      console.log("Popup blocked, using redirect instead");
      window.location.href = "/api/login";
    } else {
      console.log("Opened login in new tab");
    }
  };
  
  // Development bypass - skip OAuth for quick testing
  const handleDevBypass = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("[DEV MODE] Bypassing authentication...");
    
    try {
      const response = await fetch("/api/auth/dev-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("[DEV MODE] Login successful:", data);
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        const error = await response.json();
        console.error("[DEV MODE] Failed:", error);
        alert("Dev bypass failed: " + error.error);
      }
    } catch (err) {
      console.error("[DEV MODE] Error:", err);
      alert("Dev bypass error: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[100px]" />
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Features and branding */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="max-w-xl">
            <div className="mb-12">
              <h1 className="text-6xl lg:text-7xl font-extralight text-foreground mb-4">
                Athena AI<br />
                <span className="text-primary font-light">Investing</span>
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Investing as easy as talking to a friend
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized investment advice powered by GPT-4, analyzing markets 24/7
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Real-Time Trading</h3>
                  <p className="text-sm text-muted-foreground">
                    Execute trades instantly with voice commands or conversational chat
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Risk Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent portfolio analysis with institutional-grade risk metrics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Gamified Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn achievements and climb leaderboards while building wealth
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>50K+ Active Traders</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>$2B+ Managed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Bank-Level Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <GlassCard className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-light text-foreground mb-2">
                Welcome to Athena
              </h2>
              <p className="text-muted-foreground font-normal">
                Start your AI-powered investing journey
              </p>
            </div>

            {/* Main CTA Button */}
            <Button
              onClick={handleLogin}
              className="w-full rounded-[28px] h-14 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 shadow-xl shadow-primary/20 mb-4 cursor-pointer relative z-50 pointer-events-auto"
              size="lg"
              data-testid="button-get-started"
              type="button"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            
            {/* Development Bypass Button - ONLY for development */}
            <Button
              onClick={handleDevBypass}
              className="w-full rounded-[28px] h-14 text-base font-medium bg-gradient-to-r from-yellow-600/80 to-orange-600/80 hover:from-yellow-600 hover:to-orange-600 shadow-xl shadow-orange-600/20 mb-4 cursor-pointer relative z-50 pointer-events-auto border-2 border-yellow-500/50"
              size="lg"
              data-testid="button-dev-bypass"
              type="button"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Skip Login (Dev Mode)
            </Button>
            
            {/* Alternative login method */}
            <div className="text-center mb-6">
              <p className="text-xs text-muted-foreground mb-2">
                Button not working?
              </p>
              <a 
                href="/api/login" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Click here to login directly
              </a>
            </div>

            {/* Auth Provider Info */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  One account for everything
                </p>
              </div>
              
              {/* Supported Providers - Informational Only */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
                <p className="text-sm text-center text-white/90 mb-2">
                  Available sign-in options:
                </p>
                <p className="text-xs text-center text-white/60 mb-4">
                  (You'll choose after clicking "Get Started" above)
                </p>
                <div className="flex justify-center gap-6">
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl shadow-white/20 transform transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-white/30">
                      <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <span className="text-xs text-white/80 font-medium">Google</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/30 flex items-center justify-center shadow-xl shadow-black/50 transform transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-white/20">
                      <SiGithub className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs text-white/80 font-medium">GitHub</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/30 flex items-center justify-center shadow-xl shadow-black/50 transform transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-white/20">
                      <SiApple className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs text-white/80 font-medium">Apple</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/50 transform transition-all group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/60">
                      <span className="text-white font-bold text-lg">@</span>
                    </div>
                    <span className="text-xs text-white/80 font-medium">Email</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No separate registration needed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure authentication with 2FA
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Join 50,000+ smart investors
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{" "}
                <a 
                  href="/terms" 
                  className="underline hover:text-primary transition-colors"
                  data-testid="link-terms-of-service"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a 
                  href="/privacy" 
                  className="underline hover:text-primary transition-colors"
                  data-testid="link-privacy-policy"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}