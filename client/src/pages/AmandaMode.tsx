import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AmandaAvatar from "@/components/AmandaAvatar";
import ChatMessage from "@/components/ChatMessage";
import ModeSwitcherMenu from "@/components/ModeSwitcherMenu";
import { Button } from "@/components/ui/button";
import { Mic, Send, Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function AmandaModeContent() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm Amanda, your AI investment advisor. I can help you with portfolio questions, market insights, or trade suggestions. How can I assist you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useKeyboardShortcuts();

  const { status: voiceStatus, transcript, isRecording, startRecording, stopRecording } = useVoice({
    onTranscript: (text) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
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
      {/* Top Header with Mode Switcher */}
      <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/10">
        <ModeSwitcherMenu />
        <p className="text-xs text-muted-foreground">
          Press Space or Cmd+K to talk
        </p>
      </div>

      {/* Amanda Avatar - Top Third */}
      <div className="flex-shrink-0 p-6 lg:p-12 flex items-center justify-center bg-gradient-to-b from-black via-primary/5 to-transparent">
        <AmandaAvatar 
          size="full" 
          isListening={isRecording || voiceStatus === "listening"}
          isSpeaking={voiceStatus === "speaking"}
        />
      </div>

      {/* Portfolio Quick Stats Overlay */}
      <div className="flex-shrink-0 px-6 pb-4">
        <div className="glass rounded-[28px] p-4 flex justify-around text-center">
          <div>
            <p className="text-xs text-muted-foreground">Portfolio</p>
            <p className="text-lg font-light text-foreground">$127,453</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-light text-success">+2.3%</p>
          </div>
        </div>
      </div>

      {/* Messages - Middle */}
      <div className="flex-1 overflow-y-auto px-6 pb-4" data-testid="amanda-messages">
        <div className="max-w-4xl mx-auto space-y-4">
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
              <span className="text-sm">Amanda is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Bottom */}
      <div className="flex-shrink-0 p-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-[28px] p-4 flex items-end gap-3">
            {/* Voice Input Button */}
            <Button
              size="icon"
              onClick={handleVoiceInput}
              className={`rounded-full w-12 h-12 flex-shrink-0 ${
                isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
              }`}
              data-testid="button-voice-input"
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            {/* Text Input */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your portfolio..."
              className="flex-1 min-h-[48px] max-h-32 resize-none rounded-[20px] bg-transparent border-0 focus-visible:ring-0 text-foreground"
              disabled={isLoading}
              data-testid="input-amanda-message"
            />

            {/* Send Button */}
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-full w-12 h-12 flex-shrink-0 bg-primary hover:bg-primary/90"
              data-testid="button-send-message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send • Shift+Enter for new line • Click mic for voice
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AmandaMode() {
  return (
    <ProtectedRoute>
      <AmandaModeContent />
    </ProtectedRoute>
  );
}
