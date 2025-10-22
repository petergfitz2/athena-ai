import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "./GlassCard";

interface AuthCardProps {
  onLogin?: (username: string, password: string) => void;
  onRegister?: (username: string, password: string) => void;
}

export default function AuthCard({ onLogin, onRegister }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin?.(username, password);
      console.log('Login triggered', { username });
    } else {
      onRegister?.(username, password);
      console.log('Register triggered', { username });
    }
  };

  return (
    <GlassCard className="w-full max-w-md">
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
          />
        </div>

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
          />
        </div>

        <Button
          type="submit"
          data-testid="button-auth-submit"
          className="w-full rounded-[28px]"
          size="lg"
        >
          {isLogin ? "Sign In" : "Create Account"}
        </Button>

        <button
          type="button"
          data-testid="button-toggle-auth"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </GlassCard>
  );
}
