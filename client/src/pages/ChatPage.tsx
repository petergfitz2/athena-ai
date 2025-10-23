import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const { logout } = useAuth();
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [isLoading, setIsLoading] = useState(false);

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
        // Empty conversation, show welcome
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    }
  }, [currentConversationId, conversationMessages]);

  // Handle message loading errors
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

    // Optimistically add user message
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Create conversation if doesn't exist
      let convId = currentConversationId;
      if (!convId) {
        const convData = await apiJson<Conversation>("POST", "/api/conversations", { 
          title: "New Chat" 
        });
        convId = convData.id;
        setCurrentConversationId(convId);
        // Refresh conversations list
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }

      // Send message to AI
      const data = await apiJson<{ response: string }>("POST", "/api/chat", { 
        message: content,
        conversationId: convId
      });

      // Add AI response optimistically
      const aiResponse: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Silently refresh messages in background to sync with server
      // Don't replace local state to avoid losing optimistic updates
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", convId, "messages"] 
      });
    } catch (error: any) {
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserId));
      
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setIsLoading(false);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Athena, your AI investment advisor. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const handleSelectConversation = (convId: string) => {
    setCurrentConversationId(convId);
    setIsLoading(true);
    // Clear messages while loading to avoid showing stale content
    setMessages([]);
  };

  // Stop loading when messages are loaded
  useEffect(() => {
    if (currentConversationId && conversationMessages !== undefined) {
      setIsLoading(false);
    }
  }, [currentConversationId, conversationMessages]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DashboardHeader onLogout={logout} />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {conversations.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={handleNewChat}
                  data-testid="button-new-chat"
                  className="px-4 py-2 rounded-[28px] bg-primary/20 border border-primary/30 text-primary text-sm whitespace-nowrap hover-elevate"
                >
                  New Chat
                </button>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    data-testid={`button-conversation-${conv.id}`}
                    className={`px-4 py-2 rounded-[28px] border text-sm whitespace-nowrap hover-elevate ${
                      currentConversationId === conv.id
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'bg-white/5 border-white/10 text-foreground'
                    }`}
                  >
                    {conv.title || 'Chat'}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                content={msg.content}
                role={msg.role}
                timestamp={msg.timestamp}
              />
            ))}
            {isLoading && currentConversationId === null && (
              <div className="flex justify-start mb-4">
                <div className="rounded-[28px] bg-white/5 border border-white/10 px-6 py-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/50 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isLoading && currentConversationId === null} 
            />
          </div>
        </div>
      </main>
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
