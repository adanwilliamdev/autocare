import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Badge "com ponto": um indicador colorido + rótulo, em vez de um bloco sólido de cor. */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-graphite-100 text-graphite-600",
        steel: "bg-steel-100 text-steel-600",
        amber: "bg-amber-100 text-amber-700",
        amberSoft: "bg-amber-50 text-amber-700",
        moss: "bg-moss-50 text-moss-700",
        rust: "bg-rust-50 text-rust-500",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

const dotVariants: Record<NonNullable<VariantProps<typeof badgeVariants>["tone"]>, string> = {
  neutral: "bg-graphite-400",
  steel: "bg-steel-400",
  amber: "bg-amber-500",
  amberSoft: "bg-amber-400",
  moss: "bg-moss-500",
  rust: "bg-rust-400",
}

function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotVariants[tone ?? "neutral"])} />
      {children}
    </span>
  )
}

export { Badge }
