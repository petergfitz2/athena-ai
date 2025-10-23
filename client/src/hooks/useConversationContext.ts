import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useMode } from "@/contexts/ModeContext";
import { apiJson } from "@/lib/queryClient";

interface ConversationAnalysis {
  hurriedScore: number;
  analyticalScore: number;
  conversationalScore: number;
  recommendedMode: "amanda" | "hybrid" | "terminal";
  messageCount: number;
  avgResponseTimeSeconds: number | null;
}

interface ModeSuggestion {
  shouldSuggest: boolean;
  recommendedMode: "amanda" | "hybrid" | "terminal" | null;
  reason: string;
  scores: {
    hurriedScore: string;
    analyticalScore: string;
    conversationalScore: string;
  };
}

export function useConversationContext(conversationId: string | null) {
  const { data: analysis, isLoading } = useQuery<ConversationAnalysis>({
    queryKey: ["/api/context", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("No conversation ID");
      return apiJson<ConversationAnalysis>("GET", `/api/context/${conversationId}`);
    },
    enabled: !!conversationId,
    refetchInterval: false,
    staleTime: 30000,
  });

  return {
    analysis,
    isLoading,
  };
}

export function useModeSuggestion(conversationId: string | null, enabled: boolean = true) {
  const { currentMode } = useMode();
  const [hasDismissed, setHasDismissed] = useState(false);

  const { data: suggestion, isLoading } = useQuery<ModeSuggestion>({
    queryKey: ["/api/context", conversationId, "suggestion", currentMode],
    queryFn: async () => {
      if (!conversationId) throw new Error("No conversation ID");
      return apiJson<ModeSuggestion>(
        "GET",
        `/api/context/${conversationId}/suggestion?currentMode=${currentMode}`
      );
    },
    enabled: !!conversationId && enabled && !hasDismissed,
    refetchInterval: 20000,
    staleTime: 15000,
  });

  // Reset dismissed state when conversation changes
  useEffect(() => {
    setHasDismissed(false);
  }, [conversationId]);

  const dismissSuggestion = () => {
    setHasDismissed(true);
  };

  return {
    suggestion,
    isLoading,
    shouldShow: suggestion?.shouldSuggest && !hasDismissed,
    dismissSuggestion,
  };
}
