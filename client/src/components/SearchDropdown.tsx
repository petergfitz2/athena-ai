import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, TrendingUp, TrendingDown, MessageCircle, Eye, ShoppingCart,
  Wallet, Sparkles, ArrowUpRight, Building2, Activity
} from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useChatContext } from "@/contexts/ChatContext";
import { useStockDetailModal } from "@/contexts/StockDetailModalContext";
import type { MarketQuote } from "@shared/schema";

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  type: "stock" | "etf" | "crypto";
}

interface SearchDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (symbol: string) => void;
}

// Mock search results for demo
const mockSearchResults: SearchResult[] = [
  { 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 178.45, 
    change: 2.34, 
    changePercent: 1.33, 
    volume: 54234567,
    marketCap: 2.8e12,
    type: "stock" 
  },
  { 
    symbol: "MSFT", 
    name: "Microsoft Corporation", 
    price: 378.91, 
    change: -1.23, 
    changePercent: -0.32, 
    volume: 23456789,
    marketCap: 2.9e12,
    type: "stock" 
  },
  { 
    symbol: "GOOGL", 
    name: "Alphabet Inc.", 
    price: 141.80, 
    change: 0.56, 
    changePercent: 0.40, 
    volume: 18765432,
    marketCap: 1.8e12,
    type: "stock" 
  },
  { 
    symbol: "TSLA", 
    name: "Tesla Inc.", 
    price: 242.84, 
    change: 5.67, 
    changePercent: 2.39, 
    volume: 87654321,
    marketCap: 770e9,
    type: "stock" 
  },
  { 
    symbol: "NVDA", 
    name: "NVIDIA Corporation", 
    price: 495.32, 
    change: 12.45, 
    changePercent: 2.58, 
    volume: 45678901,
    marketCap: 1.2e12,
    type: "stock" 
  },
];

export default function SearchDropdown({ 
  searchQuery, 
  isOpen, 
  onClose, 
  onResultClick 
}: SearchDropdownProps) {
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isQuestion, setIsQuestion] = useState(false);
  const [, setLocation] = useLocation();
  const { openPanelWithContext } = useChatContext();
  const { openModal } = useStockDetailModal();

  // Filter results based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Check if it's a question
    const questionStarters = ["what", "how", "why", "when", "should", "can", "is", "will"];
    const isQuestionQuery = questionStarters.some(starter => 
      query.startsWith(starter) || query.includes("?")
    );
    setIsQuestion(isQuestionQuery);

    // If it's a question, don't show stock results
    if (isQuestionQuery) {
      setFilteredResults([]);
      return;
    }

    // Filter stocks by symbol or name
    const filtered = mockSearchResults.filter(result => 
      result.symbol.toLowerCase().includes(query) ||
      result.name.toLowerCase().includes(query)
    ).slice(0, 6);

    setFilteredResults(filtered);
  }, [searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMarketCap = (value?: number) => {
    if (!value) return '';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
  };

  const handleViewDetails = (symbol: string) => {
    openModal(symbol);
    onClose();
  };

  const handleAskAthena = (result: SearchResult) => {
    const contextMessage = `Tell me about ${result.name} (${result.symbol})'s recent performance and whether it's a good investment opportunity.`;
    openPanelWithContext(contextMessage);
    onClose();
  };

  const handleQuestionClick = () => {
    openPanelWithContext(searchQuery);
    onClose();
  };

  if (!isOpen || !searchQuery.trim()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 z-50 mt-2"
      >
        <Card className="rounded-[28px] border-white/10 bg-black/95 backdrop-blur-xl p-0 shadow-2xl">
          <ScrollArea className="max-h-[500px]">
            {isQuestion ? (
              // Show suggestion to ask Athena for questions
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-light mb-2">Ask Athena</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      It looks like you have a question. Click below to ask Athena:
                    </p>
                    <p className="text-sm italic mb-4 text-foreground/80">"{searchQuery}"</p>
                    <Button
                      onClick={handleQuestionClick}
                      className="rounded-[20px] bg-primary hover:bg-primary/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask Athena
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : filteredResults.length > 0 ? (
              <div className="p-2">
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={result.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover-elevate rounded-[20px] cursor-pointer transition-all group"
                    onClick={() => handleViewDetails(result.symbol)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-medium">{result.symbol}</h4>
                          <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0">
                            {result.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-light">{formatCurrency(result.price)}</p>
                        <div className={`flex items-center gap-1 text-sm ${
                          result.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {result.change >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini sparkline placeholder */}
                    <div className="h-12 mb-3 rounded-lg bg-white/5 flex items-end px-2 py-1 gap-1">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/30 rounded-sm"
                          style={{
                            height: `${20 + Math.random() * 60}%`,
                            opacity: 0.3 + (i / 12) * 0.7
                          }}
                        />
                      ))}
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(result.symbol);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-3 text-xs text-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open buy modal
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-3 text-xs text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open sell modal
                        }}
                      >
                        <Wallet className="w-3 h-3 mr-1" />
                        Sell
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-3 text-xs text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskAthena(result);
                        }}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Ask Athena
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // No results found
              <div className="p-6 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No stocks found for "{searchQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 rounded-[20px]"
                  onClick={() => {
                    openPanelWithContext(`Help me find information about ${searchQuery}`);
                    onClose();
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask Athena for help
                </Button>
              </div>
            )}
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}