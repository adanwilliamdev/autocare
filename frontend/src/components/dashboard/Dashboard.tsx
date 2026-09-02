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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">Erro ao carregar dados do dashboard</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da sua oficina</p>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Faturamento Mensal</h3>
            <RevenueChart data={stats.monthlyRevenueChart} />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Mecânicos Mais Ativos</h3>
            <div className="space-y-3">
              {stats.topMechanics?.map((mechanic) => (
                <div key={mechanic.mechanicId} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{mechanic.mechanicName}</span>
                  <span className="text-sm text-gray-600">{mechanic.completedOrders} OS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}