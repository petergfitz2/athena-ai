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
  const handleLogin = () => {
    window.location.href = "/api/login";
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
              className="w-full rounded-[28px] h-14 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 shadow-xl shadow-primary/20 mb-6"
              size="lg"
              data-testid="button-auth-login"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Get Started
            </Button>

            {/* Auth Provider Info */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  One account for everything
                </p>
              </div>
              
              {/* Supported Providers */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Sign in with your preferred account:
                </p>
                <div className="flex justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <SiGoogle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Google</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <SiGithub className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">GitHub</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <SiApple className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Apple</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-semibold">@</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Email</span>
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
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}