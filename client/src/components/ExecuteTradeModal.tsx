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

  // Pre-fill symbol if provided
  useEffect(() => {
    if (prefilledSymbol && open) {
      setSearchSymbol(prefilledSymbol);
      setSelectedSymbol(prefilledSymbol);
      form.setValue("symbol", prefilledSymbol);
    }
  }, [prefilledSymbol, open, form]);

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

  const quantity = parseFloat(form.watch("quantity") || "0");
  const estimatedCost = quote && quantity ? quote.price * quantity : 0;
  const accountBalance = (user as any)?.accountBalance ? parseFloat((user as any).accountBalance) : 0;

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
      <DialogContent className="glass rounded-[28px] border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight text-foreground">
            {action === "buy" ? "Buy Stock" : "Sell Stock"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Execute a {action} order on the market
          </DialogDescription>
        </DialogHeader>

        {/* Stock Search */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-light text-foreground mb-2 block">
              Search Stock
            </label>
            <div className="flex gap-2">
              <Input
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g., AAPL)"
                className="rounded-full bg-card border-white/10 text-foreground placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleSymbolSearch()}
                data-testid="input-search-symbol"
              />
              <Button
                type="button"
                onClick={handleSymbolSearch}
                className="rounded-full px-6"
                data-testid="button-search-symbol"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quote Display */}
          {quote && selectedSymbol && (
            <div className="glass rounded-[28px] p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-light text-foreground">{selectedSymbol}</h3>
                  <p className="text-sm text-muted-foreground font-light">{quote.name || "Stock"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-foreground">${quote.price.toFixed(2)}</p>
                  <div className={`flex items-center gap-1 text-sm ${
                    quote.change >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="font-light">
                      {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-light">Number of Shares</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.00000001"
                      placeholder="100"
                      className="rounded-full bg-card border-white/10 text-foreground placeholder:text-muted-foreground/50"
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
                <FormItem>
                  <FormLabel className="text-foreground font-light">Order Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-full bg-card border-white/10 text-foreground" data-testid="select-order-type">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                      <SelectItem value="stop">Stop Order</SelectItem>
                      <SelectItem value="stop_limit">Stop-Limit Order</SelectItem>
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
                  <FormItem>
                    <FormLabel className="text-foreground font-light">Limit Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="rounded-full bg-card border-white/10 text-foreground placeholder:text-muted-foreground/50"
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
                  <FormItem>
                    <FormLabel className="text-foreground font-light">Stop Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="rounded-full bg-card border-white/10 text-foreground placeholder:text-muted-foreground/50"
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
                <FormItem>
                  <FormLabel className="text-foreground font-light">Time in Force</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-full bg-card border-white/10 text-foreground" data-testid="select-time-in-force">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="day">Day (Good for Day)</SelectItem>
                      <SelectItem value="gtc">GTC (Good Till Canceled)</SelectItem>
                      <SelectItem value="ioc">IOC (Immediate or Cancel)</SelectItem>
                      <SelectItem value="fok">FOK (Fill or Kill)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Preview */}
            {quote && quantity > 0 && (
              <div className="glass rounded-[28px] p-5 space-y-3 bg-primary/5">
                <h4 className="text-sm font-light text-muted-foreground uppercase tracking-wide">Order Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light">Estimated {action === "buy" ? "Cost" : "Proceeds"}</span>
                    <span className="text-foreground font-light">${estimatedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-light">Account Balance</span>
                    <span className="text-foreground font-light">${accountBalance.toFixed(2)}</span>
                  </div>
                  {action === "buy" && (
                    <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-muted-foreground font-light">Balance After</span>
                      <span className={`font-light ${
                        accountBalance - estimatedCost >= 0 ? "text-foreground" : "text-destructive"
                      }`}>
                        ${(accountBalance - estimatedCost).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-full"
                data-testid="button-cancel-trade"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedSymbol || !quantity}
                className={`flex-1 rounded-full ${
                  action === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
                }`}
                data-testid="button-execute-trade"
              >
                {isSubmitting ? "Executing..." : action === "buy" ? "Buy" : "Sell"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
