import { ClipboardList, TriangleAlert, Truck, Users, type LucideIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import type { DashboardStats } from "@/types"

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const tiles: { title: string; value: number; icon: LucideIcon }[] = [
    { title: "Clientes", value: stats.totalClients, icon: Users },
    { title: "Veículos", value: stats.totalVehicles, icon: Truck },
    { title: "Ordens abertas", value: stats.openServiceOrders, icon: ClipboardList },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {tiles.map((tile) => (
        <Card key={tile.title} className="flex items-center gap-4 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-graphite-50">
            <tile.icon className="size-5 text-graphite-500" />
          </div>
          <div>
            <p className="font-display text-2xl leading-none font-semibold text-graphite-900">{tile.value}</p>
            <p className="mt-1 text-sm text-graphite-500">{tile.title}</p>
          </div>
        </Card>
      ))}

      {stats.lowStockItems > 0 && (
        <Card className="flex items-center gap-4 border-rust-100 bg-rust-50/60 p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rust-100">
            <TriangleAlert className="size-5 text-rust-500" />
          </div>
          <div>
            <p className="font-display text-2xl leading-none font-semibold text-rust-600">{stats.lowStockItems}</p>
            <p className="mt-1 text-sm text-rust-500">Itens com estoque baixo</p>
          </div>
        </Card>
      )}
    </div>
  )
}
