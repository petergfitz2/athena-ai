import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Activity, BarChart3, Network, Zap } from "lucide-react";
import { ProtectedRoute } from "@/lib/auth";
import RiskInsights from "@/components/RiskInsights";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import { TickerLink } from "@/components/TickerLink";

interface CorrelationData {
  pairs: Array<{
    symbol1: string;
    symbol2: string;
    correlation: number;
  }>;
  concentrationRisk: number;
}

interface FactorExposure {
  factor: string;
  exposure: number;
  description: string;
}

interface MarketRegime {
  regime: 'bull' | 'bear' | 'high-volatility' | 'neutral';
  confidence: number;
  description: string;
  vix: number;
  marketTrend: number;
}

interface StressTestResult {
  scenario: string;
  portfolioImpact: number;
  description: string;
  year?: string;
}

function AnalyticsPageContent() {
  const { data: correlations, isLoading: loadingCorr } = useQuery<CorrelationData>({
    queryKey: ['/api/analytics/correlation'],
  });

  const { data: factors, isLoading: loadingFactors } = useQuery<FactorExposure[]>({
    queryKey: ['/api/analytics/factors'],
  });

  const { data: regime, isLoading: loadingRegime } = useQuery<MarketRegime>({
    queryKey: ['/api/analytics/regime'],
  });

  const { data: stressTests, isLoading: loadingStress } = useQuery<StressTestResult[]>({
    queryKey: ['/api/analytics/stress-test'],
  });

  const isLoading = loadingCorr || loadingFactors || loadingRegime || loadingStress;

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extralight text-foreground">
              Institutional Analytics
            </h1>
            <p className="text-muted-foreground font-light">
              Advanced portfolio analysis and risk insights
            </p>
          </div>
        </div>

        {/* Correlation Analysis */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-light">Correlation Analysis</CardTitle>
                <CardDescription>
                  See how your holdings move together in real-time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCorr ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : correlations && correlations.pairs.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {correlations.pairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover-elevate"
                      data-testid={`correlation-pair-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-light text-foreground flex items-center gap-2">
                          <TickerLink symbol={pair.symbol1} />
                          <span className="text-muted-foreground">×</span>
                          <TickerLink symbol={pair.symbol2} />
                        </span>
                        <Badge
                          variant={Math.abs(pair.correlation) > 0.7 ? "default" : "secondary"}
                          className="no-default-hover-elevate"
                        >
                          {Math.abs(pair.correlation) > 0.7 ? "High" : "Moderate"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.abs(pair.correlation) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-light text-muted-foreground w-12 text-right">
                          {(pair.correlation * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {correlations.concentrationRisk > 0.7 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-light text-destructive">High Concentration Risk</p>
                      <p className="text-sm text-destructive/80 font-light mt-1">
                        Your portfolio has multiple holdings that move together (correlation{' '}
                        {(correlations.concentrationRisk * 100).toFixed(0)}%). Consider diversification.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground font-light text-center py-8">
                Add multiple holdings to see correlation analysis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Factor Insights */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-light">Factor Insights</CardTitle>
                <CardDescription>
                  What's really driving your returns
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingFactors ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : factors && factors.length > 0 ? (
              <div className="space-y-4">
                {factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-card/50 hover-elevate"
                    data-testid={`factor-${factor.factor.toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-light text-foreground">{factor.factor}</span>
                        <Badge
                          variant={Math.abs(factor.exposure) > 0.6 ? "default" : "secondary"}
                          className="no-default-hover-elevate"
                        >
                          {Math.abs(factor.exposure) > 0.6 ? "Strong" : "Moderate"}
                        </Badge>
                      </div>
                      <span className="text-sm font-light text-muted-foreground">
                        {(factor.exposure * 100).toFixed(0)}% exposure
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.abs(factor.exposure) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-light">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-light text-center py-8">
                Build your portfolio to see factor analysis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Market Regime Tracking */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-light">Market Regime</CardTitle>
                <CardDescription>
                  Current market environment and recommended strategies
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRegime ? (
              <Skeleton className="h-32 w-full" />
            ) : regime ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {regime.regime === 'bull' && <TrendingUp className="w-6 h-6 text-green-500" />}
                    {regime.regime === 'bear' && <TrendingDown className="w-6 h-6 text-red-500" />}
                    {regime.regime === 'high-volatility' && <Zap className="w-6 h-6 text-yellow-500" />}
                    {regime.regime === 'neutral' && <Activity className="w-6 h-6 text-muted-foreground" />}
                    <div>
                      <h3 className="text-2xl font-light text-foreground capitalize">
                        {regime.regime.replace('-', ' ')} Market
                      </h3>
                      <p className="text-sm text-muted-foreground font-light">
                        {regime.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-lg px-4 py-2 no-default-hover-elevate"
                    data-testid="regime-badge"
                  >
                    VIX: {regime.vix.toFixed(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-light">
                  {regime.description}
                </p>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-card/50">
                  <div>
                    <p className="text-sm text-muted-foreground font-light mb-1">Market Trend</p>
                    <p className="text-lg font-light text-foreground">
                      {regime.marketTrend > 0 ? '+' : ''}{(regime.marketTrend * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-light mb-1">Volatility (VIX)</p>
                    <p className="text-lg font-light text-foreground">{regime.vix.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground font-light text-center py-8">
                Market regime data unavailable
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stress Testing */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-light">Stress Testing</CardTitle>
                <CardDescription>
                  How your portfolio would perform in past crises
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStress ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : stressTests && stressTests.length > 0 ? (
              <div className="space-y-4">
                {stressTests.map((test, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-card/50 hover-elevate"
                    data-testid={`stress-test-${test.scenario.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-light text-foreground">{test.scenario}</h4>
                        {test.year && (
                          <p className="text-sm text-muted-foreground font-light">{test.year}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-light ${
                            test.portfolioImpact < 0 ? 'text-destructive' : 'text-green-500'
                          }`}
                        >
                          {test.portfolioImpact > 0 ? '+' : ''}
                          {test.portfolioImpact.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-light">
                      {test.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-light text-center py-8">
                Add holdings to see stress test results
              </p>
            )}
          </CardContent>
        </Card>

        {/* Risk Insights */}
        <div className="space-y-2 mb-6">
          <h2 className="text-3xl font-extralight text-foreground">
            Portfolio Risk Analysis
          </h2>
          <p className="text-muted-foreground font-light">
            Comprehensive risk metrics and alerts
          </p>
        </div>
        <RiskInsights />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsPageContent />
    </ProtectedRoute>
  );
}
