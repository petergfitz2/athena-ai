import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface StockSearchBarProps {
  onSelectStock?: (symbol: string) => void;
  placeholder?: string;
  className?: string;
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function StockSearchBar({ 
  onSelectStock,
  placeholder = "Search stocks or companies (e.g., AAPL, Tesla)...",
  className = ""
}: StockSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mock company to ticker mappings
  const companyMappings: Record<string, string> = {
    "APPLE": "AAPL",
    "GOOGLE": "GOOGL", 
    "MICROSOFT": "MSFT",
    "AMAZON": "AMZN",
    "TESLA": "TSLA",
    "META": "META",
    "FACEBOOK": "META",
    "NVIDIA": "NVDA",
    "NETFLIX": "NFLX",
    "DISNEY": "DIS",
    "JPMORGAN": "JPM",
    "VISA": "V",
    "JOHNSON": "JNJ"
  };

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const upper = trimmed.toUpperCase();
    
    // Check if it's a direct ticker or company name
    let ticker = upper;
    if (upper.length > 5 || companyMappings[upper]) {
      ticker = companyMappings[upper] || upper;
    }

    // Generate mock results (in real app, this would be an API call)
    const mockResults: StockQuote[] = [];
    
    // If it matches a known ticker/company
    if (ticker.length <= 5) {
      mockResults.push({
        symbol: ticker,
        name: getCompanyName(ticker),
        price: 100 + Math.random() * 400,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 10
      });
    }

    // Add some related suggestions
    if (trimmed.toLowerCase().includes('tech')) {
      mockResults.push(
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.3, changePercent: 1.3 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 402.12, change: -1.5, changePercent: -0.4 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 3.2, changePercent: 2.3 }
      );
    }

    setSearchResults(mockResults);
    setShowResults(mockResults.length > 0);
  };

  const getCompanyName = (ticker: string): string => {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix Inc.',
      'DIS': 'The Walt Disney Company',
      'JPM': 'JPMorgan Chase & Co.',
      'V': 'Visa Inc.',
      'JNJ': 'Johnson & Johnson'
    };
    return names[ticker] || `${ticker} Corporation`;
  };

  const handleSelectStock = (stock: StockQuote) => {
    setShowResults(false);
    setQuery('');
    
    // Show toast with stock info
    toast({
      title: stock.symbol,
      description: (
        <div className="space-y-1">
          <p className="text-sm">{stock.name}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold">${stock.price.toFixed(2)}</span>
            <Badge variant={stock.change >= 0 ? 'default' : 'destructive'} className="text-xs">
              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Badge>
          </div>
        </div>
      ),
    });

    if (onSelectStock) {
      onSelectStock(stock.symbol);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="pl-12 pr-4 h-14 text-lg rounded-full bg-white/5 border-white/20 text-foreground placeholder:text-white/40 focus:border-primary focus:bg-white/8 transition-all"
          data-testid="input-stock-search"
        />
        {query && (
          <Button
            onClick={() => {
              setQuery('');
              setSearchResults([]);
              setShowResults(false);
            }}
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 z-50"
          >
            <Card className="bg-black/95 backdrop-blur-xl border-white/10 rounded-[20px] p-2 shadow-2xl">
              <div className="space-y-1">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full p-3 rounded-[16px] bg-white/5 hover:bg-white/10 transition-colors text-left"
                    data-testid={`stock-result-${stock.symbol}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{stock.symbol}</span>
                          <span className="text-sm text-white/60">{stock.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">
                          ${stock.price.toFixed(2)}
                        </span>
                        <Badge 
                          variant={stock.change >= 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          <div className="flex items-center gap-1">
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}