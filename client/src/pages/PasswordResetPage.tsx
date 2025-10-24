import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { KeyRound, CheckCircle, XCircle } from "lucide-react";

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  // Extract token from URL query params
  const token = new URLSearchParams(searchParams).get('token');

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reset password");
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully!",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/");
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        setInvalidToken(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[100px]" />
      </div>
      
      <div className="relative z-10 p-8">
        <GlassCard className="w-full max-w-md">
          {invalidToken ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-light text-foreground mb-4">
                  Invalid or Expired Link
                </h2>
                <p className="text-muted-foreground mb-6">
                  This password reset link is invalid or has expired. Please request a new password reset.
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="rounded-[28px]"
                  size="lg"
                >
                  Back to Login
                </Button>
              </div>
            </>
          ) : success ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-light text-foreground mb-4">
                  Password Reset Successful
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been reset successfully. Redirecting to login...
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-light text-foreground mb-2 text-center">
                  Reset Your Password
                </h2>
                <p className="text-muted-foreground text-center text-sm">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-[28px]"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}