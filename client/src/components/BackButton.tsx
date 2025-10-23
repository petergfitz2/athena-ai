import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to = "/dashboard", label = "Back" }: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Check if we can go back in browser history
    if (window.history.length > 1 && !to) {
      window.history.back();
    } else {
      setLocation(to);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="rounded-full hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground transition-colors"
      data-testid="button-back"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}