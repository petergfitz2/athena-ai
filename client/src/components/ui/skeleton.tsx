import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { shimmerAnimation } from "@/lib/animations"

function Skeleton({
  className,
  shimmer = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  if (shimmer) {
    return (
      <motion.div
        className={cn(
          "rounded-md bg-gradient-to-r from-muted via-muted-foreground/10 to-muted",
          "bg-[length:200%_100%]",
          className
        )}
        initial="initial"
        animate="animate"
        variants={shimmerAnimation}
        {...props}
      />
    )
  }
  
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
