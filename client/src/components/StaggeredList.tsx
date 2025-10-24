import { motion } from "framer-motion";
import { ReactNode } from "react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ children, className, staggerDelay = 0.08 }: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      custom={{ staggerChildren: staggerDelay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function StaggeredListItem({ children, className, index = 0 }: StaggeredListItemProps) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
      custom={{ delay: index * 0.08 }}
    >
      {children}
    </motion.div>
  );
}