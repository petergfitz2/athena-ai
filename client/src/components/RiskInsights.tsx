import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RiskMetrics {
  concentrationScore: number;
  diversificationScore: number;
  volatility: number;
  beta: number;
  sharpeRatio: number;
  alerts: Array<{
    type: 'concentration' | 'volatility' | 'exposure';
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;
}

export default function RiskInsights() {
  const { data: riskMetrics, isLoading } = useQuery<RiskMetrics>({
    queryKey: ['/api/portfolio/risk-metrics'],
  });

  if (isLoading) {
    return (
      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="text-xl font-light">Risk Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskMetrics) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Alerts */}
      {riskMetrics.alerts.length > 0 && (
        <Card className="rounded-[28px] border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <CardTitle className="text-xl font-light text-destructive">
                  Risk Alerts
                </CardTitle>
                <CardDescription>
                  {riskMetrics.alerts.length} active {riskMetrics.alerts.length === 1 ? 'alert' : 'alerts'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskMetrics.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-lg bg-background/50"
                data-testid={`risk-alert-${idx}`}
              >
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'high' ? 'text-destructive' : 
                  alert.severity === 'medium' ? 'text-yellow-500' : 
                  'text-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(alert.severity)} className="no-default-hover-elevate">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="no-default-hover-elevate">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground font-light">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concentration Risk */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-light">Concentration Risk</CardTitle>
                <CardDescription>How diversified is your portfolio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-4xl font-light ${getScoreColor(100 - riskMetrics.concentrationScore)}`}>
                    {riskMetrics.concentrationScore.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Badge variant="outline" className="no-default-hover-elevate" data-testid="concentration-badge">
                  {riskMetrics.concentrationScore < 30 ? 'Well Diversified' : 
                   riskMetrics.concentrationScore < 60 ? 'Moderately Concentrated' : 
                   'Highly Concentrated'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-light">
                Lower scores indicate better diversification. Your portfolio has{' '}
                {riskMetrics.concentrationScore < 30 ? 'healthy' : 
                 riskMetrics.concentrationScore < 60 ? 'moderate' : 
                 'high'} concentration risk.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Diversification Score */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-light">Diversification</CardTitle>
                <CardDescription>Portfolio risk distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-4xl font-light ${getScoreColor(riskMetrics.diversificationScore)}`}>
                    {riskMetrics.diversificationScore.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Badge variant="outline" className="no-default-hover-elevate" data-testid="diversification-badge">
                  {getScoreBadge(riskMetrics.diversificationScore)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-light">
                Higher scores indicate better risk distribution across different assets and sectors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Volatility */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-light">Volatility (30d)</CardTitle>
                <CardDescription>Portfolio price fluctuation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-light text-foreground">
                    {riskMetrics.volatility.toFixed(1)}%
                  </span>
                </div>
                <Badge variant="outline" className="no-default-hover-elevate" data-testid="volatility-badge">
                  {riskMetrics.volatility < 15 ? 'Low' : 
                   riskMetrics.volatility < 25 ? 'Moderate' : 
                   'High'} Volatility
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-light">
                30-day annualized volatility. Market average is typically 15-20%.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Beta & Sharpe */}
        <Card className="rounded-[28px]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-light">Risk Metrics</CardTitle>
                <CardDescription>Market correlation and risk-adjusted returns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-light mb-1">Beta (Market Correlation)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-foreground">{riskMetrics.beta.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">
                    {riskMetrics.beta < 1 ? 'Less volatile than market' : 
                     riskMetrics.beta === 1 ? 'Tracks market' : 
                     'More volatile than market'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-light mb-1">Sharpe Ratio</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-foreground">{riskMetrics.sharpeRatio.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">
                    {riskMetrics.sharpeRatio > 2 ? 'Excellent' : 
                     riskMetrics.sharpeRatio > 1 ? 'Good' : 
                     riskMetrics.sharpeRatio > 0 ? 'Fair' : 
                     'Poor'} risk-adjusted returns
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
