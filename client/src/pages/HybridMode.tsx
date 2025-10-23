import { useState } from "react";
import { ProtectedRoute } from "@/lib/auth";
import DashboardPage from "@/pages/DashboardPage";
import PortfolioPage from "@/pages/PortfolioPage";
import AmandaAvatar from "@/components/AmandaAvatar";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, X, MessageCircle } from "lucide-react";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function HybridModeContent() {
  const { toast } = useToast();
  const [chatExpanded, setChatExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm Amanda. Click here to start chatting or press Cmd/Ctrl + K.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"dashboard" | "portfolio">("dashboard");

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiJson<{ response: string }>("POST", "/api/chat", {
        message: input,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Main Dashboard Area */}
      <div className={`transition-all duration-300 ${chatExpanded ? 'mr-[500px]' : 'mr-0'}`}>
        {/* Header with View Selector */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extralight text-foreground">Athena</h1>
            <div className="flex gap-2">
              <Button
                variant={view === "dashboard" ? "default" : "ghost"}
                onClick={() => setView("dashboard")}
                className="rounded-full"
                data-testid="button-view-dashboard"
              >
                Dashboard
              </Button>
              <Button
                variant={view === "portfolio" ? "default" : "ghost"}
                onClick={() => setView("portfolio")}
                className="rounded-full"
                data-testid="button-view-portfolio"
              >
                Portfolio
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-73px)] overflow-auto">
          {view === "dashboard" ? <DashboardPage /> : <PortfolioPage />}
        </div>
      </div>

      {/* Floating Mini Amanda (Bottom-Right) */}
      {!chatExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setChatExpanded(true)}
            className="rounded-full w-20 h-20 p-0 bg-gradient-to-br from-primary to-accent shadow-2xl hover:scale-110 transition-transform"
            data-testid="button-expand-amanda"
          >
            <AmandaAvatar size="medium" />
          </Button>
        </div>
      )}

      {/* Expanded Chat Panel (Right Side) */}
      {chatExpanded && (
        <div className="fixed right-0 top-0 h-screen w-[500px] glass border-l border-white/10 flex flex-col z-40">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AmandaAvatar size="small" />
              <div>
                <h3 className="text-lg font-light text-foreground">Amanda</h3>
                <p className="text-xs text-muted-foreground">Your AI Advisor</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatExpanded(false)}
              className="rounded-full"
              data-testid="button-collapse-amanda"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="hybrid-chat-messages">
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <div className="flex items-end gap-2">
              <Button
                size="icon"
                className="rounded-full flex-shrink-0"
                data-testid="button-voice-hybrid"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Amanda anything..."
                className="flex-1 min-h-[48px] max-h-32 resize-none rounded-[20px] bg-white/5 border-white/10"
                disabled={isLoading}
                data-testid="input-hybrid-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-full flex-shrink-0"
                data-testid="button-send-hybrid"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
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
