import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

interface MainContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainContentContainer({ children, className }: MainContentContainerProps) {
  const { isPanelOpen, isCollapsed } = useChatContext();
  
  // Add left margin on desktop when chat panel is open and not collapsed
  const shouldShift = isPanelOpen && !isCollapsed;
  
  return (
    <div 
      className={cn(
        "transition-[margin] duration-300 ease-in-out",
        shouldShift ? "md:ml-[400px]" : "",
        className
      )}
    >
      {children}
    </div>
  );
}