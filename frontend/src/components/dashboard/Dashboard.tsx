import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/api/dashboard'
import StatsCards from './StatsCards'
import RevenueChart from './RevenueChart'
import Layout from '@/components/common/Layout/Layout'

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-graphite-200 border-t-amber-500 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-rust-500 text-sm">Erro ao carregar dados do dashboard</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-graphite-900">Dashboard</h1>
          <p className="text-graphite-500 mt-0.5">Visão geral da sua oficina</p>
        </div>

        {/* Hero metric — the number that matters most gets the room to breathe */}
        <div className="card !p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-graphite-500">Faturamento mensal</p>
          </div>
          <p className="text-4xl font-display font-semibold text-graphite-900 tabular-nums">
            R$ {stats.monthlyRevenue?.toFixed(2) || '0,00'}
          </p>
          <div className="mt-5 -mx-1">
            <RevenueChart data={stats.monthlyRevenueChart} />
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="card">
          <h3 className="text-base font-display font-semibold text-graphite-900 mb-4">Mecânicos mais ativos</h3>
          <div className="space-y-1">
            {stats.topMechanics?.map((mechanic, idx) => {
              const max = stats.topMechanics[0]?.completedOrders || 1
              const pct = Math.max(8, Math.round((mechanic.completedOrders / max) * 100))
              return (
                <div key={mechanic.mechanicId} className="flex items-center gap-4 py-2.5">
                  <span className="text-sm text-graphite-400 w-4 flex-shrink-0 font-mono">{idx + 1}</span>
                  <span className="text-sm font-medium text-graphite-800 w-40 truncate flex-shrink-0">
                    {mechanic.mechanicName}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-graphite-50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-graphite-500 w-20 text-right flex-shrink-0 font-mono">
                    {mechanic.completedOrders} OS
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
