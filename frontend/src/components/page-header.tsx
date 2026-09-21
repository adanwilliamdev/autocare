import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-graphite-900">{title}</h1>
        <p className="text-graphite-500">{description}</p>
      </div>
      {action}
    </div>
  )
}
