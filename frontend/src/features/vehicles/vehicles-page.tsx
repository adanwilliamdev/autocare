"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { DataTable, type Column, type RowAction } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useHasRole } from "@/features/auth/auth-provider"
import { VehicleForm } from "@/features/vehicles/vehicle-form"
import { useVehicles } from "@/features/vehicles/queries"
import type { Vehicle } from "@/types"

const columns: Column<Vehicle>[] = [
  { header: "Placa", cell: (v) => <span className="font-mono text-graphite-800">{v.plate}</span> },
  { header: "Marca", cell: (v) => v.brand },
  { header: "Modelo", cell: (v) => v.model },
  { header: "Ano", cell: (v) => v.year },
  { header: "Quilometragem", cell: (v) => (v.mileage != null ? v.mileage.toLocaleString("pt-BR") + " km" : "—") },
  { header: "Cliente", cell: (v) => v.clientName },
  {
    header: "Status",
    cell: (v) => <Badge tone={v.isActive ? "moss" : "rust"}>{v.isActive ? "Ativo" : "Inativo"}</Badge>,
  },
]

export function VehiclesPage() {
  const canWrite = useHasRole("ADMIN", "RECEPTIONIST")
  const { data, isLoading, error } = useVehicles()
  const [editing, setEditing] = useState<{ vehicle: Vehicle | null } | null>(null)

  const actions: RowAction<Vehicle>[] = [{ label: "Editar", onSelect: (vehicle) => setEditing({ vehicle }) }]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        description="Gerencie os veículos da oficina"
        action={
          canWrite && (
            <Button onClick={() => setEditing({ vehicle: null })}>
              <Plus /> Novo Veículo
            </Button>
          )
        }
      />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        errorMessage={error ? "Erro ao carregar veículos" : null}
        actions={canWrite ? actions : undefined}
      />
      <VehicleForm open={!!editing} vehicle={editing?.vehicle ?? null} onClose={() => setEditing(null)} />
    </div>
  )
}
