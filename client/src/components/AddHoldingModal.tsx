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
      
      // Refresh holdings data
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
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
      <DialogContent className="glass rounded-[28px] border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight text-foreground">
            Add Holding
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a stock to your portfolio
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Stock Symbol</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="AAPL"
                      className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary uppercase"
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
                <FormItem>
                  <FormLabel className="text-foreground">Number of Shares</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.00000001"
                      placeholder="50"
                      className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
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
                <FormItem>
                  <FormLabel className="text-foreground">Average Cost Per Share</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      className="rounded-[28px] bg-white/5 border-white/10 text-foreground focus:ring-primary"
                      data-testid="input-average-cost"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-full"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-primary hover:bg-primary/90"
                data-testid="button-add-holding"
              >
                {isSubmitting ? "Adding..." : "Add Holding"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
