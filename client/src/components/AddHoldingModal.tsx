import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const addHoldingSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required").max(10).toUpperCase(),
  quantity: z.string().min(1, "Quantity is required"),
  averageCost: z.string().min(1, "Average cost is required"),
});

type AddHoldingForm = z.infer<typeof addHoldingSchema>;

interface AddHoldingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddHoldingModal({ open, onOpenChange }: AddHoldingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddHoldingForm>({
    resolver: zodResolver(addHoldingSchema),
    defaultValues: {
      symbol: "",
      quantity: "",
      averageCost: "",
    },
  });

  const onSubmit = async (data: AddHoldingForm) => {
    setIsSubmitting(true);
    
    try {
      await apiJson("POST", "/api/holdings", {
        userId: "", // Will be set by server from session
        symbol: data.symbol.toUpperCase(),
        quantity: data.quantity,
        averageCost: data.averageCost,
      });

      toast({
        title: "Holding Added",
        description: `Successfully added ${data.quantity} shares of ${data.symbol.toUpperCase()}`,
      });

      // Reset form and close modal
      form.reset();
      onOpenChange(false);
      
      // Refresh holdings and portfolio summary data
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add holding",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass rounded-[28px] border-white/10 sm:max-w-md max-h-[70vh] flex flex-col p-0">
        <DialogHeader className="space-y-1 px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl font-extralight text-foreground">
            Add Holding
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a stock to your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-foreground uppercase tracking-wide">Stock Symbol</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="AAPL"
                        className="rounded-full bg-white/5 border-white/10 text-foreground focus:ring-primary uppercase h-10 text-sm"
                        data-testid="input-symbol"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-foreground uppercase tracking-wide">Number of Shares</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.00000001"
                        placeholder="50"
                        className="rounded-full bg-white/5 border-white/10 text-foreground focus:ring-primary h-10 text-sm"
                        data-testid="input-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="averageCost"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-medium text-foreground uppercase tracking-wide">Average Cost Per Share</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        className="rounded-full bg-white/5 border-white/10 text-foreground focus:ring-primary h-10 text-sm"
                        data-testid="input-average-cost"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            className="flex-1 rounded-full h-10 text-sm"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 h-10 text-sm"
            data-testid="button-add-holding"
          >
            {isSubmitting ? "Adding..." : "Add Holding"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
