import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Bell,
  BellOff,
  BellRing,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Clock,
  Calendar,
  Mail,
  Smartphone,
  Settings,
  Filter,
  Archive,
  Trash2,
  Star,
  BookOpen,
  Trophy,
  Sparkles,
  Shield,
  Activity,
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from "lucide-react";

export interface Notification {
  id: string;
  type: "price_alert" | "portfolio_event" | "market_event" | "learning" | "ai_insight" | "achievement";
  priority: "urgent" | "normal" | "low";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  grouped?: string[];
}

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sound: boolean;
  groupSimilar: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    price_alert: boolean;
    portfolio_event: boolean;
    market_event: boolean;
    learning: boolean;
    ai_insight: boolean;
    achievement: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  inApp: true,
  email: false,
  push: false,
  sound: true,
  groupSimilar: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  categories: {
    price_alert: true,
    portfolio_event: true,
    market_event: true,
    learning: true,
    ai_insight: true,
    achievement: true,
  },
};

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "price_alert",
    priority: "urgent",
    title: "NVDA Hit Target Price",
    message: "NVDA reached your target price of $500. Consider taking profits.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    actionable: true,
    actionUrl: "/trades",
    actionLabel: "Trade Now",
    metadata: { symbol: "NVDA", price: 502.45, target: 500 },
  },
  {
    id: "n2",
    type: "ai_insight",
    priority: "normal",
    title: "Portfolio Optimization Opportunity",
    message: "Athena detected overconcentration in tech sector. Rebalancing could reduce risk by 15%.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    actionable: true,
    actionUrl: "/portfolio",
    actionLabel: "View Suggestion",
    metadata: { riskReduction: 15, sector: "Technology" },
  },
  {
    id: "n3",
    type: "achievement",
    priority: "low",
    title: "Achievement Unlocked!",
    message: "You've completed '7-Day Streak'. Keep up the great work!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    actionable: false,
    metadata: { achievementId: "streak-7", tier: "bronze" },
  },
  {
    id: "n4",
    type: "market_event",
    priority: "urgent",
    title: "Breaking: Fed Announces Rate Decision",
    message: "Federal Reserve keeps rates unchanged. Markets reacting positively.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actionable: true,
    actionUrl: "/market",
    actionLabel: "Read More",
    metadata: { impact: "positive" },
  },
  {
    id: "n5",
    type: "portfolio_event",
    priority: "normal",
    title: "Dividend Received",
    message: "You received $125.50 in dividends from AAPL.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
    actionable: false,
    metadata: { symbol: "AAPL", amount: 125.50 },
  },
  {
    id: "n6",
    type: "learning",
    priority: "low",
    title: "New Tutorial Available",
    message: "Learn advanced options strategies in our latest tutorial.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: false,
    actionable: true,
    actionUrl: "/tutorials",
    actionLabel: "Start Learning",
  },
];

