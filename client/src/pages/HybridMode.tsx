import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/lib/auth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVoice } from "@/hooks/useVoice";
import { useMode } from "@/contexts/ModeContext";
import { useModeSuggestion } from "@/hooks/useConversationContext";
import DashboardPage from "@/pages/DashboardPage";
import PortfolioPage from "@/pages/PortfolioPage";
import AthenaOrb from "@/components/AthenaOrb";
import ChatMessage from "@/components/ChatMessage";
import ModeSwitcherMenu from "@/components/ModeSwitcherMenu";
import ModeSuggestion from "@/components/ModeSuggestion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, X, MessageCircle, LayoutDashboard, Square, List, Settings, BarChart3 } from "lucide-react";
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
  const { setMode } = useMode();
  const [, setLocation] = useLocation();
  useKeyboardShortcuts();
  
  const [chatExpanded, setChatExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm Athena. Click here to start chatting or press Cmd/Ctrl + K.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"dashboard" | "portfolio">("dashboard");
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);
  const [modeReady, setModeReady] = useState(false);
  
  const { suggestion, shouldShow, dismissSuggestion} = useModeSuggestion(conversationId, modeReady);
  
  const { isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (text) => {
      setInput(text);
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

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const currentLastMessageTime = lastMessageTime;

    try {
      const data = await apiJson<{ response: string }>("POST", "/api/chat", {
        message: input,
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

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Main Dashboard Area */}
      <div className={`transition-all duration-300 ${chatExpanded ? 'mr-[500px]' : 'mr-0'}`}>
        {/* Header with View Selector */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extralight text-foreground">Athena</h1>
              <ModeSwitcherMenu />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/dashboard")}
                  className="rounded-full"
                  data-testid="button-dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/analytics")}
                  className="rounded-full"
                  data-testid="button-analytics"
                >
                  <BarChart3 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/trades")}
                  className="rounded-full"
                  data-testid="button-trades"
                >
                  <List className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/settings")}
                  className="rounded-full"
                  data-testid="button-settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
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

      {/* Floating Athena Orb (Bottom-Right) */}
      {!chatExpanded && (
        <div className="fixed bottom-8 right-8 z-50">
          <div 
            onClick={() => setChatExpanded(true)}
            className="cursor-pointer group transition-all duration-300 hover:scale-105"
            data-testid="button-expand-athena"
          >
            <AthenaOrb 
              size="small" 
              showStatus={false}
              isListening={isRecording}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="px-3 py-1 bg-black/90 backdrop-blur-xl rounded-full border border-white/10">
                <p className="text-xs text-white/90 whitespace-nowrap">Click to chat</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat Panel (Right Side) */}
      {chatExpanded && (
        <div className="fixed right-0 top-0 h-screen w-[500px] glass border-l border-white/10 flex flex-col z-40">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between glass">
            <div className="flex items-center gap-4">
              <AthenaOrb 
                size="mini" 
                showStatus={false}
                isListening={isRecording}
                isSpeaking={false}
              />
              <div>
                <h3 className="text-xl font-extralight text-foreground tracking-wide">Athena</h3>
                <p className="text-xs text-muted-foreground font-light">AI Investment Advisor</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatExpanded(false)}
              className="rounded-full hover-elevate"
              data-testid="button-collapse-athena"
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
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full flex-shrink-0 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
                data-testid="button-voice-hybrid"
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
                placeholder="Ask Athena anything..."
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

      {/* Mode Suggestion */}
      {shouldShow && suggestion?.recommendedMode && (
        <ModeSuggestion
          recommendedMode={suggestion.recommendedMode}
          reason={suggestion.reason}
          onDismiss={dismissSuggestion}
        />
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
