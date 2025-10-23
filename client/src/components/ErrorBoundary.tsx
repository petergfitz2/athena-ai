import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import AthenaTraderAvatar from "@/components/AthenaTraderAvatar";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      // Send to error tracking service
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <Card className="max-w-lg w-full bg-black/90 backdrop-blur-xl border-white/10 rounded-[28px]">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AthenaTraderAvatar size="medium" showStatus={false} showName={false} />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-light">
                Athena is Having a Moment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground font-light">
                Something unexpected happened, but don't worry - your data is safe. 
                Let's get you back on track.
              </p>
              
              {/* Error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-destructive/10 rounded-[16px] p-4 text-left">
                  <p className="text-xs font-mono text-destructive mb-2">
                    {this.state.error.toString()}
                  </p>
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 overflow-auto max-h-40 text-xs">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRefresh}
                  className="rounded-full flex-1"
                  data-testid="button-refresh-error"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="rounded-full flex-1"
                  data-testid="button-home-error"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If this keeps happening, please contact support
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to use with functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}