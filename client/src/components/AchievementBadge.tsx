import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Shield,
  Target,
  Medal,
  Award,
  Crown,
  Zap,
  Lock
} from "lucide-react";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementStatus = "locked" | "in-progress" | "unlocked";

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: AchievementTier;
  status: AchievementStatus;
  progress?: number;
  maxProgress?: number;
  icon?: any;
  earnedDate?: Date;
  className?: string;
  onClick?: () => void;
}

const tierColors = {
  bronze: "from-orange-600 to-orange-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600",
};

const tierBorders = {
  bronze: "border-orange-600/50",
  silver: "border-gray-400/50",
  gold: "border-yellow-400/50",
  platinum: "border-purple-400/50",
};

const tierIcons = {
  bronze: Medal,
  silver: Award,
  gold: Trophy,
  platinum: Crown,
};

export default function AchievementBadge({
  id,
  name,
  description,
  category,
  tier,
  status,
  progress = 0,
  maxProgress = 100,
  icon,
  earnedDate,
  className,
  onClick,
}: AchievementBadgeProps) {
  const TierIcon = tierIcons[tier];
  const Icon = icon || Star;
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-[20px] border transition-all cursor-pointer",
        status === "unlocked"
          ? `bg-gradient-to-br ${tierColors[tier]} ${tierBorders[tier]} hover:scale-105`
          : status === "in-progress"
          ? "bg-card/50 border-white/10 hover:bg-card/70"
          : "bg-black/40 border-white/5 opacity-60 hover:opacity-80",
        className
      )}
      data-testid={`achievement-${id}`}
    >
      {/* Lock Overlay for Locked Achievements */}
      {status === "locked" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[20px]">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Achievement Content */}
      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          status === "unlocked"
            ? "bg-white/20 backdrop-blur-xl"
            : "bg-white/10"
        )}>
          {status === "unlocked" ? (
            <TierIcon className="w-8 h-8 text-white" />
          ) : (
            <Icon className="w-8 h-8 text-white/60" />
          )}
        </div>

        {/* Achievement Details */}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className={cn(
              "font-medium",
              status === "unlocked" ? "text-white" : "text-foreground"
            )}>
              {name}
            </h3>
            <p className={cn(
              "text-sm",
              status === "unlocked" ? "text-white/80" : "text-muted-foreground"
            )}>
              {description}
            </p>
          </div>

          {/* Progress Bar for In-Progress Achievements */}
          {status === "in-progress" && maxProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary">
                  {progress}/{maxProgress}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Category and Earned Date */}
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "unlocked" ? "secondary" : "outline"}
              className="text-xs"
            >
              {category}
            </Badge>
            {earnedDate && (
              <span className="text-xs text-white/60">
                Earned {earnedDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tier Indicator */}
      {status === "unlocked" && (
        <div className="absolute top-2 right-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/20 backdrop-blur-xl"
          )}>
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Unlock Animation Placeholder */}
      {status === "unlocked" && earnedDate && 
       new Date().getTime() - earnedDate.getTime() < 5000 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-ping absolute inset-0 rounded-[20px] bg-white opacity-20" />
        </div>
      )}
    </div>
  );
}