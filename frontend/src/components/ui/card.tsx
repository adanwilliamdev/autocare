import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-xl2 border border-graphite-100 bg-card p-6 text-card-foreground shadow-soft", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-base font-semibold text-graphite-900", className)}
      {...props}
    />
  )
}

export { Card, CardTitle }
