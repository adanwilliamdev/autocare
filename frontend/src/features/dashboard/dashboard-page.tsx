"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/features/dashboard/queries"
import { RevenueChart } from "@/features/dashboard/revenue-chart"
import { StatsCards } from "@/features/dashboard/stats-cards"
import { formatCurrency } from "@/lib/format"

export function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Carregando">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-72 w-full rounded-xl2" />
        <Skeleton className="h-24 w-full rounded-xl2" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <p role="alert" className="py-12 text-center text-sm text-rust-500">
        Erro ao carregar dados do dashboard
      </p>
    )
  }

  const maxOrders = stats.topMechanics[0]?.completedOrders || 1

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral da sua oficina" />

      <Card className="p-7">
        <p className="text-sm font-medium text-graphite-500">Faturamento mensal</p>
        <p className="mt-1 font-display text-4xl font-semibold text-graphite-900 tabular-nums">
          {formatCurrency(stats.monthlyRevenue)}
        </p>
        <div className="-mx-1 mt-5">
          <RevenueChart data={stats.monthlyRevenueChart} />
        </div>
      </Card>

      <StatsCards stats={stats} />

      <Card>
        <CardTitle className="mb-4">Mecânicos mais ativos</CardTitle>
        <div className="space-y-1">
          {stats.topMechanics.map((mechanic, index) => {
            const pct = Math.max(8, Math.round((mechanic.completedOrders / maxOrders) * 100))
            return (
              <div key={mechanic.mechanicId} className="flex items-center gap-4 py-2.5">
                <span className="w-4 shrink-0 font-mono text-sm text-graphite-400">{index + 1}</span>
                <span className="w-40 shrink-0 truncate text-sm font-medium text-graphite-800">
                  {mechanic.mechanicName}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-graphite-50">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-sm text-graphite-500">
                  {mechanic.completedOrders} OS
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
