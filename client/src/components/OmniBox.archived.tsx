import { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare, 
  TrendingUp, 
  ShoppingCart,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OmniBoxProps {
  onSendMessage: (message: string) => void;
  onExecuteCommand?: (command: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

type IntentType = 'ticker' | 'command' | 'question' | 'ambiguous';

interface Intent {
  type: IntentType;
  confidence: number;
  value?: string;
  suggestions?: string[];
}

export default function OmniBox({ 
  onSendMessage, 
  onExecuteCommand,
  isLoading = false,
  placeholder = "Search stocks, ask questions, or type commands..."
}: OmniBoxProps) {
  const [input, setInput] = useState('');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [showDisambiguation, setShowDisambiguation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Common stock tickers for detection
  const commonTickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
  
  // Detect intent from input
  const detectIntent = useCallback((text: string): Intent => {
    const trimmed = text.trim();
    const upper = trimmed.toUpperCase();
    
    // Empty input
    if (!trimmed) {
      return { type: 'ambiguous', confidence: 0 };
    }

    // Check if it's a stock ticker (2-5 uppercase letters)
    if (/^[A-Z]{2,5}$/.test(upper) && commonTickers.includes(upper)) {
      return { 
        type: 'ticker', 
        confidence: 0.95, 
        value: upper 
      };
    }

    // Check for explicit commands
    if (trimmed.toLowerCase().startsWith('buy ')) {
      return { 
        type: 'command', 
        confidence: 0.9, 
        value: 'buy',
        suggestions: ['Execute buy order', 'Ask advisor about buying']
      };
    }

    if (trimmed.toLowerCase().startsWith('sell ')) {
      return { 
        type: 'command', 
        confidence: 0.9, 
        value: 'sell',
        suggestions: ['Execute sell order', 'Ask advisor about selling']
      };
    }

    if (trimmed.toLowerCase() === 'portfolio' || trimmed.toLowerCase() === 'holdings') {
      return { 
        type: 'command', 
        confidence: 0.95, 
        value: 'portfolio' 
      };
    }

    // Check for price/quote requests
    if (/^(price|quote|check)\s+[A-Z]{2,5}$/i.test(trimmed)) {
      const ticker = trimmed.split(' ').pop()?.toUpperCase();
      return { 
        type: 'ticker', 
        confidence: 0.9, 
        value: ticker 
      };
    }

    // Check if it's a potential ticker but not in common list (ambiguous)
    if (/^[A-Z]{2,5}$/.test(upper)) {
      return { 
        type: 'ambiguous', 
        confidence: 0.5,
        suggestions: [`Check ${upper} stock price`, `Ask about ${upper}`, `Search for "${upper}"`]
      };
    }

    // Check for question patterns
    const questionPatterns = [
      /^(what|how|why|when|where|who|should|can|will|is|are)/i,
      /\?$/,
      /tell me about/i,
      /explain/i,
      /help/i
    ];

    if (questionPatterns.some(pattern => pattern.test(trimmed))) {
      return { 
        type: 'question', 
        confidence: 0.85 
      };
    }

    // Default to question/conversation for longer text
    if (trimmed.split(' ').length > 2) {
      return { 
        type: 'question', 
        confidence: 0.7 
      };
    }

    // Ambiguous single words
    return { 
      type: 'ambiguous', 
      confidence: 0.3,
      suggestions: [`Search for "${trimmed}"`, `Ask about "${trimmed}"`]
    };
  }, [commonTickers]);

  // Update intent as user types
  useEffect(() => {
    const detectedIntent = detectIntent(input);
    setIntent(detectedIntent);
    setShowDisambiguation(detectedIntent.type === 'ambiguous' && detectedIntent.confidence < 0.6);
  }, [input, detectIntent]);

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent, forcedIntent?: string) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const currentIntent = intent || detectIntent(input);
    const finalIntent = forcedIntent || currentIntent.type;

    switch (finalIntent) {
      case 'ticker':
        // Navigate to stock details or show stock card
        const ticker = currentIntent.value || input.trim().toUpperCase();
        toast({
          title: `Checking ${ticker}`,
          description: "Loading stock information...",
        });
        setLocation(`/trades?ticker=${ticker}`);
        break;

      case 'command':
        // Execute command
        if (onExecuteCommand) {
          onExecuteCommand(input);
        } else {
          handleCommand(input);
        }
        break;

      case 'question':
      default:
        // Send to AI chat
        onSendMessage(input);
        break;
    }

    setInput('');
    setShowDisambiguation(false);
  };

  // Handle specific commands
  const handleCommand = (command: string) => {
    const lower = command.toLowerCase();
    
    if (lower.startsWith('buy ')) {
      const parts = lower.split(' ');
      const ticker = parts[parts.length - 1].toUpperCase();
      const quantity = parts[1] && !isNaN(parseInt(parts[1])) ? parts[1] : '1';
      setLocation(`/trades?action=buy&ticker=${ticker}&quantity=${quantity}`);
    } else if (lower.startsWith('sell ')) {
      const parts = lower.split(' ');
      const ticker = parts[parts.length - 1].toUpperCase();
      const quantity = parts[1] && !isNaN(parseInt(parts[1])) ? parts[1] : '1';
      setLocation(`/trades?action=sell&ticker=${ticker}&quantity=${quantity}`);
    } else if (lower === 'portfolio' || lower === 'holdings') {
      setLocation('/portfolio');
    } else if (lower === 'analytics' || lower === 'performance') {
      setLocation('/analytics');
    } else {
      // Fallback to chat
      onSendMessage(command);
    }
  };

  // Get intent icon
  const getIntentIcon = () => {
    if (!intent || intent.confidence < 0.3) return <Search className="w-4 h-4" />;
    
    switch (intent.type) {
      case 'ticker':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'command':
        return <Command className="w-4 h-4 text-blue-400" />;
      case 'question':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Get intent label
  const getIntentLabel = () => {
    if (!intent || intent.confidence < 0.5) return null;
    
    switch (intent.type) {
      case 'ticker':
        return <Badge variant="outline" className="text-xs">Stock</Badge>;
      case 'command':
        return <Badge variant="outline" className="text-xs">Command</Badge>;
      case 'question':
        return <Badge variant="outline" className="text-xs">Question</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Intent Icon */}
          <div className="absolute left-3 text-white/40">
            {getIntentIcon()}
          </div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-24 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-[28px] text-sm"
            disabled={isLoading}
            data-testid="omnibox-input"
          />

          {/* Intent Badge */}
          {intent && intent.confidence > 0.5 && (
            <div className="absolute right-14">
              {getIntentLabel()}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 rounded-full"
            disabled={isLoading || !input.trim()}
            data-testid="omnibox-submit"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Disambiguation Options */}
      <AnimatePresence>
        {showDisambiguation && intent?.suggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-[20px] p-3">
              <p className="text-xs text-white/40 mb-2">Did you mean:</p>
              <div className="space-y-1">
                {intent.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (suggestion.includes('stock price')) {
                        handleSubmit(undefined, 'ticker');
                      } else if (suggestion.includes('Ask')) {
                        handleSubmit(undefined, 'question');
                      } else {
                        handleSubmit(undefined, 'question');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-[12px] transition-colors"
                    data-testid={`suggestion-${idx}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDisambiguation(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <p className="text-xs text-white/30 mt-2 text-center">
        Try: "AAPL" for price • "Buy 10 MSFT" for trade • "How do options work?" for help
      </p>
    </div>
  );
}