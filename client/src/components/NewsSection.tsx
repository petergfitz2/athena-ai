import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  tickers?: string[];
};

export default function NewsSection() {
  const { data: news = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/market/news'],
    select: () => [
      {
        id: '1',
        title: 'Tech Stocks Rally on Strong Earnings Reports',
        source: 'Bloomberg',
        time: '2 hours ago',
        sentiment: 'bullish' as const,
        tickers: ['AAPL', 'MSFT', 'GOOGL']
      },
      {
        id: '2',
        title: 'Fed Signals Potential Rate Pause in December Meeting',
        source: 'Reuters',
        time: '3 hours ago',
        sentiment: 'neutral' as const
      },
      {
        id: '3',
        title: 'Oil Prices Drop Amid Supply Concerns',
        source: 'CNBC',
        time: '5 hours ago',
        sentiment: 'bearish' as const,
        tickers: ['XOM', 'CVX']
      }
    ].slice(0, 3)
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-white/40" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'bearish':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-32"></div>
          <div className="space-y-3">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 p-6 rounded-[28px]">
      <h3 className="text-lg font-light text-white mb-4">Market News</h3>
      
      <div className="space-y-3">
        {news.map((article) => (
          <div key={article.id} className="p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-colors cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg mt-0.5 ${getSentimentColor(article.sentiment).split(' ')[1]}`}>
                {getSentimentIcon(article.sentiment)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-light text-white line-clamp-2 mb-2">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/40">{article.source}</span>
                  <span className="text-xs text-white/20">•</span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.time}
                  </span>
                  {article.tickers && article.tickers.length > 0 && (
                    <>
                      <span className="text-xs text-white/20">•</span>
                      <div className="flex gap-1">
                        {article.tickers.slice(0, 2).map((ticker) => (
                          <Badge key={ticker} variant="outline" className="text-xs py-0 px-1.5 h-5 border-white/10">
                            {ticker}
                          </Badge>
                        ))}
                        {article.tickers.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0 px-1.5 h-5 border-white/10">
                            +{article.tickers.length - 2}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}