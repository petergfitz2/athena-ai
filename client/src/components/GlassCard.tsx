import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cardHoverTap, scaleFadeVariants } from "@/lib/animations";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animateOnHover?: boolean;
  delay?: number;
}

export default function GlassCard({ 
  children, 
  className,
  animateOnHover = true,
  delay = 0
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 p-8",
        className
      )}
      variants={scaleFadeVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={animateOnHover ? cardHoverTap.hover : undefined}
      whileTap={animateOnHover ? cardHoverTap.tap : undefined}
    >
      {children}
    </motion.div>
  );
}
