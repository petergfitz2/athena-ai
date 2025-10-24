import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ModeProvider, useMode } from "@/contexts/ModeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { StockDetailModalProvider } from "@/contexts/StockDetailModalContext";
import LeftChatPanel from "@/components/LeftChatPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthPage from "@/pages/AuthPage";
import CommandCenter from "@/components/CommandCenter";
import PortfolioPage from "@/pages/PortfolioPage";
// Archived mode pages - kept for reference but not in main navigation
import AthenaMode from "@/pages/AthenaMode";
import HybridMode from "@/pages/HybridMode";
import TerminalMode from "@/pages/TerminalMode";
import DashboardPage from "@/pages/DashboardPage";
import WatchlistPage from "@/pages/WatchlistPage";
import SettingsPage from "@/pages/SettingsPage";
import TradesPage from "@/pages/TradesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TutorialsPage from "@/pages/TutorialsPage";
import FAQPage from "@/pages/FAQPage";
import HelpPage from "@/pages/HelpPage";
import ModeSelector from "@/components/ModeSelector";
// Phase 2 pages
import InvestmentSimulator from "@/pages/InvestmentSimulator";
import SocialTradingPage from "@/pages/SocialTradingPage";
import AchievementsPage from "@/pages/AchievementsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NewsAggregationPage from "@/pages/NewsAggregationPage";
import NotFound from "@/pages/not-found";

// Command Center is now the default - no mode selection needed
function CommandCenterWrapper() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/" />;
  }

  return <CommandCenter />;
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/">
        {/* Always show CommandCenter with demo data when not logged in */}
        <CommandCenter />
      </Route>
      {/* Command Center is now the main dashboard */}
      <Route path="/command-center">
        <CommandCenter />
      </Route>
      <Route path="/dashboard">
        <CommandCenter />
      </Route>
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/watchlist" component={WatchlistPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/trades" component={TradesPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/news" component={NewsAggregationPage} />
      {/* Phase 2 Features */}
      <Route path="/simulator" component={InvestmentSimulator} />
      <Route path="/social">
        {user ? <SocialTradingPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/achievements">
        {user ? <AchievementsPage /> : <Redirect to="/" />}
      </Route>
      <Route path="/leaderboard">
        {user ? <LeaderboardPage /> : <Redirect to="/" />}
      </Route>
      {/* Archived mode pages - still accessible via URL but not in main navigation */}
      <Route path="/athena" component={AthenaMode} />
      <Route path="/hybrid" component={HybridMode} />
      <Route path="/terminal" component={TerminalMode} />
      <Route path="/select-mode">
        {user ? <CommandCenter /> : <Redirect to="/" />}
      </Route>
      {/* Help pages */}
      <Route path="/tutorials" component={TutorialsPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ModeProvider>
            <ChatProvider>
              <StockDetailModalProvider>
                <TooltipProvider>
                  <div className="dark">
                    <LeftChatPanel />
                    <Toaster />
                    <Router />
                  </div>
                </TooltipProvider>
              </StockDetailModalProvider>
            </ChatProvider>
          </ModeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
