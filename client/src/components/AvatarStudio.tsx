import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Sparkles, Check } from "lucide-react";

interface AvatarStudioProps {
  open: boolean;
  onClose: () => void;
}

export default function AvatarStudio({ open, onClose }: AvatarStudioProps) {
  const [customName, setCustomName] = useState("");
  const [personality, setPersonality] = useState("");
  const [tradingStyle, setTradingStyle] = useState("balanced");
  const [appearance, setAppearance] = useState("");

  // Fetch preset avatars
  const { data: presets } = useQuery({
    queryKey: ['/api/avatars/presets'],
    enabled: open,
  });

  // Fetch user's avatar history
  const { data: history } = useQuery({
    queryKey: ['/api/avatars/history'],
    enabled: open,
  });

  // Select avatar mutation
  const selectAvatar = useMutation({
    mutationFn: (avatarId: string) => 
      apiRequest(`/api/avatars/${avatarId}/select`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    }
  });

  // Create custom avatar mutation
  const createCustom = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/avatars/custom', { 
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (avatar) => {
      selectAvatar.mutate(avatar.id);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight">
            Avatar Studio
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="presets" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full bg-white/5">
            <TabsTrigger value="presets" data-testid="tab-preset-avatars">Preset Avatars</TabsTrigger>
            <TabsTrigger value="custom" data-testid="tab-create-custom">Create Custom</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-my-avatars">My Avatars</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              {presets?.map((avatar: any) => (
                <Card 
                  key={avatar.id} 
                  className="bg-white/5 border-white/10 hover-elevate cursor-pointer backdrop-blur-xl rounded-[28px]"
                  onClick={() => selectAvatar.mutate(avatar.id)}
                  data-testid={`card-preset-${avatar.personaKey}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{avatar.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {avatar.personalityProfile.backstory}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {avatar.personalityProfile.traits.map((trait: string) => (
                        <span key={trait} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      Trading Style: <span className="text-foreground capitalize">
                        {avatar.personalityProfile.tradingStyle}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 mt-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px]">
              <CardHeader>
                <CardTitle>Design Your AI Advisor</CardTitle>
                <CardDescription>
                  Create a custom avatar with unique personality traits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Avatar Name</Label>
                  <Input 
                    id="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Morgan Blake"
                    className="mt-1 bg-white/5 border-white/10"
                    data-testid="input-avatar-name"
                  />
                </div>

                <div>
                  <Label htmlFor="personality">Personality Traits</Label>
                  <Textarea
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Describe the personality: confident, analytical, friendly, experienced..."
                    className="mt-1 bg-white/5 border-white/10"
                    rows={3}
                    data-testid="input-personality-traits"
                  />
                </div>

                <div>
                  <Label>Trading Style</Label>
                  <RadioGroup value={tradingStyle} onValueChange={setTradingStyle} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conservative" id="conservative" />
                      <Label htmlFor="conservative">Conservative - Focus on stability</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <Label htmlFor="balanced">Balanced - Mix of growth and safety</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aggressive" id="aggressive" />
                      <Label htmlFor="aggressive">Aggressive - High risk, high reward</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="analytical" id="analytical" />
                      <Label htmlFor="analytical">Analytical - Data-driven decisions</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="appearance">Visual Style (Optional)</Label>
                  <Input
                    id="appearance"
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    placeholder="e.g., professional, modern, approachable"
                    className="mt-1 bg-white/5 border-white/10"
                    data-testid="input-visual-style"
                  />
                </div>

                <Button 
                  onClick={() => createCustom.mutate({ 
                    name: customName, 
                    personality, 
                    tradingStyle, 
                    appearance 
                  })}
                  disabled={!personality || createCustom.isPending}
                  className="w-full rounded-[28px]"
                  data-testid="button-create-custom-avatar"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Custom Avatar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {history?.length === 0 ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px] text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">
                    No custom avatars created yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {history?.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="bg-white/5 border-white/10 hover-elevate cursor-pointer backdrop-blur-xl rounded-[28px]"
                    onClick={() => selectAvatar.mutate(item.avatarId)}
                    data-testid={`card-history-${item.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{item.avatar?.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Created {new Date(item.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    {item.isActive && (
                      <CardContent>
                        <div className="flex items-center gap-2 text-primary">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Currently Active</span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}