import { useState, useRef } from "react";
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
import { User, Sparkles, Check, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarStudioProps {
  open: boolean;
  onClose: () => void;
}

export default function AvatarStudio({ open, onClose }: AvatarStudioProps) {
  const [customName, setCustomName] = useState("");
  const [personality, setPersonality] = useState("");
  const [tradingStyle, setTradingStyle] = useState("balanced");
  const [appearance, setAppearance] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create custom avatar mutation with image upload
  const createCustom = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('personality', data.personality);
      formData.append('tradingStyle', data.tradingStyle);
      formData.append('appearance', data.appearance || '');
      
      if (avatarImage) {
        formData.append('avatar', avatarImage);
      }
      
      const response = await fetch('/api/avatars/custom', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to create custom avatar');
      return response.json();
    },
    onSuccess: (avatar) => {
      queryClient.invalidateQueries({ queryKey: ['/api/avatars/active'] });
      setCustomName("");
      setPersonality("");
      setTradingStyle("balanced");
      setAppearance("");
      setAvatarImage(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      selectAvatar.mutate(avatar.id);
      toast({
        title: "Avatar created!",
        description: "Your custom avatar has been created and selected.",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto !bg-black border-white/10 !text-white" 
        style={{ 
          zIndex: 9999,
          backgroundColor: '#000000',
          color: 'white',
          pointerEvents: 'auto'
        }}>
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
                    className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[28px] overflow-hidden"
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
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Trading Style:</span>
                          <span className="text-foreground capitalize font-medium">
                            {avatar.personalityProfile.tradingStyle}
                          </span>
                        </div>
                        {avatar.personalityProfile.catchphrase && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="italic text-primary/80 text-xs">
                              "{avatar.personalityProfile.catchphrase}"
                            </p>
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-4 rounded-[28px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAvatar.mutate(avatar.personaKey);
                        }}
                        disabled={selectAvatar.isPending}
                        data-testid={`button-select-${avatar.personaKey}`}
                      >
                        Select {avatar.name.split(' ')[0]}
                      </Button>
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
                  <Label htmlFor="avatar-image">Avatar Image</Label>
                  <div className="mt-1 space-y-2">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img 
                          src={imagePreview} 
                          alt="Avatar preview" 
                          className="w-full h-full rounded-full object-cover border-2 border-white/20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                          onClick={() => {
                            setAvatarImage(null);
                            setImagePreview("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 mx-auto border-2 border-dashed border-white/20 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-white/40 mb-2" />
                        <span className="text-xs text-white/60">Upload Image</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-avatar-image"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      JPEG, PNG, or GIF up to 5MB
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-white">Avatar Name</Label>
                  <Input 
                    id="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Morgan Blake"
                    className="mt-1 !bg-white/5 border-white/10 !text-white placeholder:!text-white/40 focus:!bg-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    data-testid="input-avatar-name"
                  />
                </div>

                <div>
                  <Label htmlFor="personality" className="text-white">Personality Description</Label>
                  <Textarea
                    id="personality"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="Describe their personality and background. Example: Former hedge fund manager who made millions in the 2008 crash. Speaks with confidence and uses market metaphors. Loves to share war stories from trading floors..."
                    className="mt-1 !bg-white/5 border-white/10 !text-white placeholder:!text-white/40 focus:!bg-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
                    rows={4}
                    data-testid="input-personality-traits"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will shape how your advisor speaks to you - their jokes, greetings, and investing philosophy
                  </p>
                </div>

                <div>
                  <Label className="text-white font-medium">Trading Style</Label>
                  <RadioGroup value={tradingStyle} onValueChange={setTradingStyle} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="conservative" id="conservative" className="border-white/40 text-primary" />
                      <Label htmlFor="conservative" className="text-white font-normal cursor-pointer">Conservative - Focus on stability</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="balanced" id="balanced" className="border-white/40 text-primary" />
                      <Label htmlFor="balanced" className="text-white font-normal cursor-pointer">Balanced - Mix of growth and safety</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="aggressive" id="aggressive" className="border-white/40 text-primary" />
                      <Label htmlFor="aggressive" className="text-white font-normal cursor-pointer">Aggressive - High risk, high reward</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <RadioGroupItem value="analytical" id="analytical" className="border-white/40 text-primary" />
                      <Label htmlFor="analytical" className="text-white font-normal cursor-pointer">Analytical - Data-driven decisions</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="appearance" className="text-white">Visual Style (Optional)</Label>
                  <Input
                    id="appearance"
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    placeholder="e.g., professional, modern, approachable"
                    className="mt-1 !bg-white/5 border-white/10 !text-white placeholder:!text-white/40 focus:!bg-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}
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
                  style={{ position: 'relative', zIndex: 20 }}
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