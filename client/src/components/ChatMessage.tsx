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

export default function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
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
    <div
      className={cn(
        "flex w-full animate-slide-in gap-3 lg:gap-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Show avatar for AI messages */}
      {!isUser && (
        <div className="flex-shrink-0">
          <AthenaTraderAvatar
            size="small"
            showName={false}
            showStatus={false}
            className="mt-2"
          />
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%] md:max-w-[75%]">
        {/* Show avatar name for AI messages */}
        {!isUser && activeAvatar && (
          <p className="text-sm text-muted-foreground mb-2 ml-2">
            {activeAvatar.name}
          </p>
        )}
        
        <div
          className={cn(
            "rounded-[28px] px-6 md:px-8 lg:px-10 py-6 md:py-7 lg:py-8 border transition-all duration-300",
            isUser
              ? "bg-primary/20 border-primary/30"
              : "bg-white/[0.06] backdrop-blur-md border-white/10"
          )}
          data-testid={`message-${role}`}
        >
          <div className="text-base md:text-lg leading-relaxed font-light whitespace-pre-wrap text-foreground">
            {renderContentWithClickableTickers(content)}
          </div>
          {timestamp && (
            <p className="text-xs text-muted-foreground mt-3 lg:mt-4 font-light">{timestamp}</p>
          )}
        </div>
      </div>
      
    </div>
  );
}
