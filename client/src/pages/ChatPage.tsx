import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickActionButtons from "@/components/QuickActionButtons";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  createdAt?: string;
};

type Conversation = {
  id: string;
  title: string;
};

function ChatPageContent() {
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Load messages for current conversation
  const { data: conversationMessages, error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  // Update messages when conversation changes or messages load
  useEffect(() => {
    if (currentConversationId && conversationMessages) {
      if (conversationMessages.length > 0) {
        const formattedMessages = conversationMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    }
  }, [currentConversationId, conversationMessages]);

  useEffect(() => {
    if (messagesError) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  }, [messagesError, toast]);

  const handleSendMessage = async (content: string) => {
    const tempUserId = `user-${Date.now()}`;
    const tempAssistantId = `assistant-${Date.now() + 1}`;
    
    const newMessage: Message = {
      id: tempUserId,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      let convId = currentConversationId;
      if (!convId) {
        const convData = await apiJson<Conversation>("POST", "/api/conversations", { 
          title: "New Chat" 
        });
        convId = convData.id;
        setCurrentConversationId(convId);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }

      const data = await apiJson<{ response: string }>("POST", "/api/chat", { 
        message: content,
        conversationId: convId
      });

      const aiResponse: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", convId, "messages"] });
      setIsLoading(false);
    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== tempUserId));
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setIsLoading(false);
  };

  const handleSelectConversation = (convId: string) => {
    setCurrentConversationId(convId);
    setIsLoading(true);
    setMessages([]);
  };

  useEffect(() => {
    if (currentConversationId && conversationMessages !== undefined) {
      setIsLoading(false);
    }
  }, [currentConversationId, conversationMessages]);

  return (
    <div className="min-h-screen bg-black px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-8 lg:mb-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight mb-3 lg:mb-4">
            Chat
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground font-light">
            Talk to your AI investment advisor
          </p>
        </div>

        {/* Conversation History */}
        {conversations.length > 0 && (
          <div className="flex gap-3 lg:gap-4 mb-6 lg:mb-8 overflow-x-auto pb-2">
            <button
              onClick={handleNewConversation}
              className="glass rounded-[28px] px-6 lg:px-8 py-3 lg:py-4 font-light text-sm lg:text-base whitespace-nowrap transition-all hover:bg-white/8"
              data-testid="button-new-conversation"
            >
              + New Chat
            </button>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`glass rounded-[28px] px-6 lg:px-8 py-3 lg:py-4 font-light text-sm lg:text-base whitespace-nowrap transition-all
                  ${currentConversationId === conv.id ? 'bg-primary text-primary-foreground' : 'hover:bg-white/8'}`}
                data-testid={`button-conversation-${conv.id}`}
              >
                <MessageSquare className="inline w-4 h-4 mr-2" />
                {conv.title}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 glass rounded-[28px] p-6 md:p-10 lg:p-12 overflow-y-auto mb-6 lg:mb-8" data-testid="chat-messages">
          <div className="space-y-6 lg:space-y-8">
            {messages.length <= 1 && !isLoading && (
              <QuickActionButtons onAction={handleSendMessage} disabled={isLoading} />
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-2 lg:gap-3 text-muted-foreground">
                <div className="flex gap-1 lg:gap-1.5">
                  <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

function StopLoadingState() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px]">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-150" />
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-300" />
      </div>
      <span className="text-sm text-muted-foreground font-light">Athena is thinking...</span>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
