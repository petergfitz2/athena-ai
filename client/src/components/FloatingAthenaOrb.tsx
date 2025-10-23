import { useState } from "react";
import { MessageCircle, X, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";
import { useMutation } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function FloatingAthenaOrb() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! I'm Athena, your AI investment assistant. I can help you analyze stocks, suggest trades, and answer any questions about your portfolio. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const conversationId = localStorage.getItem("athena_conversation_id");
      const response = await apiJson("POST", "/api/chat", {
        message,
        conversationId,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.conversationId) {
        localStorage.setItem("athena_conversation_id", data.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    sendMessage.mutate(input);
  };

  const quickActions = [
    { label: "Suggest Trades", icon: TrendingUp, action: "What stocks should I buy today?" },
    { label: "Market News", icon: Sparkles, action: "What's happening in the market?" },
    { label: "Portfolio Review", icon: HelpCircle, action: "How is my portfolio performing?" },
  ];

  return (
    <>
      {/* Floating Orb Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 p-0"
            data-testid="button-floating-athena"
          >
            <AthenaTraderAvatar size="mini" showStatus={false} showName={false} className="pointer-events-none" />
            <Badge 
              className="absolute -top-1 -right-1 bg-destructive text-white border-0 animate-pulse"
              data-testid="badge-demo-mode"
            >
              DEMO
            </Badge>
          </Button>
          <div className="absolute bottom-0 right-20 bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <p className="text-xs text-white">Ask Athena AI</p>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <Card className="bg-black/95 backdrop-blur-xl border-white/10 rounded-[28px] shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AthenaTraderAvatar size="mini" showStatus={false} showName={false} />
                <div>
                  <CardTitle className="text-lg font-light">Athena AI Assistant</CardTitle>
                  <Badge variant="outline" className="mt-1 text-xs">
                    Demo Mode - Virtual Trading
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[20px] px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-white/10"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-white/10 rounded-[20px] px-4 py-3">
                        <AthenaTraderAvatar size="mini" isTyping={true} showStatus={false} showName={false} />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-muted-foreground mb-2">Quick Actions:</p>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        onClick={() => {
                          setInput(action.action);
                          handleSend();
                        }}
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-full text-xs h-8"
                        disabled={sendMessage.isPending}
                      >
                        <action.icon className="h-3 w-3" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask about stocks, trades, or your portfolio..."
                    className="min-h-[40px] max-h-[100px] resize-none rounded-[20px]"
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMessage.isPending}
                    className="rounded-full px-3"
                    size="icon"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Demo mode - No real trades executed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}