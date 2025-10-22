import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
