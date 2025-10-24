import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { parallaxVariants } from "@/lib/animations";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  enableParallax?: boolean;
  parallaxOffset?: number;
}

export default function AnimatedSection({
  children,
  className,
  enableParallax = false,
  parallaxOffset = 50,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [parallaxOffset, -parallaxOffset]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  if (enableParallax) {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={{ y, opacity }}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.3 }}
        variants={parallaxVariants}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.3 }}
      variants={parallaxVariants}
    >
      {children}
    </motion.div>
  );
}