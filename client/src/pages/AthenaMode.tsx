import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMode } from "@/contexts/ModeContext";
import { useModeSuggestion } from "@/hooks/useConversationContext";
import AthenaOrb from "@/components/AthenaOrb";
import ChatMessage from "@/components/ChatMessage";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import ModeSuggestion from "@/components/ModeSuggestion";
import { Button } from "@/components/ui/button";
import { Mic, Send, Square, LayoutDashboard, List, Settings, BarChart3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function AthenaModeContent() {
  const { toast } = useToast();
  const { setMode } = useMode();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm Athena, your AI investment advisor.\n\nI can help you with:\n• Portfolio analysis\n• Market insights\n• Trade suggestions\n\nHow can I assist you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  const [modeReady, setModeReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useKeyboardShortcuts();

  // Set current mode
  useEffect(() => {
    setMode("athena");
    setModeReady(true);
  }, [setMode]);

  // Create conversation on mount
  const createConversation = useMutation({
    mutationFn: async () => {
      return apiJson<{ id: string }>("POST", "/api/conversations", {});
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  useEffect(() => {
    createConversation.mutate();
  }, []);

  // Mode suggestion hook (only enable after mode is synchronized)
  const { suggestion, shouldShow, dismissSuggestion } = useModeSuggestion(conversationId, modeReady);

  const { status: voiceStatus, transcript, isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: async (text) => {
      // Set the input field with the transcript first
      setInput(text);
      
      // Automatically send the message after transcript is received
      // Use a timeout to ensure state updates properly
      setTimeout(async () => {
        // Only proceed if we have text and not already loading
        if (!text.trim() || isLoading) return;
        
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput(""); // Clear the input after creating the message
        setIsLoading(true);

        const currentLastMessageTime = lastMessageTime;

        try {
          const data = await apiJson<{ response: string; analysis?: any }>("POST", "/api/chat", {
            message: text, // Use the transcript text directly
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
          // Remove the failed message from the list
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        } finally {
          setIsLoading(false);
        }
      }, 100);
    },
    onResponse: (text) => {
      // This is for TTS response if backend sends audio back
      // Currently not used in our implementation but kept for future
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
        title: "Voice Input Error",
        description: error.message || "Could not process voice. Please check your microphone permissions or use text input.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const data = await apiJson<{ response: string; analysis?: any }>("POST", "/api/chat", {
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

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Unified Header */}
      <Navigation />
      <NavigationBreadcrumbs />

      {/* Main Chat Container with Split Layout - Responsive */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-16">
        {/* Left Side - Avatar Video Area - Responsive width */}
        <div className="w-full lg:w-[420px] flex-shrink-0 bg-gradient-to-br from-primary/10 via-black to-black lg:border-r border-b lg:border-b-0 border-white/10 flex flex-col">
          {/* Athena Avatar - Video Call Style - Responsive */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[300px] lg:min-h-[400px]">
            <div className="relative flex flex-col items-center">
              <div className="hidden lg:block">
                <AthenaOrb 
                  size="full" 
                  isListening={isRecording || voiceStatus === "listening"}
                  isSpeaking={voiceStatus === "speaking"}
                  isTyping={isLoading}
                  showStatus={false}
                />
              </div>
              <div className="hidden sm:block lg:hidden">
                <AthenaOrb 
                  size="large" 
                  isListening={isRecording || voiceStatus === "listening"}
                  isSpeaking={voiceStatus === "speaking"}
                  isTyping={isLoading}
                  showStatus={false}
                />
              </div>
              <div className="block sm:hidden">
                <AthenaOrb 
                  size="medium" 
                  isListening={isRecording || voiceStatus === "listening"}
                  isSpeaking={voiceStatus === "speaking"}
                  isTyping={isLoading}
                  showStatus={false}
                />
              </div>
              {/* Athena Text - Responsive sizes */}
              <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extralight text-foreground tracking-wider mb-2">Athena</h1>
                <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md inline-block">
                  {isRecording || voiceStatus === "listening" ? (
                    <p className="text-sm text-primary font-light animate-pulse">Listening to you...</p>
                  ) : voiceStatus === "speaking" ? (
                    <p className="text-sm text-primary font-light animate-pulse">Speaking...</p>
                  ) : isLoading ? (
                    <p className="text-sm text-muted-foreground font-light">
                      <span className="thinking-dots">Thinking</span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground font-light">Ready to help</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Quick Stats - Hidden on mobile to save space */}
          <div className="hidden lg:block p-6">
            <div className="glass rounded-[28px] p-5 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Portfolio</p>
                <p className="text-3xl font-extralight text-foreground">$127,453</p>
              </div>
              <div className="flex justify-around pt-3 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className="text-lg font-light text-success">+2.3%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-light text-foreground">+8.7%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area - Responsive padding */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" data-testid="amanda-messages">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground pl-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm font-light">Athena is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Responsive padding and fixed mobile positioning */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-t border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <div className="glass rounded-[28px] p-3 sm:p-4 flex items-end gap-2 sm:gap-3">
                {/* Voice Input Button */}
                <Button
                  size="icon"
                  onClick={handleVoiceInput}
                  className={`rounded-full w-12 h-12 flex-shrink-0 transition-all ${
                    isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                  }`}
                  data-testid="button-voice-input"
                  aria-label={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                {/* Text Input */}
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message or press the mic to speak..."
                  className="flex-1 min-h-[48px] max-h-32 resize-none rounded-[20px] bg-white/5 border-0 focus-visible:ring-0 text-foreground placeholder:text-white/40 px-4"
                  disabled={isLoading}
                  data-testid="input-amanda-message"
                />

                {/* Send Button */}
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full w-12 h-12 flex-shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50"
                  data-testid="button-send-message"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-3 font-light">
                Press Enter to send • Shift+Enter for new line • Space or Cmd+K for voice
              </p>
            </div>
          </div>
        </div>
      </div>

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

export default function AthenaMode() {
  return (
    <ProtectedRoute>
      <AthenaModeContent />
    </ProtectedRoute>
  );
}
