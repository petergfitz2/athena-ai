import { Switch, Route, useLocation, Redirect } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ModeProvider, useMode } from "@/contexts/ModeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { StockDetailModalProvider } from "@/contexts/StockDetailModalContext";
import RightChatPanel from "@/components/RightChatPanel";
import FloatingChatBubble from "@/components/FloatingChatBubble";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthPage from "@/pages/AuthPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
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
import AnimatedPage from "@/components/AnimatedPage";

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
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Switch location={location}>
        <Route path="/">
          {/* Show AuthPage as home page when not logged in, CommandCenter when logged in */}
          <AnimatedPage key="home">
            {user ? <CommandCenter /> : <AuthPage />}
          </AnimatedPage>
        </Route>
        <Route path="/auth">
          <AnimatedPage key="auth">
            <AuthPage />
          </AnimatedPage>
        </Route>
        <Route path="/reset-password">
          <AnimatedPage key="reset-password">
            <PasswordResetPage />
          </AnimatedPage>
        </Route>
        {/* Command Center is now the main dashboard */}
        <Route path="/command-center">
          <AnimatedPage key="command-center">
            <CommandCenter />
          </AnimatedPage>
        </Route>
        <Route path="/dashboard">
          <AnimatedPage key="dashboard">
            <CommandCenter />
          </AnimatedPage>
        </Route>
        <Route path="/portfolio">
          <AnimatedPage key="portfolio">
            <PortfolioPage />
          </AnimatedPage>
        </Route>
        <Route path="/watchlist">
          <AnimatedPage key="watchlist">
            <WatchlistPage />
          </AnimatedPage>
        </Route>
        <Route path="/settings">
          <AnimatedPage key="settings">
            <SettingsPage />
          </AnimatedPage>
        </Route>
        <Route path="/trades">
          <AnimatedPage key="trades">
            <TradesPage />
          </AnimatedPage>
        </Route>
        <Route path="/analytics">
          <AnimatedPage key="analytics">
            <AnalyticsPage />
          </AnimatedPage>
        </Route>
        <Route path="/news">
          <AnimatedPage key="news">
            <NewsAggregationPage />
          </AnimatedPage>
        </Route>
        {/* Phase 2 Features */}
        <Route path="/simulator">
          <AnimatedPage key="simulator">
            <InvestmentSimulator />
          </AnimatedPage>
        </Route>
        <Route path="/social">
          {user ? (
            <AnimatedPage key="social">
              <SocialTradingPage />
            </AnimatedPage>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/achievements">
          {user ? (
            <AnimatedPage key="achievements">
              <AchievementsPage />
            </AnimatedPage>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/leaderboard">
          {user ? (
            <AnimatedPage key="leaderboard">
              <LeaderboardPage />
            </AnimatedPage>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        {/* Archived mode pages - still accessible via URL but not in main navigation */}
        <Route path="/athena">
          <AnimatedPage key="athena">
            <AthenaMode />
          </AnimatedPage>
        </Route>
        <Route path="/hybrid">
          <AnimatedPage key="hybrid">
            <HybridMode />
          </AnimatedPage>
        </Route>
        <Route path="/terminal">
          <AnimatedPage key="terminal">
            <TerminalMode />
          </AnimatedPage>
        </Route>
        <Route path="/select-mode">
          {user ? (
            <AnimatedPage key="select-mode">
              <CommandCenter />
            </AnimatedPage>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        {/* Help pages */}
        <Route path="/tutorials">
          <AnimatedPage key="tutorials">
            <TutorialsPage />
          </AnimatedPage>
        </Route>
        <Route path="/faq">
          <AnimatedPage key="faq">
            <FAQPage />
          </AnimatedPage>
        </Route>
        <Route path="/help">
          <AnimatedPage key="help">
            <HelpPage />
          </AnimatedPage>
        </Route>
        <Route>
          <AnimatedPage key="not-found">
            <NotFound />
          </AnimatedPage>
        </Route>
      </Switch>
    </AnimatePresence>
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
