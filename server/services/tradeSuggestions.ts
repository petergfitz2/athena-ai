import { storage } from "../storage";
import { getQuote, getBatchQuotes } from "./marketService";
import { portfolioAnalytics } from "./portfolioAnalytics";
import type { Holding } from "@shared/schema";

export interface TradeSuggestion {
  id: string;
  type: "buy" | "sell" | "rebalance";
  symbol: string;
  companyName: string;
  currentPrice: number;
  targetPrice: number;
  quantity: number;
  reason: string;
  confidence: number;
  impact: {
    portfolioDiversification: string;
    riskAdjustment: string;
    expectedReturn: string;
  };
  technicalSignals: {
    rsi: number;
    macd: "bullish" | "bearish" | "neutral";
    movingAverage: "above" | "below";
    volume: "increasing" | "decreasing" | "stable";
  };
  timeHorizon: "short" | "medium" | "long";
  priority: "high" | "medium" | "low";
}

interface PortfolioRebalancing {
  currentAllocation: Map<string, number>;
  targetAllocation: Map<string, number>;
  suggestions: TradeSuggestion[];
  rationale: string;
}

export class TradeSuggestionsService {
  /**
   * Generate mock technical indicators
   */
  private generateTechnicalSignals(symbol: string): TradeSuggestion["technicalSignals"] {
    // Use symbol for consistent mock data
    const seed = symbol.charCodeAt(0) + symbol.charCodeAt(1 || 0);
    
    return {
      rsi: 30 + (seed % 40), // RSI between 30-70
      macd: seed % 3 === 0 ? "bullish" : seed % 3 === 1 ? "bearish" : "neutral",
      movingAverage: seed % 2 === 0 ? "above" : "below",
      volume: seed % 3 === 0 ? "increasing" : seed % 3 === 1 ? "decreasing" : "stable"
    };
  }

