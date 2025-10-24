import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, shimmerAnimation } from "@/lib/animations";

export function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass rounded-[28px] p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MarketDataSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pb-3 border-b border-white/5 last:border-0">
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex items-start gap-3 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function AchievementsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
          <CardContent className="p-6 text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[28px]">
          <CardContent className="p-8">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Enhanced Skeleton with shimmer effect
export function ShimmerSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={shimmerAnimation}
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      <Skeleton
        {...props}
        className={cn(
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "bg-[length:200%_100%]",
          className
        )}
      />
    </motion.div>
  );
}

// Loading messages component with enhanced animation
export function LoadingMessage({ message }: { message?: string }) {
  const messages = [
    "Analyzing market trends...",
    "Calculating optimal strategies...",
    "Processing real-time data...",
    "Gathering AI insights...",
    "Loading investment opportunities...",
    "Fetching portfolio analytics..."
  ];

  const randomMessage = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center justify-center p-12"
    >
      <div className="text-center space-y-4">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-muted-foreground font-light"
        >
          {randomMessage}
        </motion.p>
      </div>
    </motion.div>
  );
}