import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ModeProvider, useMode } from "@/contexts/ModeContext";
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
      <Route path="/" component={AuthPage} />
      {/* Command Center is now the main dashboard */}
      <Route path="/command-center" component={CommandCenterWrapper} />
      <Route path="/dashboard">
        {user ? <Redirect to="/command-center" /> : <Redirect to="/" />}
      </Route>
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/watchlist" component={WatchlistPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/trades" component={TradesPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      {/* Archived mode pages - still accessible via URL but not in main navigation */}
      <Route path="/athena" component={AthenaMode} />
      <Route path="/hybrid" component={HybridMode} />
      <Route path="/terminal" component={TerminalMode} />
      <Route path="/select-mode">
        {user ? <Redirect to="/command-center" /> : <Redirect to="/" />}
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModeProvider>
          <TooltipProvider>
            <div className="dark">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </ModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
