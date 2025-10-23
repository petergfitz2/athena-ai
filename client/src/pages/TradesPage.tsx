import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProtectedRoute } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiJson, queryClient } from "@/lib/queryClient";
import { Check, X, TrendingUp, TrendingDown, Clock, Sparkles } from "lucide-react";
import type { Trade } from "@shared/schema";
import Navigation from "@/components/Navigation";
import FloatingAthenaOrb from "@/components/FloatingAthenaOrb";

function TradesPageContent() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "pending" | "executed">("pending");

  const { data: allTrades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const approveTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      return apiJson("PATCH", `/api/trades/${tradeId}/status`, { status: "approved" });
    },
    onSuccess: () => {
      toast({
        title: "Trade Approved",
        description: "The trade has been approved and will be executed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve trade",
        variant: "destructive",
      });
    },
  });

  const rejectTrade = useMutation({
    mutationFn: async (tradeId: string) => {
      return apiJson("PATCH", `/api/trades/${tradeId}/status`, { status: "rejected" });
    },
    onSuccess: () => {
      toast({
        title: "Trade Rejected",
        description: "The trade has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject trade",
        variant: "destructive",
      });
    },
  });

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/trade-suggestions", {
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Suggestions Generated",
        description: `Created ${data.length} new trade suggestions for your review`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI suggestions",
        variant: "destructive",
      });
    },
  });

  const filteredTrades = allTrades.filter(trade => {
    if (filter === "all") return true;
    if (filter === "pending") return trade.status === "pending" || trade.status === "approved";
    if (filter === "executed") return trade.status === "executed";
    return true;
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      executed: { variant: "outline", label: "Executed" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const { variant, label } = variants[status] || { variant: "outline", label: status };
    return <Badge variant={variant} data-testid={`badge-status-${status}`}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
      <FloatingAthenaOrb />
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight mb-2">
                Trades
              </h1>
              <p className="text-lg text-muted-foreground font-light">
                Review and manage your trade suggestions
              </p>
            </div>
            <Button
              onClick={() => generateSuggestions.mutate()}
              disabled={generateSuggestions.isPending}
              className="rounded-full mt-4"
              size="lg"
              data-testid="button-generate-suggestions"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateSuggestions.isPending ? "Generating..." : "Get AI Suggestions"}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === "pending" ? "default" : "ghost"}
            onClick={() => setFilter("pending")}
            className="rounded-full"
            data-testid="button-filter-pending"
          >
            Pending
          </Button>
          <Button
            variant={filter === "executed" ? "default" : "ghost"}
            onClick={() => setFilter("executed")}
            className="rounded-full"
            data-testid="button-filter-executed"
          >
            Executed
          </Button>
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className="rounded-full"
            data-testid="button-filter-all"
          >
            All
          </Button>
        </div>

        {/* Trades List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-light">Loading trades...</p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <Card className="bg-card border-white/10 rounded-[28px]">
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-light mb-2">No {filter === "all" ? "" : filter} trades</p>
              <p className="text-sm text-muted-foreground">
                Ask Amanda for trade suggestions to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <Card 
                key={trade.id} 
                className="bg-card border-white/10 rounded-[28px]"
                data-testid={`trade-card-${trade.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        trade.type === 'buy' ? 'bg-primary/20' : 'bg-destructive/20'
                      }`}>
                        {trade.type === 'buy' ? 
                          <TrendingUp className="w-6 h-6 text-primary" /> : 
                          <TrendingDown className="w-6 h-6 text-destructive" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-2xl font-light">{trade.symbol}</CardTitle>
                          <Badge variant={trade.type === 'buy' ? "default" : "destructive"}>
                            {trade.type.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>
                          {parseFloat(trade.quantity).toFixed(2)} shares @ {formatCurrency(trade.price)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(trade.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(trade.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trade.reasoning && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">AI Reasoning</p>
                      <p className="text-base text-foreground leading-relaxed">{trade.reasoning}</p>
                    </div>
                  )}
                  
                  {trade.confidence && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                      <p className="text-lg font-light text-primary">{parseFloat(trade.confidence).toFixed(0)}%</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <p className="text-sm font-medium text-foreground">
                      Total: {formatCurrency((parseFloat(trade.quantity) * parseFloat(trade.price)).toFixed(2))}
                    </p>
                    
                    {trade.status === "pending" && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveTrade.mutate(trade.id)}
                          disabled={approveTrade.isPending || rejectTrade.isPending}
                          className="rounded-full"
                          data-testid={`button-approve-${trade.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectTrade.mutate(trade.id)}
                          disabled={approveTrade.isPending || rejectTrade.isPending}
                          variant="outline"
                          className="rounded-full"
                          data-testid={`button-reject-${trade.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TradesPage() {
  return (
    <ProtectedRoute>
      <TradesPageContent />
    </ProtectedRoute>
  );
}
