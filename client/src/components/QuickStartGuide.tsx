import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronUp, 
  ChevronDown, 
  Rocket, 
  Check,
  MessageCircle,
  ShoppingCart,
  Eye,
  Activity,
  User,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export default function QuickStartGuide() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "profile",
      label: "Complete Profile",
      description: "Add your investment goals and risk preferences",
      icon: User,
      completed: false
    },
    {
      id: "chat",
      label: "Chat with Athena",
      description: "Ask your first investment question",
      icon: MessageCircle,
      completed: false
    },
    {
      id: "trade",
      label: "Make First Trade",
      description: "Execute your first demo trade",
      icon: ShoppingCart,
      completed: false
    },
    {
      id: "watchlist",
      label: "Add to Watchlist",
      description: "Track stocks you're interested in",
      icon: Eye,
      completed: false
    },
    {
      id: "simulation",
      label: "Run a Simulation",
      description: "Test an investment strategy",
      icon: Activity,
      completed: false
    }
  ]);

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem("athena_quickstart_progress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setTasks(current => 
          current.map(task => ({
            ...task,
            completed: progress[task.id] || false
          }))
        );
      } catch (e) {
        console.error("Failed to load quickstart progress", e);
      }
    }

    const savedMinimized = localStorage.getItem("athena_quickstart_minimized");
    if (savedMinimized === "true") {
      setIsExpanded(false);
      setIsMinimized(true);
    }
  }, []);

  // Save progress
  const handleToggleTask = (taskId: string) => {
    setTasks(current => {
      const updated = current.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      );
      
      // Save to localStorage
      const progress = updated.reduce((acc, task) => ({
        ...acc,
        [task.id]: task.completed
      }), {});
      localStorage.setItem("athena_quickstart_progress", JSON.stringify(progress));
      
      return updated;
    });
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsExpanded(false);
    localStorage.setItem("athena_quickstart_minimized", "true");
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setIsExpanded(true);
    localStorage.setItem("athena_quickstart_minimized", "false");
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;
  const allCompleted = completedCount === tasks.length;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={handleRestore}
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full bg-black/80 backdrop-blur-sm border-white/10 hover:bg-black/90",
            "flex items-center gap-2"
          )}
          data-testid="button-restore-quickstart"
        >
          <Rocket className="w-4 h-4" />
          Quick Start ({completedCount}/{tasks.length})
          {allCompleted && <Check className="w-4 h-4 text-success" />}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 left-6 z-40 w-80",
      "bg-black/90 backdrop-blur-xl border-white/10 rounded-[20px]",
      "shadow-lg shadow-primary/10",
      "transition-all duration-300",
      !isExpanded && "cursor-pointer"
    )}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Rocket className="w-5 h-5 text-primary" />
            Quick Start Guide
            {allCompleted && (
              <Badge variant="default" className="ml-2 text-xs">
                Complete!
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              data-testid="button-toggle-quickstart"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleMinimize();
              }}
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              data-testid="button-minimize-quickstart"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedCount} of {tasks.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top duration-300">
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-[16px]",
                    "bg-white/5 hover:bg-white/10 transition-colors cursor-pointer",
                    task.completed && "opacity-60"
                  )}
                  onClick={() => handleToggleTask(task.id)}
                  data-testid={`quickstart-task-${task.id}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => {}}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <p className={cn(
                        "text-sm font-medium",
                        task.completed && "line-through"
                      )}>
                        {task.label}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {allCompleted && (
            <div className="mt-4 p-3 rounded-[16px] bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-success" />
                <p className="text-sm font-medium text-success">All tasks complete!</p>
              </div>
              <p className="text-xs text-muted-foreground">
                You're ready to master the markets with Athena
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";