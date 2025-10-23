import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVoice } from "@/hooks/useVoice";
import { useMode } from "@/contexts/ModeContext";
import { useModeSuggestion } from "@/hooks/useConversationContext";
import { useQuery } from "@tanstack/react-query";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import ChatMessage from "@/components/ChatMessage";
import Navigation from "@/components/Navigation";
import ModeSuggestion from "@/components/ModeSuggestion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, X, MessageCircle, TrendingUp, TrendingDown, Activity, Briefcase, Plus, Eye, ArrowUpRight, Sparkles, Zap, ChevronRight, DollarSign, Brain, Shield, Clock } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PortfolioSummary, Holding, NewsArticle } from "@shared/schema";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function HybridModeContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setMode } = useMode();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useKeyboardShortcuts();
  
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm Athena, your AI investment advisor. How can I help you with your portfolio today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);
  const [modeReady, setModeReady] = useState(false);
  
  const { suggestion, shouldShow, dismissSuggestion} = useModeSuggestion(conversationId, modeReady);
  
  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: async (text) => {
      setInput(text);
      setTimeout(async () => {
        if (!text.trim() || isLoading) return;
        
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        const currentLastMessageTime = lastMessageTime;

        try {
          const data = await apiJson<{ response: string }>("POST", "/api/chat", {
            message: text,
            conversationId,
            lastMessageTime: currentLastMessageTime,
          });

          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setLastMessageTime(Date.now());
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to send voice message",
            variant: "destructive",
          });
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
          setIsLoading(false);
        }
      }, 100);
    },
    onResponse: (text) => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch portfolio data
  const { data: summary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
  });

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery<Holding[]>({
    queryKey: ['/api/holdings'],
  });

  const { data: newsData = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/market/news'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Mock today's change for demo
  const todayChange = summary ? (summary.totalValue * 0.024) : 0;
  const todayChangePercent = 2.4;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMode("hybrid");
    setModeReady(true);
  }, [setMode]);

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await apiJson<{ id: string }>("POST", "/api/conversations", {
          title: "Hybrid Mode Session",
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    };

    initConversation();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const currentLastMessageTime = lastMessageTime;

    try {
      const data = await apiJson<{ response: string }>("POST", "/api/chat", {
        message: messageText,
        conversationId,
        lastMessageTime: currentLastMessageTime,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastMessageTime(Date.now());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const isDataLoading = summaryLoading || holdingsLoading;
  const hasHoldings = holdings && holdings.length > 0;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Navigation Header */}
      <Navigation />
      
      {/* Split Screen Layout */}
      <div className="flex-1 flex h-[calc(100vh-64px)]">
        {/* Left Side - Dashboard */}
        <div className="flex-1 overflow-y-auto border-r border-white/10">
          <div className="p-6 lg:p-8">
            {/* Dashboard Header */}
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-extralight mb-2">Investment Dashboard</h2>
              <p className="text-muted-foreground text-sm">
                Real-time portfolio insights and market analysis
              </p>
            </div>

            {/* Portfolio Snapshot */}
            <Card className="rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-normal flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Portfolio Snapshot
                  </CardTitle>
                  <Badge variant="outline" className="rounded-full">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-white/10 rounded w-32"></div>
                    <div className="h-6 bg-white/10 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="text-3xl lg:text-4xl font-extralight mb-1">
                        {summary ? formatCurrency(summary.totalValue) : "$0"}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${todayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {todayChangePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{formatCurrency(Math.abs(todayChange))}</span>
                        <span>({formatPercent(todayChangePercent)})</span>
                        <span className="text-muted-foreground">today</span>
                      </div>
                    </div>
                    
                    {/* Portfolio Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Gain</p>
                        <p className={`text-lg font-light ${summary && summary.totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {summary ? formatPercent(summary.totalGainPercent) : '0%'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Holdings</p>
                        <p className="text-lg font-light">{holdings.length}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm">Your portfolio shows strong momentum with tech holdings outperforming by 12%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm">Consider rebalancing - tech allocation at 65% exceeds target of 50%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm">Market sentiment bullish - AI and clean energy sectors showing strength</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="rounded-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/trades')}
                    data-testid="button-buy-stocks"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buy Stocks
                  </Button>
                  <Button 
                    className="rounded-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/portfolio')}
                    data-testid="button-view-portfolio"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                  <Button 
                    className="rounded-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/watchlist')}
                    data-testid="button-watchlist"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Watchlist
                  </Button>
                  <Button 
                    className="rounded-full justify-start" 
                    variant="outline"
                    onClick={() => setLocation('/analytics')}
                    data-testid="button-analytics"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Pulse */}
            <Card className="rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-normal flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Market Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newsData.slice(0, 3).map((article, idx) => (
                    <div key={article.id || idx} className="pb-3 border-b border-white/10 last:border-0 last:pb-0">
                      <p className="text-sm font-medium mb-1 line-clamp-2">{article.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {article.sentimentLabel && (
                          <Badge variant="outline" className="rounded-full text-xs">
                            {article.sentimentLabel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Chat Panel (Always Visible on Desktop) */}
        <div className="hidden lg:flex w-[450px] flex-col bg-black/50 backdrop-blur-xl">
          {/* Chat Header - More Prominent */}
          <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <AthenaTraderAvatar 
                size="small" 
                showStatus={false} 
                showName={false}
                isListening={isRecording}
              />
              <div className="flex-1">
                <h3 className="text-lg font-normal">Athena AI Chat</h3>
                <p className="text-sm text-muted-foreground">Your personal investment advisor</p>
              </div>
              <Badge variant="outline" className="rounded-full">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>

          {/* Chat Messages - Scrollable Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <AthenaTraderAvatar size="mini" showStatus={false} showName={false} />
                  <div className="flex-1 glass rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Mode Suggestion */}
          {shouldShow && suggestion && suggestion.recommendedMode && (
            <div className="px-4 pb-2">
              <ModeSuggestion
                recommendedMode={suggestion.recommendedMode}
                reason={suggestion.reason}
                onDismiss={dismissSuggestion}
              />
            </div>
          )}

          {/* Chat Input Section - Clear and Prominent */}
          <div className="flex-shrink-0 border-t border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-1">
                Type your message or use voice
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask Athena about your investments..."
                    className="resize-none rounded-[28px] bg-black/50 border-white/10 px-4 py-3 pr-24"
                    rows={3}
                    disabled={isLoading}
                    data-testid="textarea-chat-input"
                    style={{ paddingRight: '100px' }}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-1 pointer-events-none">
                    <Button
                      onClick={() => isRecording ? stopRecording() : startRecording()}
                      size="icon"
                      variant="ghost"
                      className={`rounded-full hover-elevate pointer-events-auto ${isRecording ? 'text-red-500 bg-red-500/10' : ''}`}
                      disabled={isLoading}
                      data-testid="button-voice"
                    >
                      {isRecording ? <X className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="rounded-full pointer-events-auto"
                      size="icon"
                      data-testid="button-send"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => toast({
            title: "Mobile Chat",
            description: "Full mobile chat experience coming soon",
          })}
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          data-testid="button-mobile-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

export default function HybridMode() {
  return (
    <ProtectedRoute>
      <HybridModeContent />
    </ProtectedRoute>
  );
}