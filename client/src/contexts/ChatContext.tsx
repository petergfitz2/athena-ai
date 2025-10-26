import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "chat" | "stock" | "command";
}

type IntentType = "stock" | "command" | "question" | "unknown";

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isPanelOpen: boolean;
  isCollapsed: boolean;
  input: string;
  detectedIntent: IntentType;
  activeAvatar: any;
  unreadCount: number;
  lastMessage: Message | null;
  setInput: (value: string) => void;
  setIsPanelOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  sendMessage: (message?: string) => void;
  clearMessages: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  openPanelWithContext: (context: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  // Panel starts open by default for AI-native experience
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("chatPanelCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [input, setInput] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<IntentType>("unknown");
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const { toast } = useToast();
  const conversationIdRef = useRef<string | null>(null);

  // Fetch active avatar for personalized greeting
  const { data: activeAvatar } = useQuery<any>({
    queryKey: ['/api/avatars/active']
  });

  // Generate dynamic greeting based on avatar personality
  const getAvatarGreeting = useCallback(() => {
    if (!activeAvatar) {
      return "Hi! I'm your AI investment assistant. I can help you analyze stocks, suggest trades, and answer any questions about your portfolio. What would you like to know?";
    }
    
    const name = activeAvatar?.name || "Your advisor";
    const profile = activeAvatar?.personalityProfile || {};
    
    // Use custom greeting if available
    if (profile.greeting) {
      return profile.greeting;
    }
    
    // Generate greeting based on personality traits
    if (profile.backstory?.toLowerCase().includes('wolf') || 
        profile.traits?.includes('aggressive')) {
      return `${name} here. Let's cut to the chase - what trades are you looking at?`;
    }
    
    if (profile.traits?.includes('analytical') || 
        profile.tradingStyle === 'analytical') {
      return `I'm ${name}. Ready to analyze your portfolio with precision. What can I help you with?`;
    }
    
    if (profile.traits?.includes('friendly') || 
        profile.traits?.includes('casual')) {
      return `Hey! ${name} here. What's on your mind about the markets today?`;
    }
    
    if (profile.tradingStyle === 'conservative') {
      return `Hello, I'm ${name}. Let's review your investments carefully. How can I assist?`;
    }
    
    // Default professional greeting
    return `Hi! I'm ${name}, your AI investment assistant. I can help you analyze stocks, suggest trades, and answer any questions about your portfolio. What would you like to know?`;
  }, [activeAvatar]);

  // Ensure panel starts open on mount for AI-native experience
  useEffect(() => {
    console.log('[ChatPanel] Initializing panel in open state');
    setIsPanelOpen(true);
    // Store the open state
    localStorage.setItem("chatPanelOpen", "true");
  }, []);

  // Initialize welcome message when panel first opens
  useEffect(() => {
    if (isPanelOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        content: getAvatarGreeting(),
        sender: "ai",
        timestamp: new Date(),
        type: "chat"
      }]);
    }
  }, [isPanelOpen, messages.length, getAvatarGreeting]);

  // Only save collapsed state to localStorage (not open state - should always start closed)
  useEffect(() => {
    localStorage.setItem("chatPanelCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Reset unread count when panel is opened and expanded
  useEffect(() => {
    if (isPanelOpen && !isCollapsed) {
      setUnreadCount(0);
    }
  }, [isPanelOpen, isCollapsed]);

  // Handle ESC key to minimize panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, isCollapsed]);

  // Detect intent as user types
  useEffect(() => {
    const trimmed = input.trim().toUpperCase();
    
    // Check for stock ticker (3-5 capital letters)
    if (/^[A-Z]{3,5}$/.test(trimmed)) {
      setDetectedIntent("stock");
    } 
    // Check for commands
    else if (/^(BUY|SELL|TRADE|SHOW|VIEW)\s/i.test(input)) {
      setDetectedIntent("command");
    }
    // Check for questions
    else if (input.includes('?') || /^(what|how|why|when|should|can|is)/i.test(input)) {
      setDetectedIntent("question");
    }
    else {
      setDetectedIntent("unknown");
    }
  }, [input]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiJson("POST", "/api/chat", {
        message,
        conversationId: conversationIdRef.current,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.conversationId) {
        conversationIdRef.current = data.conversationId;
      }
      
      const newMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        type: "chat"
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setLastMessage(newMessage);
      
      // Increment unread count if panel is closed or collapsed
      if (!isPanelOpen || isCollapsed) {
        setUnreadCount(prev => prev + 1);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const sendMessage = useCallback((messageOverride?: string) => {
    const messageToSend = messageOverride || input;
    if (!messageToSend.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
      type: detectedIntent === "stock" ? "stock" : 
            detectedIntent === "command" ? "command" : "chat"
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Handle different intents
    if (detectedIntent === "stock") {
      // Check stock price (mock for demo)
      toast({
        title: `${messageToSend.toUpperCase()} Price`,
        description: `$${(Math.random() * 500 + 50).toFixed(2)} (Demo)`,
      });
      setInput("");
    } else if (detectedIntent === "command") {
      // Execute command
      toast({
        title: "Command Executed",
        description: `Processing: ${messageToSend}`,
      });
      setInput("");
      // Send to AI for processing
      sendMessageMutation.mutate(messageToSend);
    } else {
      // Send to AI chat
      setInput("");
      sendMessageMutation.mutate(messageToSend);
    }
  }, [input, detectedIntent, sendMessageMutation, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openPanelWithContext = useCallback((context: string) => {
    // Open panel
    setIsPanelOpen(true);
    setIsCollapsed(false);
    
    // Add context as a message and send it
    setTimeout(() => {
      sendMessage(context);
    }, 500);
  }, [sendMessage]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading: sendMessageMutation.isPending,
        isPanelOpen,
        isCollapsed,
        input,
        detectedIntent,
        activeAvatar,
        unreadCount,
        lastMessage,
        setInput,
        setIsPanelOpen,
        setIsCollapsed,
        sendMessage,
        clearMessages,
        togglePanel,
        openPanel,
        closePanel,
        openPanelWithContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}