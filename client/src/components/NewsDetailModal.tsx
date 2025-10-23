import { X, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NewsArticle } from "@shared/schema";

interface NewsDetailModalProps {
  article: NewsArticle | null;
  open: boolean;
  onClose: () => void;
}

export default function NewsDetailModal({ article, open, onClose }: NewsDetailModalProps) {
  if (!article) return null;

  const getSentimentColor = (label?: string) => {
    if (!label) return "text-muted-foreground";
    const normalized = label.toLowerCase();
    if (normalized.includes("positive") || normalized.includes("bullish")) return "text-success";
    if (normalized.includes("negative") || normalized.includes("bearish")) return "text-destructive";
    return "text-warning";
  };

  const getSentimentIcon = (label?: string) => {
    if (!label) return null;
    const normalized = label.toLowerCase();
    if (normalized.includes("positive") || normalized.includes("bullish")) {
      return <TrendingUp className="w-4 h-4" />;
    }
    if (normalized.includes("negative") || normalized.includes("bearish")) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return null;
  };

  const formattedDate = new Date(article.publishedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black border-white/10 text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light pr-8">{article.title}</DialogTitle>
        </DialogHeader>

        {/* Article metadata */}
        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-white/10">
          <Badge variant="outline" className="text-xs">
            {article.source}
          </Badge>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
          
          {article.sentimentLabel && (
            <div className={`flex items-center gap-1.5 text-sm ${getSentimentColor(article.sentimentLabel)}`}>
              {getSentimentIcon(article.sentimentLabel)}
              <span className="font-medium">{article.sentimentLabel}</span>
              {article.sentimentScore !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({(article.sentimentScore * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Related tickers */}
        {article.tickers && article.tickers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Related:</span>
            {article.tickers.map((ticker) => (
              <Badge key={ticker} variant="secondary" className="text-xs">
                {ticker}
              </Badge>
            ))}
          </div>
        )}

        {/* Article image */}
        {article.imageUrl && (
          <div className="w-full rounded-[20px] overflow-hidden bg-white/5">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article summary */}
        {article.summary && (
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground font-light leading-relaxed">
              {article.summary}
            </p>
          </div>
        )}

        {/* Read full article button */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => window.open(article.url, '_blank')}
            className="gap-2 rounded-full"
            data-testid="button-read-full-article"
          >
            Read Full Article
            <ExternalLink className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
