import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import AthenaTraderAvatar from "./AthenaTraderAvatar";
import { TickerLink } from "./TickerLink";
import { slideInVariants } from "@/lib/animations";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: string;
  quickReplies?: string[];
  onQuickReply?: (reply: string) => void;
}

// Common stock tickers to increase confidence in detection
const commonTickers = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'JNJ', 'V', 'PG', 'UNH',
  'HD', 'MA', 'DIS', 'BAC', 'ADBE', 'CRM', 'NFLX', 'PFE', 'TMO', 'CSCO', 'PEP', 'ABT',
  'NKE', 'CVX', 'WMT', 'XOM', 'ABBV', 'COST', 'MRK', 'VZ', 'INTC', 'CMCSA', 'ORCL',
  'ACN', 'DHR', 'T', 'TXN', 'LLY', 'MDT', 'HON', 'PM', 'UNP', 'NEE', 'IBM', 'QCOM',
  'BMY', 'RTX', 'SBUX', 'AMD', 'LIN', 'GE', 'CAT', 'MMM', 'AMT', 'BA', 'GS', 'DE',
  'INTU', 'AMAT', 'CVS', 'LMT', 'AXP', 'BKNG', 'MU', 'TJX', 'SCHW', 'GILD', 'MO',
  'MDLZ', 'CI', 'BLK', 'ZTS', 'SPGI', 'ISRG', 'PLD', 'C', 'TMUS', 'ADP', 'CB', 'REGN',
  'SYK', 'VRTX', 'FISV', 'TGT', 'BDX', 'MS', 'PNC', 'USB', 'TFC', 'DUK', 'BSX', 'CCI',
  'GME', 'AMC', 'PLTR', 'RBLX', 'COIN', 'HOOD', 'SOFI', 'LCID', 'RIVN', 'SMR',
  'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'EFA', 'EEM', 'GLD', 'SLV', 'USO', 'TLT'
];

import { Button } from "@/components/ui/button";

export default function ChatMessage({ content, role, timestamp, quickReplies, onQuickReply }: ChatMessageProps) {
  const isUser = role === "user";
  
  // Fetch active avatar for AI messages
  const { data: activeAvatar } = useQuery<{
    name: string;
    imageUrl: string;
    personalityProfile: any;
  }>({
    queryKey: ['/api/avatars/active'],
    enabled: !isUser, // Only fetch for AI messages
  });

  // Function to parse content and make tickers clickable
  const renderContentWithClickableTickers = (text: string) => {
    // Handle undefined or null content
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Enhanced regex to match tickers with word boundaries
    // Matches $SYMBOL or standalone SYMBOL (2-5 uppercase letters)
    const tickerRegex = /(\$[A-Z]{1,5})\b|(?:^|\s)([A-Z]{2,5})(?=[\s,.\?!;:]|$)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = tickerRegex.exec(text)) !== null) {
      const ticker = (match[1] || match[2]).replace('$', '');
      
      // Check if this is likely a ticker (either has $ prefix or is in common list)
      const hasPrefix = !!match[1];
      const isCommon = commonTickers.includes(ticker);
      
      // Only make it clickable if it has $ prefix OR is a known ticker
      if (hasPrefix || isCommon) {
        // Add text before the ticker
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        // Add clickable ticker
        parts.push(
          <TickerLink
            key={`${match.index}-${ticker}`}
            symbol={ticker}
            showDollarSign={true}
            variant="badge"
            className="mx-1"
          />
        );
        
        lastIndex = match.index + match[0].length;
      }
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 150,
        duration: 0.4 
      }}
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* No avatar in messages - only in header for cleaner design */}
      
      <div className="flex flex-col max-w-[85%] md:max-w-[80%]">
        {/* Subtle name label for AI messages */}
        {!isUser && (
          <p className="text-xs font-light text-white/30 mb-1 ml-2">
            Athena AI
          </p>
        )}
        
        <div
          className={cn(
            "rounded-[20px] px-3 py-2 border transition-all duration-300",
            isUser
              ? "bg-primary/20 border-primary/30"
              : "bg-white/[0.05] backdrop-blur-md border-white/10"
          )}
          data-testid={`message-${role}`}
        >
          <div className="text-sm leading-relaxed font-light whitespace-pre-wrap text-foreground">
            {renderContentWithClickableTickers(content)}
          </div>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-2 font-light">{timestamp}</p>
          )}
        </div>
        
        {/* Quick Reply Buttons */}
        {!isUser && quickReplies && quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 ml-2">
            {quickReplies.map((reply, idx) => (
              <Button
                key={idx}
                onClick={() => onQuickReply?.(reply)}
                variant="outline"
                size="sm"
                className="rounded-full text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                data-testid={`button-quick-reply-${idx}`}
              >
                {reply}
              </Button>
            ))}
          </div>
        )}
      </div>
      
    </motion.div>
  );
}
