import { useEffect, useState } from "react";
import { useScroll, useSpring, useTransform, MotionValue } from "framer-motion";

export function useScrollAnimation() {
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Smooth spring animations for scroll
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Detect scrolling state
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return {
    scrollY,
    scrollYProgress,
    smoothScrollY,
    smoothScrollYProgress,
    isScrolling,
  };
}

// Create parallax effect with custom offset
export function useParallax(offset: number = 50): MotionValue<number> {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 1000], [0, offset]);
}