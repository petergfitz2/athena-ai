import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Brain, TrendingUp, Shield, Trophy, Star } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user, login, register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to command center if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/command-center");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password, fullName);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <div className="mb-8">
              <h2 className="text-3xl font-light text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-muted-foreground font-normal">
                {isLogin ? "Sign in to your account" : "Create your free account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm text-foreground">
              Username
            </Label>
            <Input
              id="username"
              data-testid="input-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-foreground">
                  Full Name (Optional)
                </Label>
                <Input
                  id="fullName"
                  data-testid="input-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Password
            </Label>
            <Input
              id="password"
              data-testid="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            data-testid="button-auth-submit"
            className="w-full rounded-[28px]"
            size="lg"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>

          <button
            type="button"
            data-testid="button-toggle-auth"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </GlassCard>
    </div>
  </div>
</div>
  );
}
