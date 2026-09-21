import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border border-input bg-white px-3.5 py-2 text-sm text-graphite-900 transition-colors outline-none placeholder:text-graphite-400 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/40",
        "aria-invalid:border-rust-400 aria-invalid:ring-rust-400/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