  /**
   * Analyze portfolio and generate smart trade suggestions
   */
  async generateTradeSuggestions(userId: string): Promise<TradeSuggestion[]> {
    const holdings = await storage.getUserHoldings(userId);
    const watchlist = await storage.getUserWatchlist(userId);
    
    if (holdings.length === 0) {
      // Suggest starter positions for new portfolio
      return this.generateStarterSuggestions();
    }

    const suggestions: TradeSuggestion[] = [];
    
    // Get portfolio metrics
    const performanceMetrics = await portfolioAnalytics.getPerformanceMetrics(userId);
    const riskMetrics = await portfolioAnalytics.getRiskMetrics(userId);
    
    // Analyze current portfolio composition
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
    const allocation = new Map<string, number>();
    
    for (const holding of holdings) {
      const weight = (holding.quantity * holding.averagePrice) / totalValue;
      allocation.set(holding.symbol, weight);
      
      // Check for overweight positions (>25% of portfolio)
      if (weight > 0.25) {
        suggestions.push({
          id: `trim-${holding.symbol}`,
          type: "sell",
          symbol: holding.symbol,
          companyName: holding.name,
          currentPrice: holding.averagePrice,
          targetPrice: holding.averagePrice * 1.05,
          quantity: Math.floor(holding.quantity * 0.2), // Trim 20%
          reason: `Position represents ${(weight * 100).toFixed(1)}% of portfolio. Trimming for better diversification.`,
          confidence: 85,
          impact: {
            portfolioDiversification: "Improves by reducing concentration risk",
            riskAdjustment: "Lowers portfolio beta and volatility",
            expectedReturn: "Neutral - reallocate to growth opportunities"
          },
          technicalSignals: this.generateTechnicalSignals(holding.symbol),
          timeHorizon: "short",
          priority: "high"
        });
      }
      
      // Check for underperforming positions
      const performance = ((holding.averagePrice - holding.averagePrice * 0.9) / holding.averagePrice) * 100;
      if (performance < -15) {
        const technicals = this.generateTechnicalSignals(holding.symbol);
        
        if (technicals.rsi < 30) {
          // Oversold - potential buy opportunity
          suggestions.push({
            id: `accumulate-${holding.symbol}`,
            type: "buy",
            symbol: holding.symbol,
            companyName: holding.name,
            currentPrice: holding.averagePrice * 0.85,
            targetPrice: holding.averagePrice,
            quantity: Math.floor(holding.quantity * 0.3),
            reason: `RSI indicates oversold conditions (${technicals.rsi}). Good accumulation opportunity.`,
            confidence: 75,
            impact: {
              portfolioDiversification: "Neutral - adding to existing position",
              riskAdjustment: "Increases exposure to recovering asset",
              expectedReturn: "+15-20% potential on mean reversion"
            },
            technicalSignals: technicals,
            timeHorizon: "medium",
            priority: "medium"
          });
        }
      }
    }
    
    // Suggest new positions from watchlist
    if (watchlist.length > 0) {
      const topWatchlistItems = watchlist.slice(0, 3);
      
      for (const item of topWatchlistItems) {
        const technicals = this.generateTechnicalSignals(item.symbol);
        
        if (technicals.macd === "bullish" && technicals.movingAverage === "above") {
          suggestions.push({
            id: `new-${item.symbol}`,
            type: "buy",
            symbol: item.symbol,
            companyName: item.name || item.symbol,
            currentPrice: item.currentPrice || 100,
            targetPrice: (item.currentPrice || 100) * 1.15,
            quantity: Math.floor(totalValue * 0.05 / (item.currentPrice || 100)),
            reason: `Strong technical setup with bullish MACD crossover and price above moving average.`,
            confidence: 70,
            impact: {
              portfolioDiversification: "Adds new sector exposure",
              riskAdjustment: "Slightly increases portfolio beta",
              expectedReturn: "+12-18% based on momentum signals"
            },
            technicalSignals: technicals,
            timeHorizon: "medium",
            priority: "low"
          });
        }
      }
    }
    
    // Risk-based suggestions
    if (riskMetrics.portfolioBeta > 1.3) {
      suggestions.push({
        id: "add-defensive",
        type: "buy",
        symbol: "JNJ",
        companyName: "Johnson & Johnson",
        currentPrice: 155,
        targetPrice: 165,
        quantity: Math.floor(totalValue * 0.1 / 155),
        reason: `Portfolio beta (${riskMetrics.portfolioBeta}) is high. Adding defensive healthcare stock for stability.`,
        confidence: 80,
        impact: {
          portfolioDiversification: "Adds defensive sector allocation",
          riskAdjustment: "Reduces portfolio beta closer to 1.0",
          expectedReturn: "+6-8% with lower volatility"
        },
        technicalSignals: this.generateTechnicalSignals("JNJ"),
        timeHorizon: "long",
        priority: "high"
      });
    }
    
    // Volatility-based suggestions
    if (riskMetrics.portfolioVolatility > 25) {
      suggestions.push({
        id: "add-bonds",
        type: "buy",
        symbol: "BND",
        companyName: "Vanguard Total Bond ETF",
        currentPrice: 75,
        targetPrice: 77,
        quantity: Math.floor(totalValue * 0.15 / 75),
        reason: `Portfolio volatility (${riskMetrics.portfolioVolatility.toFixed(1)}%) exceeds comfort zone. Bonds provide stability.`,
        confidence: 90,
        impact: {
          portfolioDiversification: "Adds fixed income allocation",
          riskAdjustment: "Significantly reduces volatility",
          expectedReturn: "+3-4% with capital preservation"
        },
        technicalSignals: this.generateTechnicalSignals("BND"),
        timeHorizon: "long",
        priority: "medium"
      });
    }
    
    // Sort by priority and confidence
    suggestions.sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      const aScore = priorityScore[a.priority] * a.confidence;
      const bScore = priorityScore[b.priority] * b.confidence;
      return bScore - aScore;
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Generate starter suggestions for new portfolios
   */
  private generateStarterSuggestions(): TradeSuggestion[] {
    return [
      {
        id: "starter-spy",
        type: "buy",
        symbol: "SPY",
        companyName: "SPDR S&P 500 ETF",
        currentPrice: 450,
        targetPrice: 495,
        quantity: 10,
        reason: "Core holding for broad market exposure. Foundation of any diversified portfolio.",
        confidence: 95,
        impact: {
          portfolioDiversification: "Provides instant diversification across 500 companies",
          riskAdjustment: "Market-neutral beta of 1.0",
          expectedReturn: "+8-10% historical annual average"
        },
        technicalSignals: this.generateTechnicalSignals("SPY"),
        timeHorizon: "long",
        priority: "high"
      },
      {
        id: "starter-qqq",
        type: "buy",
        symbol: "QQQ",
        companyName: "Invesco QQQ Trust",
        currentPrice: 380,
        targetPrice: 420,
        quantity: 5,
        reason: "Growth-focused technology exposure. Complements SPY with innovation leaders.",
        confidence: 85,
        impact: {
          portfolioDiversification: "Adds technology sector tilt",
          riskAdjustment: "Higher beta (~1.2) for growth",
          expectedReturn: "+12-15% with higher volatility"
        },
        technicalSignals: this.generateTechnicalSignals("QQQ"),
        timeHorizon: "medium",
        priority: "medium"
      },
      {
        id: "starter-vti",
        type: "buy",
        symbol: "VTI",
        companyName: "Vanguard Total Stock Market ETF",
        currentPrice: 230,
        targetPrice: 250,
        quantity: 8,
        reason: "Complete US market coverage including small and mid-caps.",
        confidence: 90,
        impact: {
          portfolioDiversification: "Maximum diversification across all market caps",
          riskAdjustment: "Balanced risk profile",
          expectedReturn: "+7-9% with broad exposure"
        },
        technicalSignals: this.generateTechnicalSignals("VTI"),
        timeHorizon: "long",
        priority: "high"
      }
    ];
  }

  /**
   * Generate portfolio rebalancing recommendations
   */
  async generateRebalancingPlan(userId: string): Promise<PortfolioRebalancing> {
    const holdings = await storage.getUserHoldings(userId);
    
    if (holdings.length === 0) {
      return {
        currentAllocation: new Map(),
        targetAllocation: new Map(),
        suggestions: [],
        rationale: "Add holdings to receive rebalancing recommendations."
      };
    }

    // Calculate current allocation
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
    const currentAllocation = new Map<string, number>();
    
    for (const holding of holdings) {
      const weight = (holding.quantity * holding.averagePrice) / totalValue;
      currentAllocation.set(holding.symbol, weight);
    }

    // Define target allocation based on risk profile
    const riskMetrics = await portfolioAnalytics.getRiskMetrics(userId);
    const isAggressive = riskMetrics.portfolioBeta > 1.2;
    const isConservative = riskMetrics.portfolioBeta < 0.8;
    
    // Generate target allocation
    const targetAllocation = new Map<string, number>();
    const suggestions: TradeSuggestion[] = [];
    
    if (isAggressive) {
      // Aggressive allocation: 70% stocks, 20% growth, 10% alternatives
      targetAllocation.set("Stocks", 0.70);
      targetAllocation.set("Growth", 0.20);
      targetAllocation.set("Alternatives", 0.10);
      
      // Generate rebalancing trades
      for (const [symbol, currentWeight] of currentAllocation) {
        const targetWeight = 1 / holdings.length; // Equal weight for simplicity
        const diff = targetWeight - currentWeight;
        
        if (Math.abs(diff) > 0.05) { // Only rebalance if difference > 5%
          const holding = holdings.find(h => h.symbol === symbol)!;
          const targetQuantity = Math.floor((targetWeight * totalValue) / holding.averagePrice);
          const quantityDiff = targetQuantity - holding.quantity;
          
          suggestions.push({
            id: `rebalance-${symbol}`,
            type: quantityDiff > 0 ? "buy" : "sell",
            symbol: symbol,
            companyName: holding.name,
            currentPrice: holding.averagePrice,
            targetPrice: holding.averagePrice,
            quantity: Math.abs(quantityDiff),
            reason: `Rebalance from ${(currentWeight * 100).toFixed(1)}% to ${(targetWeight * 100).toFixed(1)}%`,
            confidence: 80,
            impact: {
              portfolioDiversification: "Optimizes allocation weights",
              riskAdjustment: "Maintains target risk profile",
              expectedReturn: "Improves risk-adjusted returns"
            },
            technicalSignals: this.generateTechnicalSignals(symbol),
            timeHorizon: "short",
            priority: Math.abs(diff) > 0.1 ? "high" : "medium"
          });
        }
      }
    } else if (isConservative) {
      // Conservative allocation: 50% stocks, 40% bonds, 10% cash
      targetAllocation.set("Stocks", 0.50);
      targetAllocation.set("Bonds", 0.40);
      targetAllocation.set("Cash", 0.10);
    } else {
      // Balanced allocation: 60% stocks, 30% bonds, 10% alternatives
      targetAllocation.set("Stocks", 0.60);
      targetAllocation.set("Bonds", 0.30);
      targetAllocation.set("Alternatives", 0.10);
    }

    const rationale = isAggressive 
      ? "Aggressive growth strategy: Maximize returns with higher risk tolerance."
      : isConservative 
      ? "Conservative strategy: Preserve capital with steady income generation."
      : "Balanced strategy: Optimize risk-adjusted returns with diversification.";

    return {
      currentAllocation,
      targetAllocation,
      suggestions: suggestions.slice(0, 3), // Top 3 rebalancing moves
      rationale
    };
  }

  /**
   * Generate AI-powered market insights
   */
  async generateMarketInsights(): Promise<{
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
    keyFactors: string[];
    recommendation: string;
  }> {
    // Mock market sentiment analysis
    const randomSentiment = Math.random();
    const sentiment = randomSentiment > 0.6 ? "bullish" : randomSentiment > 0.3 ? "neutral" : "bearish";
    
    const keyFactors = sentiment === "bullish" 
      ? [
          "Fed signals pause in rate hikes",
          "Strong corporate earnings beats",
          "Unemployment at historic lows",
          "Technology sector momentum"
        ]
      : sentiment === "bearish"
      ? [
          "Inflation concerns persist",
          "Geopolitical tensions rising",
          "Credit market stress signals",
          "Recession probability increasing"
        ]
      : [
          "Mixed economic signals",
          "Sector rotation ongoing",
          "Volatility range-bound",
          "Waiting for catalyst"
        ];
    
    const recommendation = sentiment === "bullish"
      ? "Increase equity allocation. Focus on growth sectors with momentum."
      : sentiment === "bearish"
      ? "Reduce risk exposure. Increase cash and defensive positions."
      : "Maintain current allocation. Be selective with new positions.";
    
    return {
      sentiment,
      confidence: 70 + Math.random() * 20,
      keyFactors: keyFactors.slice(0, 3),
      recommendation
    };
  }
}

export const tradeSuggestions = new TradeSuggestionsService();