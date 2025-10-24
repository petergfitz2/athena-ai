import { useState, useEffect, useCallback, useRef } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, TrendingUp, ShoppingCart, DollarSign, PieChart, FileText, Zap } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface CommandBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type CommandType = {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  keywords?: string[];
};

export default function CommandBar({ open, setOpen }: CommandBarProps) {
  const [search, setSearch] = useState('');
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent commands from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentCommands');
    if (stored) {
      setRecentCommands(JSON.parse(stored).slice(0, 3));
    }
  }, []);

  // Save command to recent
  const saveToRecent = (command: string) => {
    const updated = [command, ...recentCommands.filter(c => c !== command)].slice(0, 3);
    setRecentCommands(updated);
    localStorage.setItem('recentCommands', JSON.stringify(updated));
  };

  // Parse and execute command
  const executeCommand = useCallback((input: string) => {
    const trimmed = input.trim().toLowerCase();
    
    // Price check pattern: "aapl", "price aapl", "check aapl"
    const priceMatch = trimmed.match(/^(?:price |check |quote )?([\w]+)$/);
    if (priceMatch && priceMatch[1].length <= 5) {
      const ticker = priceMatch[1].toUpperCase();
      saveToRecent(`Price ${ticker}`);
      setLocation(`/trades?ticker=${ticker}`);
      toast({
        title: `Checking ${ticker}`,
        description: "Loading current market data...",
      });
      setOpen(false);
      return;
    }

    // Buy pattern: "buy 10 aapl", "buy aapl"
    const buyMatch = trimmed.match(/^buy\s+(\d+)?\s*(\w+)$/);
    if (buyMatch) {
      const quantity = buyMatch[1] || '1';
      const ticker = buyMatch[2].toUpperCase();
      saveToRecent(`Buy ${quantity} ${ticker}`);
      setLocation(`/trades?action=buy&ticker=${ticker}&quantity=${quantity}`);
      toast({
        title: `Buy Order: ${ticker}`,
        description: `Preparing order for ${quantity} shares...`,
      });
      setOpen(false);
      return;
    }

    // Sell pattern: "sell 10 aapl", "sell aapl"
    const sellMatch = trimmed.match(/^sell\s+(\d+)?\s*(\w+)$/);
    if (sellMatch) {
      const quantity = sellMatch[1] || '1';
      const ticker = sellMatch[2].toUpperCase();
      saveToRecent(`Sell ${quantity} ${ticker}`);
      setLocation(`/trades?action=sell&ticker=${ticker}&quantity=${quantity}`);
      toast({
        title: `Sell Order: ${ticker}`,
        description: `Preparing order for ${quantity} shares...`,
      });
      setOpen(false);
      return;
    }

    // Portfolio command
    if (trimmed === 'portfolio' || trimmed === 'holdings' || trimmed === 'positions') {
      saveToRecent('View Portfolio');
      setLocation('/portfolio');
      setOpen(false);
      return;
    }

    // Analytics command
    if (trimmed === 'analytics' || trimmed === 'analysis' || trimmed === 'performance') {
      saveToRecent('View Analytics');
      setLocation('/analytics');
      setOpen(false);
      return;
    }

    // If no pattern matches, show error
    toast({
      title: "Command not recognized",
      description: `Try: "Buy 10 AAPL", "Sell TSLA", "MSFT" for price, or "Portfolio"`,
      variant: "destructive",
    });
  }, [toast, setLocation, setOpen, recentCommands]);

  // Quick action commands
  const quickCommands: CommandType[] = [
    {
      id: 'portfolio',
      label: 'View Portfolio',
      icon: PieChart,
      action: () => {
        saveToRecent('View Portfolio');
        setLocation('/portfolio');
        setOpen(false);
      },
      keywords: ['holdings', 'positions', 'stocks'],
    },
    {
      id: 'trades',
      label: 'Trade Stocks',
      icon: ShoppingCart,
      action: () => {
        saveToRecent('Trade Stocks');
        setLocation('/trades');
        setOpen(false);
      },
      keywords: ['buy', 'sell', 'order'],
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: TrendingUp,
      action: () => {
        saveToRecent('View Analytics');
        setLocation('/analytics');
        setOpen(false);
      },
      keywords: ['performance', 'analysis', 'charts'],
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: FileText,
      action: () => {
        saveToRecent('View Watchlist');
        setLocation('/watchlist');
        setOpen(false);
      },
      keywords: ['watch', 'track', 'monitor'],
    },
  ];

  // Filter commands based on search
  const filteredCommands = quickCommands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return cmd.label.toLowerCase().includes(searchLower) ||
           cmd.keywords?.some(k => k.includes(searchLower));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 bg-black/95 backdrop-blur-xl border border-white/10">
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 h-4 w-4 text-white/40" />
            <CommandInput
              ref={inputRef}
              placeholder='Try "Buy 10 AAPL", "TSLA" for price, or "Portfolio"...'
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full bg-transparent py-3 text-sm text-white placeholder:text-white/40 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  e.preventDefault();
                  executeCommand(search);
                }
              }}
              data-testid="command-bar-input"
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/60">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>
          
          <CommandList className="max-h-[300px] overflow-y-auto">
            {!search && recentCommands.length > 0 && (
              <CommandGroup heading="Recent Commands" className="text-white/60">
                {recentCommands.map((cmd, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => {
                      setSearch(cmd);
                      executeCommand(cmd);
                    }}
                    className="text-white data-[selected=true]:bg-white/10"
                    data-testid={`recent-command-${idx}`}
                  >
                    <Zap className="mr-2 h-4 w-4 text-purple-400" />
                    {cmd}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {search && filteredCommands.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-white/40">
                Press Enter to execute "{search}"
              </CommandEmpty>
            )}

            {filteredCommands.length > 0 && (
              <CommandGroup heading="Quick Actions" className="text-white/60">
                {filteredCommands.map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={cmd.action}
                    className="text-white data-[selected=true]:bg-white/10"
                    data-testid={`command-${cmd.id}`}
                  >
                    <cmd.icon className="mr-2 h-4 w-4 text-purple-400" />
                    {cmd.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {search && (
              <CommandGroup heading="Command Examples" className="text-white/40 text-xs">
                <div className="px-2 py-1.5 space-y-1">
                  <div>• Buy 10 AAPL - Purchase Apple shares</div>
                  <div>• Sell TSLA - Sell Tesla holdings</div>
                  <div>• MSFT - Check Microsoft price</div>
                  <div>• Portfolio - View your holdings</div>
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}