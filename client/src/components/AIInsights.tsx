import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Star, Sparkles, Shield, ChevronRight } from "lucide-react";

export default function AIInsights() {
  return (
    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[20px]">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span className="font-medium">AI Insights</span>
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Strong Buy Signal</p>
              <p className="text-xs text-muted-foreground">NVDA showing bullish momentum</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Portfolio Optimization</p>
              <p className="text-xs text-muted-foreground">Consider rebalancing tech sector</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium">Risk Alert</p>
              <p className="text-xs text-muted-foreground">Volatility expected in energy sector</p>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full rounded-full min-h-[44px]"
          variant="default"
          size="default"
          data-testid="button-view-recommendations"
        >
          View All Recommendations
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}