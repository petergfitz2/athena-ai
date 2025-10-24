import { cn } from "@/lib/utils";
import { useStockDetailModal } from "@/contexts/StockDetailModalContext";

interface TickerLinkProps {
  symbol: string;
  className?: string;
  showDollarSign?: boolean;
  variant?: 'default' | 'badge' | 'inline' | 'large';
  children?: React.ReactNode;
}

export function TickerLink({ 
  symbol, 
  className, 
  showDollarSign = false,
  variant = 'default',
  children 
}: TickerLinkProps) {
  const { openModal } = useStockDetailModal();
  
  const baseStyles = "text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer font-medium";
  
  const variantStyles = {
    default: "text-sm",
    badge: "px-2 py-0.5 bg-primary/10 rounded-full text-xs",
    inline: "text-inherit",
    large: "text-base"
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(symbol);
  };
  
  return (
    <button
      onClick={handleClick}
      className={cn(baseStyles, variantStyles[variant], className)}
      data-testid={`ticker-${symbol}`}
      type="button"
    >
      {showDollarSign && '$'}{children || symbol}
    </button>
  );
}