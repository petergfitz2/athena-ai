import { db } from "./db";
import { messageMetrics, conversationAnalysis, type MessageMetrics } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Technical terms commonly used in investment analysis
const TECHNICAL_TERMS = [
  'sharpe', 'ratio', 'beta', 'alpha', 'volatility', 'correlation', 'portfolio',
  'diversification', 'allocation', 'rebalance', 'etf', 'pe', 'eps', 'ebitda',
  'market cap', 'dividend', 'yield', 'option', 'hedge', 'futures', 'derivative',
  'arbitrage', 'liquidity', 'valuation', 'dcf', 'wacc', 'roi', 'irr', 'cagr',
  'fundamental', 'technical', 'analysis', 'chart', 'indicator', 'moving average',
  'rsi', 'macd', 'fibonacci', 'support', 'resistance', 'breakout', 'trend'
];

// Urgency keywords
const URGENCY_KEYWORDS = [
  'quick', 'quickly', 'fast', 'brief', 'summary', 'short', 'asap', 'urgent',
  'now', 'immediately', 'hurry', 'rushed', 'time', 'minute', 'second'
];

// Deep analysis keywords
const DEEP_KEYWORDS = [
  'why', 'how', 'explain', 'detail', 'analyze', 'compare', 'breakdown',
  'comprehensive', 'thorough', 'deep', 'dive', 'elaborate', 'specifically',
  'exactly', 'precisely', 'mechanism', 'reason', 'cause', 'effect'
];

// Conversational keywords
const CONVERSATIONAL_KEYWORDS = [
  'thanks', 'thank you', 'appreciate', 'great', 'awesome', 'nice', 'cool',
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'how are you',
  'amanda', 'you', 'your', 'think', 'feel', 'opinion'
];

interface MessageAnalysisResult {
  wordCount: number;
  characterCount: number;
  hasQuestion: boolean;
  questionDepth: 'none' | 'simple' | 'moderate' | 'deep';
  technicalTermCount: number;
  urgencySignals: string[];
  hurriedSignals: number;
  analyticalSignals: number;
  conversationalSignals: number;
}

export class ConversationAnalyzer {
  /**
   * Analyze a single message and extract metrics
   */
  static analyzeMessage(content: string): MessageAnalysisResult {
    const lowerContent = content.toLowerCase();
    const words = content.trim().split(/\s+/);
    const wordCount = words.length;
    const characterCount = content.length;

    // Check for questions
    const hasQuestion = content.includes('?');
    
    // Determine question depth
    let questionDepth: 'none' | 'simple' | 'moderate' | 'deep' = 'none';
    if (hasQuestion) {
      const hasDeepKeywords = DEEP_KEYWORDS.some(kw => lowerContent.includes(kw));
      const hasMultipleQuestions = (content.match(/\?/g) || []).length > 1;
      const isLongQuestion = wordCount > 30;
      
      if (hasDeepKeywords || hasMultipleQuestions) {
        questionDepth = 'deep';
      } else if (isLongQuestion || wordCount > 15) {
        questionDepth = 'moderate';
      } else {
        questionDepth = 'simple';
      }
    }

    // Count technical terms
    const technicalTermCount = TECHNICAL_TERMS.filter(term => 
      lowerContent.includes(term)
    ).length;

    // Detect urgency signals
    const urgencySignals = URGENCY_KEYWORDS.filter(kw => 
      lowerContent.includes(kw)
    );

    // Calculate signal scores
    let hurriedSignals = 0;
    let analyticalSignals = 0;
    let conversationalSignals = 0;

    // Hurried signals: short messages, urgency keywords, simple questions
    if (wordCount < 10) hurriedSignals += 2;
    else if (wordCount < 20) hurriedSignals += 1;
    hurriedSignals += urgencySignals.length * 2;
    if (questionDepth === 'simple') hurriedSignals += 1;

    // Analytical signals: technical terms, deep questions, long messages
    analyticalSignals += technicalTermCount * 3;
    if (questionDepth === 'deep') analyticalSignals += 5;
    else if (questionDepth === 'moderate') analyticalSignals += 2;
    if (wordCount > 50) analyticalSignals += 3;
    else if (wordCount > 30) analyticalSignals += 2;
    if (DEEP_KEYWORDS.some(kw => lowerContent.includes(kw))) analyticalSignals += 2;

    // Conversational signals: personal language, casual tone
    const conversationalMatches = CONVERSATIONAL_KEYWORDS.filter(kw => 
      lowerContent.includes(kw)
    ).length;
    conversationalSignals += conversationalMatches * 2;
    if (wordCount > 10 && wordCount < 30 && !technicalTermCount) conversationalSignals += 1;

    return {
      wordCount,
      characterCount,
      hasQuestion,
      questionDepth,
      technicalTermCount,
      urgencySignals,
      hurriedSignals,
      analyticalSignals,
      conversationalSignals
    };
  }

  /**
   * Store message metrics in database
   */
  static async storeMessageMetrics(
    messageId: string,
    conversationId: string,
    content: string,
    responseTimeSeconds?: number
  ) {
    const analysis = this.analyzeMessage(content);

    await db.insert(messageMetrics).values({
      messageId,
      conversationId,
      wordCount: analysis.wordCount,
      characterCount: analysis.characterCount,
      hasQuestion: analysis.hasQuestion,
      questionDepth: analysis.questionDepth,
      technicalTermCount: analysis.technicalTermCount,
      urgencySignals: analysis.urgencySignals,
      responseTimeSeconds,
    });

    return analysis;
  }

