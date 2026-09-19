"use client"

import { DashboardStats } from '@/types'
import {
  UsersIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const tiles = [
    { title: 'Clientes', value: stats.totalClients, icon: UsersIcon },
    { title: 'Veículos', value: stats.totalVehicles, icon: TruckIcon },
    { title: 'Ordens abertas', value: stats.openServiceOrders, icon: ClipboardDocumentListIcon },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {tiles.map((tile) => (
        <div key={tile.title} className="card !p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-graphite-50 flex items-center justify-center flex-shrink-0">
            <tile.icon className="h-5 w-5 text-graphite-500" />
          </div>
          <div>
            <p className="text-2xl font-display font-semibold text-graphite-900 leading-none">{tile.value}</p>
            <p className="text-sm text-graphite-500 mt-1">{tile.title}</p>
          </div>
        </div>
      ))}

      {stats.lowStockItems > 0 && (
        <div className="card !p-5 flex items-center gap-4 border-rust-100 bg-rust-50/60">
          <div className="h-10 w-10 rounded-lg bg-rust-100 flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-rust-500" />
          </div>
          <div>
            <p className="text-2xl font-display font-semibold text-rust-600 leading-none">{stats.lowStockItems}</p>
            <p className="text-sm text-rust-500 mt-1">Itens com estoque baixo</p>
          </div>
        </div>
      )}
    </div>
  )
}
