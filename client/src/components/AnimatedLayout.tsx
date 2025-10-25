import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedLayoutProps {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = ({ children, delay = 0 }: AnimatedLayoutProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({ children, delay = 0 }: AnimatedLayoutProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay,
      ease: [0.23, 1, 0.32, 1] // Custom easing for smooth animation
    }}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0 }: AnimatedLayoutProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      duration: 0.4, 
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ 
  children, 
  staggerChildren = 0.1,
  delayChildren = 0 
}: {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren,
          delayChildren
        }
      }
    }}
    initial="hidden"
    animate="visible"
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.23, 1, 0.32, 1]
        }
      }
    }}
  >
    {children}
  </motion.div>
);

export const HoverScale = ({ 
  children, 
  scale = 1.03 
}: { 
  children: ReactNode; 
  scale?: number;
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: scale * 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.div>
);

export const PulseAnimation = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

export const ShimmerEffect = ({ children }: { children: ReactNode }) => (
  <motion.div
    className="relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {children}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{
        x: ["-100%", "100%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "linear"
      }}
    />
  </motion.div>
);

export const CounterAnimation = ({ 
  value, 
  duration = 1 
}: { 
  value: number; 
  duration?: number; 
}) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.span
      key={value}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration }}
    >
      {value}
    </motion.span>
  </motion.span>
);

// Page transition animations
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

// Card hover animations
export const cardHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(139, 92, 246, 0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
};