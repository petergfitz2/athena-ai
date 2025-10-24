import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickActionButtons from "@/components/QuickActionButtons";
import CommandBar from "@/components/CommandBar";
import { ProtectedRoute } from "@/lib/auth";
import { apiJson, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Command, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Import dashboard components for left panel
import PortfolioSummary from "@/components/PortfolioSummary";
import MarketOverview from "@/components/MarketOverview";
import NewsSection from "@/components/NewsSection";
import QuickActions from "@/components/QuickActions";

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
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  
  // Fetch active avatar for personalized greeting
  const { data: activeAvatar } = useQuery<any>({
    queryKey: ['/api/avatars/active']
  });
  
  // Generate dynamic greeting based on avatar personality
  const getAvatarGreeting = () => {
    if (!activeAvatar) {
      return "Hello! I'm Athena, your AI investment advisor. How can I help you today?";
    }
    
    const name = activeAvatar?.name || "Athena";
    const profile = activeAvatar?.personalityProfile || {};
    
    // Use custom greeting if available
    if (profile.greeting) {
      return profile.greeting;
    }
    
    // Generate greeting based on personality traits
    if (profile.backstory?.toLowerCase().includes('wolf') || 
        profile.traits?.includes('aggressive')) {
      return `Hey! I'm ${name}. Sell me this pen!\n\nJust kidding. Show me your portfolio - let's make some real money.`;
    }
    
    if (profile.traits?.includes('analytical') || 
        profile.tradingStyle === 'analytical') {
      return `Greetings, I'm ${name}. Let's analyze your investment opportunities with data-driven precision.`;
    }
    
    if (profile.traits?.includes('friendly') || 
        profile.traits?.includes('casual')) {
      return `Hey there! I'm ${name}. Ready to talk about your investments?`;
    }
    
    if (profile.tradingStyle === 'conservative') {
      return `Hello, I'm ${name}. Let's build your wealth safely and strategically.`;
    }
    
    // Default professional greeting
    return `Hello! I'm ${name}, your AI investment advisor. How can I help you today?`;
  };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update greeting when avatar changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getAvatarGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [activeAvatar, currentConversationId]);

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
          content: getAvatarGreeting(),
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
      content: getAvatarGreeting(),
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

  // Keyboard shortcut for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle chat form submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isLoading) {
      handleSendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Command Bar */}
      <CommandBar open={commandBarOpen} setOpen={setCommandBarOpen} />

      {/* Top Command Bar */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-extralight text-white">Athena AI</h1>
              <Badge variant="outline" className="text-xs">Command Center</Badge>
            </div>
            
            {/* Central Command Bar Trigger */}
            <button
              onClick={() => setCommandBarOpen(true)}
              className="glass rounded-[28px] px-6 py-2.5 text-sm font-light text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              data-testid="button-open-command-bar"
            >
              <Command className="w-4 h-4" />
              <span>Quick Command</span>
              <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/10 rounded">⌘K</kbd>
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">Your Investment Advisor</span>
              <div className="flex items-center gap-2">
                {activeAvatar?.imageUrl && (
                  <img 
                    src={activeAvatar.imageUrl} 
                    alt={activeAvatar.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-light text-white">{activeAvatar?.name || "Athena"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Left Panel - Dashboard Info (3 cols) */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto">
            {/* Portfolio Overview */}
            <PortfolioSummary />
            
            {/* Market Overview */}
            <MarketOverview />
            
            {/* Quick Actions */}
            <div className="glass rounded-[28px] p-6">
              <h3 className="text-lg font-light text-white mb-4">Quick Actions</h3>
              <QuickActions />
            </div>
            
            {/* News */}
            <NewsSection />
          </div>

          {/* Right Panel - Chat (2 cols) */}
          <div className="lg:col-span-2 glass rounded-[28px] flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extralight text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    {activeAvatar?.name || "Athena"} Chat
                  </h2>
                  <p className="text-xs text-white/40 mt-1">Your personal investment conversation</p>
                </div>
                {conversations.length > 0 && (
                  <Button
                    onClick={handleNewConversation}
                    variant="outline"
                    size="sm"
                    className="rounded-[28px] text-xs"
                    data-testid="button-new-chat"
                  >
                    + New Chat
                  </Button>
                )}
              </div>
              
              {/* Conversation tabs */}
              {conversations.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {conversations.slice(0, 3).map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all
                        ${currentConversationId === conv.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      data-testid={`tab-conversation-${conv.id}`}
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6" data-testid="chat-messages">
              <div className="space-y-4">
                {messages.length <= 1 && !isLoading && (
                  <QuickActionButtons onAction={handleSendMessage} disabled={isLoading} />
                )}
                {messages.map((message) => (
                  <ChatMessage key={message.id} {...message} />
                ))}
                {isLoading && messages.length > 0 && (
                  <div className="flex items-center gap-2 text-white/40">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">{activeAvatar?.name || "Athena"} is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input - Now at bottom of right panel */}
            <div className="p-6 border-t border-white/10">
              <form onSubmit={handleChatSubmit} className="relative">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask ${activeAvatar?.name || "Athena"} about investments...`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-12 rounded-[28px]"
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 rounded-full"
                  disabled={isLoading || !chatInput.trim()}
                  data-testid="button-send-chat"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-white/30 mt-2 text-center">
                Press ⌘K for quick commands • Enter to chat
              </p>
            </div>
          </div>
        </div>
      </div>
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