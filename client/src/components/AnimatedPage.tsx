import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}