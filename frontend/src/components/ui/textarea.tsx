import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm text-graphite-900 transition-colors outline-none placeholder:text-graphite-400 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/40",
        "aria-invalid:border-rust-400 aria-invalid:ring-rust-400/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
