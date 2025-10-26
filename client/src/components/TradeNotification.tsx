import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TradeNotification {
  id: string;
  type: "success" | "error" | "pending" | "warning";
  action: "buy" | "sell";
  symbol: string;
  quantity: number;
  price: number;
  message: string;
  timestamp: Date;
}

interface TradeNotificationProps {
  notification: TradeNotification | null;
  onDismiss: () => void;
}

export function TradeNotification({ notification, onDismiss }: TradeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-dismiss after 5 seconds for success/warning
      if (notification.type === "success" || notification.type === "warning") {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300); // Wait for animation to complete
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "pending":
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (notification.type) {
      case "success":
        return "from-green-500/20 to-green-500/5 border-green-500/20 text-green-500";
      case "error":
        return "from-red-500/20 to-red-500/5 border-red-500/20 text-red-500";
      case "warning":
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-500";
      case "pending":
        return "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500";
    }
  };

  const getActionIcon = () => {
    return notification.action === "buy" ? 
      <TrendingUp className="w-4 h-4" /> : 
      <TrendingDown className="w-4 h-4" />;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-24 right-6 z-50 max-w-md"
        >
          <div className={cn(
            "rounded-[20px] p-4 bg-gradient-to-br backdrop-blur-2xl border shadow-2xl",
            getStatusColor()
          )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-white/10", getStatusColor())}>
                  {getIcon()}
                </div>
                <div>
                  <h3 className="font-medium text-white flex items-center gap-2">
                    Trade {notification.type === "pending" ? "Processing" : 
                           notification.type === "success" ? "Executed" :
                           notification.type === "error" ? "Failed" : "Warning"}
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", 
                        notification.action === "buy" ? 
                          "bg-green-500/10 border-green-500/20" : 
                          "bg-red-500/10 border-red-500/20"
                      )}
                    >
                      {getActionIcon()}
                      {notification.action.toUpperCase()}
                    </Badge>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {notification.type !== "pending" && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onDismiss, 300);
                  }}
                  className="text-white/40 hover:text-white/60 transition-colors"
                  data-testid="button-dismiss-notification"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Trade Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span className="text-sm text-white/80">{notification.symbol}</span>
                <span className="text-sm font-medium text-white">
                  {notification.quantity} shares @ ${notification.price.toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm text-white/70">
                {notification.message}
              </p>

              {notification.type === "success" && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-1 rounded-full bg-gradient-to-r from-green-500 to-green-400 mt-3"
                />
              )}

              {notification.type === "pending" && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <span className="text-xs text-white/60">Processing...</span>
                </div>
              )}
            </div>

            {/* Total Value */}
            {notification.type === "success" && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Total Value</span>
                  <span className="text-lg font-light text-white">
                    ${(notification.quantity * notification.price).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing trade notifications
export function useTradeNotifications() {
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<TradeNotification | null>(null);

  const addNotification = (notification: Omit<TradeNotification, "id" | "timestamp">) => {
    const newNotification: TradeNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);
    setCurrentNotification(newNotification);
  };

  const dismissCurrent = () => {
    setCurrentNotification(null);
  };

  const showPendingTrade = (symbol: string, action: "buy" | "sell", quantity: number, price: number) => {
    addNotification({
      type: "pending",
      action,
      symbol,
      quantity,
      price,
      message: `Processing ${action} order for ${symbol}...`,
    });
  };

  const showTradeSuccess = (symbol: string, action: "buy" | "sell", quantity: number, price: number) => {
    addNotification({
      type: "success",
      action,
      symbol,
      quantity,
      price,
      message: `Successfully ${action === "buy" ? "bought" : "sold"} ${quantity} shares of ${symbol}`,
    });
  };

  const showTradeError = (symbol: string, action: "buy" | "sell", quantity: number, price: number, error: string) => {
    addNotification({
      type: "error",
      action,
      symbol,
      quantity,
      price,
      message: error,
    });
  };

  return {
    currentNotification,
    notifications,
    showPendingTrade,
    showTradeSuccess,
    showTradeError,
    dismissCurrent,
  };
}