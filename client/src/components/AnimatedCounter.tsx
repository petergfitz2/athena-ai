import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatValue?: (value: number) => string;
  highlightOnChange?: boolean;
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatValue,
  highlightOnChange = true
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const controls = useAnimation();

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Skip animations if user prefers reduced motion
    if (shouldReduceMotion()) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const startValue = previousValue.current;
    const endValue = value;
    const difference = endValue - startValue;

    // Skip animation if difference is too small
    if (Math.abs(difference) < 0.01) {
      setDisplayValue(endValue);
      previousValue.current = endValue;
      return;
    }

    setIsAnimating(true);

    // Trigger highlight animation
    if (highlightOnChange) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (difference * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
        setIsAnimating(false);
        startTimeRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, highlightOnChange, controls]);

  const formattedValue = formatValue 
    ? formatValue(displayValue)
    : displayValue.toFixed(decimals);

  return (
    <motion.span 
      animate={controls}
      className={cn(
        "inline-block transition-colors duration-300",
        isAnimating && highlightOnChange && "text-primary",
        className
      )}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}

// Format helpers
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};