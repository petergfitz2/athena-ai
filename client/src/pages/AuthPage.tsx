import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <GlassCard className="w-full max-w-md z-10">
        <div className="mb-8">
          <h1 className="text-5xl font-extralight text-foreground mb-2">Athena</h1>
          <p className="text-muted-foreground">
            Investing as easy as talking to a friend
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
  );
}
