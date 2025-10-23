import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type InterfaceMode = "amanda" | "hybrid" | "terminal";

interface ModeContextType {
  currentMode: InterfaceMode;
  setMode: (mode: InterfaceMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<InterfaceMode>(() => {
    const saved = localStorage.getItem("athena-interface-mode");
    return (saved as InterfaceMode) || "hybrid";
  });

  useEffect(() => {
    localStorage.setItem("athena-interface-mode", currentMode);
  }, [currentMode]);

  const setMode = (mode: InterfaceMode) => {
    setCurrentMode(mode);
  };

  return (
    <ModeContext.Provider value={{ currentMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