export default function SmartNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Group similar notifications
  const groupNotifications = (notifs: Notification[]) => {
    if (!preferences.groupSimilar) return notifs;
    
    const grouped: Record<string, Notification[]> = {};
    const result: Notification[] = [];
    
    notifs.forEach(notif => {
      const key = `${notif.type}-${notif.priority}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(notif);
    });
    
    Object.values(grouped).forEach(group => {
      if (group.length > 2) {
        const first = group[0];
        result.push({
          ...first,
          title: `${group.length} ${first.type.replace('_', ' ')} notifications`,
          grouped: group.map(n => n.id),
        });
      } else {
        result.push(...group);
      }
    });
    
    return result;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_alert": return TrendingUp;
      case "portfolio_event": return DollarSign;
      case "market_event": return Activity;
      case "learning": return BookOpen;
      case "ai_insight": return Sparkles;
      case "achievement": return Trophy;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-destructive";
      case "normal": return "text-primary";
      case "low": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "normal": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "All cleared",
      description: "All notifications have been removed.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "unread" && notif.read) return false;
    if (selectedFilter && notif.type !== selectedFilter) return false;
    return preferences.categories[notif.type];
  });

  const displayNotifications = groupNotifications(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional new notifications
      if (Math.random() > 0.7) {
        const types: Notification["type"][] = ["price_alert", "ai_insight", "market_event"];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const newNotif: Notification = {
          id: `n${Date.now()}`,
          type,
          priority: Math.random() > 0.5 ? "normal" : "urgent",
          title: "New Alert",
          message: "This is a simulated notification for demo purposes.",
          timestamp: new Date(),
          read: false,
          actionable: Math.random() > 0.5,
        };
        
        if (preferences.inApp) {
          toast({
            title: newNotif.title,
            description: newNotif.message,
          });
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [preferences.inApp, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-6 h-6 text-primary" />
              <span className="font-light">Notifications Center</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={unreadCount === 0}
                data-testid="button-mark-all-read"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="rounded-full"
                data-testid="button-notification-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardHeader>
            <CardTitle className="font-light">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Methods */}
            <div>
              <h3 className="font-medium mb-4">Delivery Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">In-App Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.inApp}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, inApp: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Email Digest</span>
                  </div>
                  <Switch
                    checked={preferences.email}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Push Notifications</span>
                  </div>
                  <Switch
                    checked={preferences.push}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {preferences.sound ? (
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Sound Alerts</span>
                  </div>
                  <Switch
                    checked={preferences.sound}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, sound: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <h3 className="font-medium mb-4">Notification Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(preferences.categories).map(([key, enabled]) => {
                  const Icon = getNotificationIcon(key);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm">{key.replace('_', ' ')}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setPreferences(prev => ({
                            ...prev,
                            categories: { ...prev.categories, [key]: checked },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div>
              <h3 className="font-medium mb-4">Quiet Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Enable Quiet Hours</span>
                  </div>
                  <Switch
                    checked={preferences.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked },
                      }))
                    }
                  />
                </div>
                {preferences.quietHours.enabled && (
                  <div className="flex items-center gap-4 pl-7">
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) =>
                        setPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value },
                        }))
                      }
                      className="bg-white/10 rounded px-3 py-1 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) =>
                        setPreferences(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value },
                        }))
                      }
                      className="bg-white/10 rounded px-3 py-1 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] mx-auto h-auto p-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
          <TabsTrigger value="all" className="rounded-full py-3" data-testid="tab-all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-full py-3" data-testid="tab-unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setSelectedFilter(null)}
            variant={selectedFilter === null ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            All Types
          </Button>
          {Object.keys(preferences.categories).map((type) => {
            const Icon = getNotificationIcon(type);
            return (
              <Button
                key={type}
                onClick={() => setSelectedFilter(type)}
                variant={selectedFilter === type ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                data-testid={`filter-${type}`}
              >
                <Icon className="w-3 h-3 mr-2" />
                {type.replace('_', ' ')}
              </Button>
            );
          })}
        </div>

        {/* Notifications List */}
        <TabsContent value={activeTab}>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardContent className="pt-6">
              <ScrollArea className="h-[600px] pr-4">
                {displayNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {displayNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 rounded-[16px] transition-all",
                            notification.read ? "bg-white/5" : "bg-primary/10 border border-primary/20"
                          )}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              notification.read ? "bg-white/10" : "bg-primary/20"
                            )}>
                              <Icon className={cn(
                                "w-5 h-5",
                                notification.read ? "text-muted-foreground" : "text-primary"
                              )} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className={cn(
                                  "font-medium",
                                  notification.read && "text-muted-foreground"
                                )}>
                                  {notification.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={getPriorityBadge(notification.priority) as any}
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className={cn(
                                "text-sm mb-2",
                                notification.read ? "text-muted-foreground" : "text-foreground"
                              )}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {notification.actionable && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle action
                                    }}
                                  >
                                    {notification.actionLabel || "View"}
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </div>

                              {notification.grouped && notification.grouped.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <button className="text-xs text-primary hover:underline">
                                    View {notification.grouped.length} grouped notifications
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "unread" ? "You're all caught up!" : "Your notification center is empty"}
                    </p>
                  </div>
                )}
              </ScrollArea>
              
              {displayNotifications.length > 0 && (
                <div className="flex justify-center mt-4 pt-4 border-t border-white/10">
                  <Button
                    onClick={clearAll}
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    data-testid="button-clear-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}