  /**
   * Calculate aggregate scores for a conversation
   */
  static async updateConversationAnalysis(conversationId: string, userId: string) {
    // Get all message metrics for this conversation
    const metrics = await db
      .select()
      .from(messageMetrics)
      .where(eq(messageMetrics.conversationId, conversationId))
      .orderBy(desc(messageMetrics.createdAt));

    if (metrics.length === 0) {
      return null;
    }

    // Calculate weighted scores (more recent messages have higher weight)
    let totalHurriedScore = 0;
    let totalAnalyticalScore = 0;
    let totalConversationalScore = 0;
    let totalWeight = 0;

    metrics.forEach((metric: MessageMetrics, index: number) => {
      // Recent messages get higher weight (exponential decay)
      const weight = Math.pow(0.9, index);
      totalWeight += weight;

      // Calculate individual scores
      const hurriedScore = this.calculateHurriedScore(metric);
      const analyticalScore = this.calculateAnalyticalScore(metric);
      const conversationalScore = this.calculateConversationalScore(metric);

      totalHurriedScore += hurriedScore * weight;
      totalAnalyticalScore += analyticalScore * weight;
      totalConversationalScore += conversationalScore * weight;
    });

    // Normalize scores to 0-100 range
    const hurriedScore = Math.min(100, (totalHurriedScore / totalWeight) * 10);
    const analyticalScore = Math.min(100, (totalAnalyticalScore / totalWeight) * 10);
    const conversationalScore = Math.min(100, (totalConversationalScore / totalWeight) * 10);

    // Determine recommended mode
    const recommendedMode = this.determineRecommendedMode(
      hurriedScore,
      analyticalScore,
      conversationalScore
    );

    // Calculate average response time
    const responseTimes = metrics
      .map((m: MessageMetrics) => m.responseTimeSeconds)
      .filter((t): t is number => t !== null);
    const avgResponseTimeSeconds = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length)
      : null;

    // Upsert conversation analysis
    const existing = await db
      .select()
      .from(conversationAnalysis)
      .where(eq(conversationAnalysis.conversationId, conversationId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(conversationAnalysis)
        .set({
          hurriedScore: hurriedScore.toFixed(2),
          analyticalScore: analyticalScore.toFixed(2),
          conversationalScore: conversationalScore.toFixed(2),
          recommendedMode,
          messageCount: metrics.length,
          avgResponseTimeSeconds,
          lastAnalyzedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(conversationAnalysis.conversationId, conversationId));
    } else {
      await db.insert(conversationAnalysis).values({
        conversationId,
        userId,
        hurriedScore: hurriedScore.toFixed(2),
        analyticalScore: analyticalScore.toFixed(2),
        conversationalScore: conversationalScore.toFixed(2),
        recommendedMode,
        messageCount: metrics.length,
        avgResponseTimeSeconds,
      });
    }

    return {
      hurriedScore,
      analyticalScore,
      conversationalScore,
      recommendedMode,
      messageCount: metrics.length,
      avgResponseTimeSeconds,
    };
  }

  /**
   * Calculate hurried score from message metrics
   */
  private static calculateHurriedScore(metric: typeof messageMetrics.$inferSelect): number {
    let score = 0;

    // Short messages indicate hurriedness
    if (metric.wordCount < 10) score += 5;
    else if (metric.wordCount < 20) score += 3;

    // Urgency signals
    score += (metric.urgencySignals?.length || 0) * 4;

    // Simple questions
    if (metric.questionDepth === 'simple') score += 2;

    // Fast response time
    if (metric.responseTimeSeconds && metric.responseTimeSeconds < 10) score += 3;
    else if (metric.responseTimeSeconds && metric.responseTimeSeconds < 30) score += 2;

    return score;
  }

  /**
   * Calculate analytical score from message metrics
   */
  private static calculateAnalyticalScore(metric: typeof messageMetrics.$inferSelect): number {
    let score = 0;

    // Technical terms indicate analytical thinking
    score += metric.technicalTermCount * 3;

    // Deep questions
    if (metric.questionDepth === 'deep') score += 6;
    else if (metric.questionDepth === 'moderate') score += 3;

    // Long messages
    if (metric.wordCount > 50) score += 5;
    else if (metric.wordCount > 30) score += 3;

    return score;
  }

  /**
   * Calculate conversational score from message metrics
   */
  private static calculateConversationalScore(metric: typeof messageMetrics.$inferSelect): number {
    let score = 0;

    // Medium-length messages
    if (metric.wordCount > 15 && metric.wordCount < 40) score += 3;

    // Questions indicate engagement
    if (metric.hasQuestion && metric.questionDepth !== 'deep') score += 2;

    // Low technical terms suggest casual conversation
    if (metric.technicalTermCount === 0 && metric.wordCount > 10) score += 2;

    return score;
  }

  /**
   * Determine recommended mode based on scores
   */
  private static determineRecommendedMode(
    hurriedScore: number,
    analyticalScore: number,
    conversationalScore: number
  ): 'amanda' | 'hybrid' | 'terminal' {
    // Terminal mode for high analytical needs
    if (analyticalScore > 60 && analyticalScore > hurriedScore && analyticalScore > conversationalScore) {
      return 'terminal';
    }

    // Amanda mode for conversational or hurried contexts
    if (conversationalScore > 50 || hurriedScore > 50) {
      return 'amanda';
    }

    // Hybrid as balanced default
    return 'hybrid';
  }

  /**
   * Get current analysis for a conversation
   */
  static async getConversationContext(conversationId: string) {
    const analysis = await db
      .select()
      .from(conversationAnalysis)
      .where(eq(conversationAnalysis.conversationId, conversationId))
      .limit(1);

    return analysis[0] || null;
  }
}
