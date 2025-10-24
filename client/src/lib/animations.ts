import { Variants } from "framer-motion";

// Animation durations
export const ANIMATION_DURATION = {
  fast: 0.25,
  normal: 0.35,
  slow: 0.4,
} as const;

// Ease curves
export const ANIMATION_EASE = {
  smooth: [0.4, 0, 0.2, 1],
  spring: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.43, 0.1, 0.25, 1],
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

export const pageTransition = {
  type: "tween",
  ease: ANIMATION_EASE.smooth,
  duration: ANIMATION_DURATION.normal,
};

// Fade in variants
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Scale fade variants for cards
export const scaleFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Slide in variants
export const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Stagger children container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// List item variants with hover
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.smooth,
    },
  },
  hover: {
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

// Modal variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Backdrop variants
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: "linear",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: "linear",
    },
  },
};

// Number counter animation
export const counterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Shimmer animation for loading skeletons
export const shimmerAnimation = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
};

// Parallax effect for sections
export const parallaxVariants: Variants = {
  offscreen: {
    y: 50,
    opacity: 0.8,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Pulse animation for live indicators
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Floating animation for avatars/orbs
export const floatingAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Check if user prefers reduced motion
export const shouldReduceMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get animation duration based on reduced motion preference
export const getAnimationDuration = (duration: number) => {
  return shouldReduceMotion() ? 0 : duration;
};

// Hover tap animations for cards
export const cardHoverTap = {
  hover: shouldReduceMotion()
    ? {}
    : {
        scale: 1.02,
        transition: {
          duration: 0.2,
          ease: "easeInOut",
        },
      },
  tap: shouldReduceMotion()
    ? {}
    : {
        scale: 0.98,
        transition: {
          duration: 0.1,
          ease: "easeInOut",
        },
      },
};

// Button hover tap animations
export const buttonHoverTap = {
  hover: shouldReduceMotion()
    ? {}
    : {
        scale: 1.05,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      },
  tap: shouldReduceMotion()
    ? {}
    : {
        scale: 0.95,
        transition: {
          duration: 0.1,
          ease: "easeOut",
        },
      },
};

// Text highlight animation
export const textHighlightAnimation = {
  initial: {
    backgroundSize: "0% 100%",
  },
  animate: {
    backgroundSize: "100% 100%",
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Notification slide in
export const notificationVariants: Variants = {
  hidden: {
    x: 400,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Chart animation variants
export const chartVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASE.spring,
    },
  },
};

// Tab content animation
export const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASE.smooth,
    },
  },
};

// Accordion animation
export const accordionVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: ANIMATION_DURATION.normal,
        ease: ANIMATION_EASE.spring,
      },
      opacity: {
        duration: ANIMATION_DURATION.fast,
        ease: "linear",
      },
    },
  },
};