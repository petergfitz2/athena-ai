import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AmandaAvatar from "@/components/AmandaAvatar";
import ChatMessage from "@/components/ChatMessage";
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      
      // Simulate speaking
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
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
    setIsListening(!isListening);
    // Voice functionality will be implemented with OpenAI Realtime API
    toast({
      title: "Voice Input",
      description: "Voice integration coming soon with OpenAI Realtime API",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Amanda Avatar - Top Third */}
      <div className="flex-shrink-0 p-6 lg:p-12 flex items-center justify-center bg-gradient-to-b from-black via-primary/5 to-transparent">
        <AmandaAvatar 
          size="full" 
          isListening={isListening}
          isSpeaking={isSpeaking}
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
                isListening ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
              }`}
              data-testid="button-voice-input"
            >
              {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
