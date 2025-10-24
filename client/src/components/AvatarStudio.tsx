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

  // Fetch preset avatars from API
  const { data: presets = [], isLoading: presetsLoading } = useQuery<any[]>({
    queryKey: ['/api/avatars/presets'],
    enabled: open,
  });

  // Fetch user's avatar history
  const { data: history = [] } = useQuery<any[]>({
    queryKey: ['/api/avatars/history'],
    enabled: open,
  });

  // Select avatar mutation - use personaKey for presets
  const selectAvatar = useMutation({
    mutationFn: async (identifier: string) => {
      const response = await apiRequest('POST', `/api/avatars/${identifier}/select`);
      if (!response.ok) throw new Error('Failed to select avatar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/avatars/history'] });
      onClose();
    }
  });

  // Create custom avatar mutation
  const createCustom = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/avatars/custom', data);
      if (!response.ok) throw new Error('Failed to create custom avatar');
      return response.json();
    },
    onSuccess: (avatar) => {
      selectAvatar.mutate(avatar.id);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
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
            {presetsLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading avatars...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets?.map((avatar: any) => (
                  <Card 
                    key={avatar.personaKey} 
                    className="bg-white/5 border-white/10 hover-elevate cursor-pointer backdrop-blur-xl rounded-[28px] overflow-hidden"
                    onClick={() => selectAvatar.mutate(avatar.personaKey)}
                    data-testid={`card-preset-${avatar.personaKey}`}
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={avatar.imageUrl} 
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white">{avatar.name}</h3>
                        {avatar.personalityProfile.backstory && (
                          <p className="text-sm text-white/80 italic mt-1">
                            "{avatar.personalityProfile.backstory.split('.')[0]}."
                          </p>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {avatar.personalityProfile.backstory}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {avatar.personalityProfile.traits.map((trait: string) => (
                          <span key={trait} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {trait}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Trading Style:</span>
                        <span className="text-foreground capitalize font-medium">
                          {avatar.personalityProfile.tradingStyle}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                  <Label className="text-foreground font-medium">Trading Style</Label>
                  <RadioGroup value={tradingStyle} onValueChange={setTradingStyle} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="conservative" id="conservative" className="border-white/40 text-primary" />
                      <Label htmlFor="conservative" className="text-foreground font-normal cursor-pointer">Conservative - Focus on stability</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="balanced" id="balanced" className="border-white/40 text-primary" />
                      <Label htmlFor="balanced" className="text-foreground font-normal cursor-pointer">Balanced - Mix of growth and safety</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="aggressive" id="aggressive" className="border-white/40 text-primary" />
                      <Label htmlFor="aggressive" className="text-foreground font-normal cursor-pointer">Aggressive - High risk, high reward</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="analytical" id="analytical" className="border-white/40 text-primary" />
                      <Label htmlFor="analytical" className="text-foreground font-normal cursor-pointer">Analytical - Data-driven decisions</Label>
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