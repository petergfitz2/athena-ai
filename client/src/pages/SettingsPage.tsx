import { useState } from "react";
import { useAuth, ProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiJson, queryClient } from "@/lib/queryClient";
import { DollarSign, User, Bell, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";

function SettingsPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  
  const [profile, setProfile] = useState({
    fullName: user?.username || "",
    phone: "",
    emailNotifications: true,
    pushNotifications: false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      // Only send fields backend expects
      await apiJson("PATCH", "/api/user/profile", {
        fullName: profile.fullName,
        phone: profile.phone,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (!fundAmount || !Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setIsAddingFunds(true);
    try {
      await apiJson("POST", "/api/account/deposit", {
        amount: fundAmount,
      });
      
      // Invalidate portfolio queries to refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Funds Added",
        description: `$${fundAmount} has been added to your account`,
      });
      setFundAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiJson("PATCH", "/api/user/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      });
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight mb-4">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Funding */}
          <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-funding">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-light">Add Funds</CardTitle>
                  <CardDescription className="mt-1">Deposit money to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-foreground">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="1000.00"
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground mt-2"
                  data-testid="input-fund-amount"
                />
              </div>
              <Button
                onClick={handleAddFunds}
                disabled={isAddingFunds || !fundAmount}
                className="w-full rounded-full"
                data-testid="button-add-funds"
              >
                {isAddingFunds ? "Processing..." : "Add Funds"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Note: This is a demo. Real Stripe integration would be required for production.
              </p>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-profile">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-light">Profile</CardTitle>
                  <CardDescription className="mt-1">Update your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground mt-2"
                  data-testid="input-full-name"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground mt-2"
                  data-testid="input-phone"
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="w-full rounded-full"
                data-testid="button-save-profile"
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-notifications">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-light">Notifications</CardTitle>
                  <CardDescription className="mt-1">Manage notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive trade alerts via email</p>
                </div>
                <Switch
                  checked={profile.emailNotifications}
                  onCheckedChange={(checked) => setProfile({ ...profile, emailNotifications: checked })}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Get push notifications for updates</p>
                </div>
                <Switch
                  checked={profile.pushNotifications}
                  onCheckedChange={(checked) => setProfile({ ...profile, pushNotifications: checked })}
                  data-testid="switch-push-notifications"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-card border-white/10 rounded-[28px]" data-testid="card-security">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-light">Security</CardTitle>
                  <CardDescription className="mt-1">Password and security settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground mt-2"
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-[28px] bg-white/5 border-white/10 text-foreground mt-2"
                  data-testid="input-new-password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword}
                variant="outline"
                className="w-full rounded-full"
                data-testid="button-change-password"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
