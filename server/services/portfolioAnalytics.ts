import { storage } from "../storage";
import { getQuote, getBatchQuotes, getHistoricalData } from "./marketService";
import type { Holding } from "@shared/schema";

interface PerformanceMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  volatility: number;
  maxDrawdown: number;
  calmarRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
}

interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][];
  interpretation: string;
}

interface RiskMetrics {
  portfolioBeta: number;
  portfolioVolatility: number;
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalVaR: number;
  diversificationRatio: number;
}

// Risk-free rate (US Treasury 3-month bill rate)
const RISK_FREE_RATE = 0.05; // 5% annual

export class PortfolioAnalyticsService {
  /**
   * Calculate Sharpe Ratio
   * (Portfolio Return - Risk Free Rate) / Portfolio Volatility
   */
  private calculateSharpeRatio(returns: number[], riskFreeRate: number = RISK_FREE_RATE): number {
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const annualizedReturn = avgReturn * 252; // Assuming daily returns
    
    const volatility = this.calculateVolatility(returns);
    const annualizedVolatility = volatility * Math.sqrt(252);
    
    if (annualizedVolatility === 0) return 0;
    
    return (annualizedReturn - riskFreeRate) / annualizedVolatility;
  }

  /**
   * Calculate portfolio volatility (standard deviation of returns)
   */
  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate portfolio beta relative to market (S&P 500)
   */
  private calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
    if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length < 2) {
      return 1; // Default to market beta
    }

    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < portfolioReturns.length; i++) {
      covariance += (portfolioReturns[i] - portfolioMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }

    covariance /= (portfolioReturns.length - 1);
    marketVariance /= (marketReturns.length - 1);

    if (marketVariance === 0) return 1;
    
    return covariance / marketVariance;
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(values: number[]): number {
    if (values.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = values[0];

    for (const value of values) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate Sortino Ratio (like Sharpe but only considers downside volatility)
   */
  private calculateSortinoRatio(returns: number[], targetReturn: number = 0): number {
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const annualizedReturn = avgReturn * 252;
    
    // Calculate downside deviation
    const downsideReturns = returns.filter(r => r < targetReturn);
    if (downsideReturns.length === 0) return 10; // No downside, excellent!
    
    const downsideDeviation = this.calculateVolatility(downsideReturns);
    const annualizedDownside = downsideDeviation * Math.sqrt(252);
    
    if (annualizedDownside === 0) return 10;
    
    return (annualizedReturn - RISK_FREE_RATE) / annualizedDownside;
  }

  /**
   * Calculate correlation matrix between holdings
   */
  private calculateCorrelationMatrix(returnsData: Map<string, number[]>): CorrelationMatrix {
    const symbols = Array.from(returnsData.keys());
    const n = symbols.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Perfect correlation with itself
        } else if (j < i) {
          matrix[i][j] = matrix[j][i]; // Symmetric matrix
        } else {
          const returns1 = returnsData.get(symbols[i])!;
          const returns2 = returnsData.get(symbols[j])!;
          matrix[i][j] = this.calculateCorrelation(returns1, returns2);
        }
      }
    }

    // Generate interpretation
    let highCorrelations = 0;
    let lowCorrelations = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(matrix[i][j]) > 0.7) highCorrelations++;
        if (Math.abs(matrix[i][j]) < 0.3) lowCorrelations++;
      }
    }

    const totalPairs = (n * (n - 1)) / 2;
    const highPct = (highCorrelations / totalPairs) * 100;
    const lowPct = (lowCorrelations / totalPairs) * 100;

    let interpretation = "";
    if (highPct > 50) {
      interpretation = `High correlation detected (${highPct.toFixed(0)}% of pairs). Portfolio lacks diversification - consider adding uncorrelated assets.`;
    } else if (lowPct > 70) {
      interpretation = `Well-diversified portfolio (${lowPct.toFixed(0)}% of pairs have low correlation). Good risk distribution across holdings.`;
    } else {
      interpretation = `Moderate diversification. ${highPct.toFixed(0)}% highly correlated, ${lowPct.toFixed(0)}% lowly correlated pairs.`;
    }

    return { symbols, matrix, interpretation };
  }

  /**
   * Calculate correlation between two return series
   */
  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length || returns1.length < 2) return 0;

    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(variance1 * variance2);
    if (denominator === 0) return 0;

    return covariance / denominator;
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  private calculateVaR(returns: number[], confidenceLevel: number): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(returns.length * (1 - confidenceLevel));
    return Math.abs(sortedReturns[index] || 0);
  }

  /**
   * Generate mock returns for demonstration
   */
  private generateMockReturns(symbol: string, days: number = 252): number[] {
    const returns: number[] = [];
    
    // Use symbol hash for consistent random seed
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i);
    }
    
    // Generate returns with some realistic patterns
    const trend = (seed % 3 - 1) * 0.0002; // Slight trend
    const volatility = 0.015 + (seed % 10) * 0.002; // Daily volatility 1.5-3.5%
    
    for (let i = 0; i < days; i++) {
      // Simple random walk with trend
      const random = (Math.sin(seed + i) * 43758.5453123) % 1;
      const dailyReturn = trend + (random - 0.5) * 2 * volatility;
      returns.push(dailyReturn);
    }
    
    return returns;
  }

  /**
   * Get comprehensive performance metrics for a portfolio
   */
  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    const holdings = await storage.getUserHoldings(userId);
    
    if (holdings.length === 0) {
      return {
        sharpeRatio: 0,
        beta: 1,
        alpha: 0,
        volatility: 0,
        maxDrawdown: 0,
        calmarRatio: 0,
        sortinoRatio: 0,
        treynorRatio: 0
      };
    }

    // Generate mock portfolio returns (in production, fetch real historical data)
    const portfolioReturns = this.generateMockReturns("PORTFOLIO", 252);
    const marketReturns = this.generateMockReturns("SPY", 252);
    
    // Calculate portfolio values for drawdown
    let portfolioValues = [100000]; // Start with $100k
    for (const ret of portfolioReturns) {
      portfolioValues.push(portfolioValues[portfolioValues.length - 1] * (1 + ret));
    }

    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns);
    const beta = this.calculateBeta(portfolioReturns, marketReturns);
    const volatility = this.calculateVolatility(portfolioReturns);
    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues);
    const sortinoRatio = this.calculateSortinoRatio(portfolioReturns);
    
    // Calculate alpha (portfolio return - expected return based on beta)
    const portfolioAnnualReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length * 252;
    const marketAnnualReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length * 252;
    const expectedReturn = RISK_FREE_RATE + beta * (marketAnnualReturn - RISK_FREE_RATE);
    const alpha = portfolioAnnualReturn - expectedReturn;
    
    // Calmar Ratio (Annual Return / Max Drawdown)
    const calmarRatio = maxDrawdown > 0 ? portfolioAnnualReturn / maxDrawdown : 0;
    
    // Treynor Ratio (Return - Risk Free / Beta)
    const treynorRatio = beta !== 0 ? (portfolioAnnualReturn - RISK_FREE_RATE) / beta : 0;

    return {
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      beta: Number(beta.toFixed(2)),
      alpha: Number((alpha * 100).toFixed(2)), // As percentage
      volatility: Number((volatility * Math.sqrt(252) * 100).toFixed(2)), // Annualized as percentage
      maxDrawdown: Number((maxDrawdown * 100).toFixed(2)), // As percentage
      calmarRatio: Number(calmarRatio.toFixed(2)),
      sortinoRatio: Number(sortinoRatio.toFixed(2)),
      treynorRatio: Number(treynorRatio.toFixed(2))
    };
  }

  /**
   * Get correlation matrix for portfolio holdings
   */
  async getCorrelationMatrix(userId: string): Promise<CorrelationMatrix> {
    const holdings = await storage.getUserHoldings(userId);
    
    if (holdings.length < 2) {
      return {
        symbols: holdings.map(h => h.symbol),
        matrix: holdings.length === 1 ? [[1]] : [],
        interpretation: holdings.length === 0 
          ? "Add holdings to see correlation analysis" 
          : "Add more holdings to analyze correlations"
      };
    }

    // Generate mock returns for each holding
    const returnsData = new Map<string, number[]>();
    for (const holding of holdings) {
      returnsData.set(holding.symbol, this.generateMockReturns(holding.symbol, 252));
    }

    return this.calculateCorrelationMatrix(returnsData);
  }

  /**
   * Get risk metrics for portfolio
   */
  async getRiskMetrics(userId: string): Promise<RiskMetrics> {
    const holdings = await storage.getUserHoldings(userId);
    
    if (holdings.length === 0) {
      return {
        portfolioBeta: 1,
        portfolioVolatility: 0,
        valueAtRisk95: 0,
        valueAtRisk99: 0,
        conditionalVaR: 0,
        diversificationRatio: 1
      };
    }

    // Calculate weighted portfolio metrics
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0);
    const weights = holdings.map(h => (h.quantity * h.averagePrice) / totalValue);
    
    // Generate returns
    const portfolioReturns = this.generateMockReturns("PORTFOLIO", 252);
    const marketReturns = this.generateMockReturns("SPY", 252);
    
    const portfolioBeta = this.calculateBeta(portfolioReturns, marketReturns);
    const portfolioVolatility = this.calculateVolatility(portfolioReturns) * Math.sqrt(252) * 100;
    
    // Value at Risk
    const valueAtRisk95 = this.calculateVaR(portfolioReturns, 0.95) * 100;
    const valueAtRisk99 = this.calculateVaR(portfolioReturns, 0.99) * 100;
    
    // Conditional VaR (average of returns worse than VaR)
    const sortedReturns = [...portfolioReturns].sort((a, b) => a - b);
    const var95Index = Math.floor(portfolioReturns.length * 0.05);
    const tailReturns = sortedReturns.slice(0, var95Index);
    const conditionalVaR = tailReturns.length > 0 
      ? Math.abs(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length) * 100
      : valueAtRisk95;
    
    // Diversification ratio (simplified)
    const diversificationRatio = 1 + (holdings.length - 1) * 0.1; // Simplified metric

    return {
      portfolioBeta: Number(portfolioBeta.toFixed(2)),
      portfolioVolatility: Number(portfolioVolatility.toFixed(2)),
      valueAtRisk95: Number(valueAtRisk95.toFixed(2)),
      valueAtRisk99: Number(valueAtRisk99.toFixed(2)),
      conditionalVaR: Number(conditionalVaR.toFixed(2)),
      diversificationRatio: Number(diversificationRatio.toFixed(2))
    };
  }
}

export const portfolioAnalytics = new PortfolioAnalyticsService();