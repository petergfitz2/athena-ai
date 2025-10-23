import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ModeProvider, useMode } from "@/contexts/ModeContext";
import AuthPage from "@/pages/AuthPage";
import AmandaMode from "@/pages/AmandaMode";
import HybridMode from "@/pages/HybridMode";
import TerminalMode from "@/pages/TerminalMode";
import DashboardPage from "@/pages/DashboardPage";
import ModeSelector from "@/components/ModeSelector";
import NotFound from "@/pages/not-found";

function ModeSelectorPage() {
  const { user } = useAuth();
  const { currentMode } = useMode();
  const [, setLocation] = useLocation();

  if (!user) {
    return <Redirect to="/" />;
  }

  // Auto-redirect to saved mode
  if (currentMode) {
    setLocation(`/${currentMode}`);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-foreground mb-4">
            Welcome to Athena
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Choose your interface mode
          </p>
        </div>
        <ModeSelector />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/select-mode" component={ModeSelectorPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/amanda" component={AmandaMode} />
      <Route path="/hybrid" component={HybridMode} />
      <Route path="/terminal" component={TerminalMode} />
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
