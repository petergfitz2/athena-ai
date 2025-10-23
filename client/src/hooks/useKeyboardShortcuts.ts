import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMode } from "@/contexts/ModeContext";

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();
  const { setMode } = useMode();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mode switching shortcuts (Cmd/Ctrl + 1/2/3)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setMode("athena");
            setLocation("/athena");
            break;
          case "2":
            e.preventDefault();
            setMode("hybrid");
            setLocation("/hybrid");
            break;
          case "3":
            e.preventDefault();
            setMode("terminal");
            setLocation("/terminal");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation, setMode]);
}
