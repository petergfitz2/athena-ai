import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

const executeTradeSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required").max(10),
  quantity: z.string().min(1, "Quantity is required"),
  orderType: z.enum(["market", "limit", "stop", "stop_limit"]),
  limitPrice: z.string().optional(),
  stopPrice: z.string().optional(),
  timeInForce: z.enum(["day", "gtc", "ioc", "fok"]),
});

type ExecuteTradeForm = z.infer<typeof executeTradeSchema>;

interface ExecuteTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "buy" | "sell";
  prefilledSymbol?: string;
}

export default function ExecuteTradeModal({ open, onOpenChange, action, prefilledSymbol }: ExecuteTradeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const form = useForm<ExecuteTradeForm>({
    resolver: zodResolver(executeTradeSchema),
    defaultValues: {
      symbol: "",
      quantity: "",
      orderType: "market",
      timeInForce: "day",
      limitPrice: "",
      stopPrice: "",
    },
  });

  // Pre-fill symbol if provided and handle ESC key
  useEffect(() => {
    if (prefilledSymbol && open) {
      setSearchSymbol(prefilledSymbol);
      setSelectedSymbol(prefilledSymbol);
      form.setValue("symbol", prefilledSymbol);
    }

    // Handle ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [prefilledSymbol, open, form, onOpenChange]);

  const orderType = form.watch("orderType");

  // Get quote for selected symbol
  const { data: quote } = useQuery<{
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
  }>({
    queryKey: ["/api/market/quote", selectedSymbol],
    enabled: !!selectedSymbol,
  });

  // Get portfolio summary for account balance
  const { data: portfolioSummary } = useQuery<{
    totalValue: number;
    cashBalance: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  }>({
    queryKey: ["/api/portfolio/summary"],
    enabled: open, // Only fetch when modal is open
  });

  const quantity = parseFloat(form.watch("quantity") || "0");
  const estimatedCost = quote && quantity ? quote.price * quantity : 0;
  const accountBalance = portfolioSummary?.cashBalance || 0;

  const handleSymbolSearch = () => {
    if (searchSymbol.trim()) {
      setSelectedSymbol(searchSymbol.toUpperCase());
      form.setValue("symbol", searchSymbol.toUpperCase());
    }
  };

  const onSubmit = async (data: ExecuteTradeForm) => {
    if (!quote) {
      toast({
        title: "Error",
        description: "Please search for a stock symbol first",
        variant: "destructive",
      });
      return;
    }

    // Validate sufficient funds for buy orders
    if (action === "buy" && estimatedCost > accountBalance) {
      toast({
        title: "Insufficient Funds",
        description: `You need $${estimatedCost.toFixed(2)} but only have $${accountBalance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiJson("POST", "/api/trades/execute", {
        symbol: data.symbol.toUpperCase(),
        action,
        quantity: parseFloat(data.quantity),
        orderType: data.orderType,
        limitPrice: data.limitPrice ? parseFloat(data.limitPrice) : undefined,
        stopPrice: data.stopPrice ? parseFloat(data.stopPrice) : undefined,
        timeInForce: data.timeInForce,
      });

      toast({
        title: "Trade Executed",
        description: `Successfully ${action === "buy" ? "bought" : "sold"} ${data.quantity} shares of ${data.symbol.toUpperCase()}`,
      });

      form.reset();
      setSelectedSymbol(null);
      setSearchSymbol("");
      onOpenChange(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute trade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-white/5 sm:max-w-lg bg-gradient-to-br from-[#0a0a0a] to-[#141414] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="space-y-2 px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-extralight text-white tracking-tight">
              {action === "buy" ? "Buy Stock" : "Sell Stock"}
            </DialogTitle>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-xs">
              Demo Trade
            </Badge>
          </div>
          <DialogDescription className="text-sm text-white/60 font-light">
            Execute a {action} order on the market
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {/* Stock Search */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/90 tracking-wide uppercase">
                Stock Symbol
              </label>
              <div className="flex gap-2">
                <Input
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol (e.g., AAPL)"
                  className="rounded-full bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-primary/50 focus:bg-white/8"
                  onKeyDown={(e) => e.key === "Enter" && handleSymbolSearch()}
                  data-testid="input-search-symbol"
                />
                <Button
                  type="button"
                  onClick={handleSymbolSearch}
                  className="rounded-full px-4 h-10 bg-primary hover:bg-primary/90"
                  data-testid="button-search-symbol"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quote Display */}
            {quote && selectedSymbol && (
              <div className="rounded-[20px] p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-light text-white">{selectedSymbol}</h3>
                    <p className="text-xs text-white/50 font-light">{quote.name || "Stock"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-light text-white">${quote.price.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 text-xs ${
                      quote.change >= 0 ? "text-success" : "text-destructive"
                    }`}>
                      {quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="font-medium">
                        {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-white/90 tracking-wide uppercase">Number of Shares</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.00000001"
                        placeholder="100"
                        className="rounded-full bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-primary/50 focus:bg-white/8"
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Type */}
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-white/90 tracking-wide uppercase">Order Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-full bg-white/5 border-white/20 text-white h-10 text-sm focus:border-primary/50" data-testid="select-order-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border-white/20 rounded-[20px]">
                        <SelectItem value="market" className="text-white">Market Order</SelectItem>
                        <SelectItem value="limit" className="text-white">Limit Order</SelectItem>
                        <SelectItem value="stop" className="text-white">Stop Order</SelectItem>
                        <SelectItem value="stop_limit" className="text-white">Stop-Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Limit Price (if limit or stop_limit) */}
              {(orderType === "limit" || orderType === "stop_limit") && (
                <FormField
                  control={form.control}
                  name="limitPrice"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-medium text-white/90 tracking-wide uppercase">Limit Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="rounded-full bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-primary/50 focus:bg-white/8"
                          data-testid="input-limit-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Stop Price (if stop or stop_limit) */}
              {(orderType === "stop" || orderType === "stop_limit") && (
                <FormField
                  control={form.control}
                  name="stopPrice"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-medium text-white/90 tracking-wide uppercase">Stop Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="rounded-full bg-white/5 border-white/20 text-white placeholder:text-white/30 h-10 text-sm focus:border-primary/50 focus:bg-white/8"
                          data-testid="input-stop-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Time in Force */}
              <FormField
                control={form.control}
                name="timeInForce"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-white/90 tracking-wide uppercase">Time in Force</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-full bg-white/5 border-white/20 text-white h-10 text-sm focus:border-primary/50" data-testid="select-time-in-force">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border-white/20 rounded-[20px]">
                        <SelectItem value="day" className="text-white">Day (Good for Day)</SelectItem>
                        <SelectItem value="gtc" className="text-white">GTC (Good Till Canceled)</SelectItem>
                        <SelectItem value="ioc" className="text-white">IOC (Immediate or Cancel)</SelectItem>
                        <SelectItem value="fok" className="text-white">FOK (Fill or Kill)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Preview */}
              {quote && quantity > 0 && (
                <div className="rounded-[20px] p-4 space-y-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Order Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Estimated {action === "buy" ? "Cost" : "Proceeds"}</span>
                      <span className="text-sm font-medium text-white">${estimatedCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Account Balance</span>
                      <span className="text-sm font-medium text-white">${accountBalance.toFixed(2)}</span>
                    </div>
                    {action === "buy" && (
                      <div className="flex justify-between items-center pt-2 border-t border-white/20">
                        <span className="text-sm text-white/60">Balance After</span>
                        <span className={`text-sm font-semibold ${
                          accountBalance - estimatedCost >= 0 ? "text-white" : "text-destructive"
                        }`}>
                          ${(accountBalance - estimatedCost).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Fixed Actions - Outside scrollable area */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/10 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1 rounded-full h-10 text-sm border-white/20 text-white hover:bg-white/5"
            data-testid="button-cancel-trade"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !selectedSymbol || !quantity}
            className={`flex-1 rounded-full h-10 text-sm font-medium ${
              action === "buy" 
                ? "bg-success hover:bg-success/90 text-white" 
                : "bg-destructive hover:bg-destructive/90 text-white"
            }`}
            data-testid="button-execute-trade"
          >
            {isSubmitting ? "Executing..." : action === "buy" ? "Buy" : "Sell"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
