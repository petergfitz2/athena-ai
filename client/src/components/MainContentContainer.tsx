import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";

interface MainContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainContentContainer({ children, className }: MainContentContainerProps) {
  const { isPanelOpen, isCollapsed } = useChatContext();
  
  // Add margin when chat panel is open and not collapsed
  const shouldShift = isPanelOpen && !isCollapsed;
  
  return (
    <div 
      className={cn(
        "w-full overflow-x-hidden",
        className
      )}
    >
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          shouldShift ? "md:mr-[420px]" : "",
          "min-h-screen"
        )}
      >
        {children}
      </div>
    </div>
  );
}