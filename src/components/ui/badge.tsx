import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#171717] text-white dark:bg-white dark:text-[#171717]",
        secondary: "border-transparent bg-[#69C4E8]/15 text-[#69C4E8] dark:bg-[#69C4E8]/20",
        outline: "text-foreground border-border",
        gold: "border-transparent bg-[#C89B3C]/15 text-[#C89B3C] dark:bg-[#C89B3C]/20",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
