import { DashboardStats } from '@/types'
import {
  UsersIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Clientes',
      value: stats.totalClients,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Veículos',
      value: stats.totalVehicles,
      icon: TruckIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Ordens Abertas',
      value: stats.openServiceOrders,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${stats.monthlyRevenue?.toFixed(2) || '0,00'}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}

      {stats.lowStockItems > 0 && (
        <div className="card border-2 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">⚠️ Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-700">{stats.lowStockItems} itens</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}