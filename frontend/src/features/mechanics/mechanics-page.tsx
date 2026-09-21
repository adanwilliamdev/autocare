"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable, type Column, type RowAction } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useHasRole } from "@/features/auth/auth-provider"
import { MechanicForm } from "@/features/mechanics/mechanic-form"
import { useDeleteMechanic, useMechanics, useSetMechanicAvailability } from "@/features/mechanics/queries"
import { formatPhone } from "@/lib/format"
import type { Mechanic } from "@/types"

const columns: Column<Mechanic>[] = [
  { header: "Nome", cell: (m) => <span className="font-medium text-graphite-800">{m.name}</span> },
  { header: "Especialidade", cell: (m) => m.specialty ?? "—" },
  { header: "Telefone", cell: (m) => (m.phone ? formatPhone(m.phone) : "—") },
  {
    header: "Disponibilidade",
    cell: (m) => <Badge tone={m.isAvailable ? "moss" : "amber"}>{m.isAvailable ? "Disponível" : "Ocupado"}</Badge>,
  },
]

export function MechanicsPage() {
  // Gestão da equipe: ADMIN/MANAGER. RECEPTIONIST só consulta para atribuir OS.
  const canManage = useHasRole("ADMIN", "MANAGER")
  const { data, isLoading, error } = useMechanics()
  const deleteMechanic = useDeleteMechanic()
  const setAvailability = useSetMechanicAvailability()

  const [editing, setEditing] = useState<{ mechanic: Mechanic | null } | null>(null)
  const [toDelete, setToDelete] = useState<Mechanic | null>(null)

  const actions: RowAction<Mechanic>[] = [
    { label: "Editar", onSelect: (mechanic) => setEditing({ mechanic }) },
    {
      label: "Alternar disponibilidade",
      onSelect: (m) => setAvailability.mutate({ id: m.id, available: !m.isAvailable }),
    },
    { label: "Excluir", onSelect: setToDelete, destructive: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mecânicos"
        description="Gerencie a equipe de mecânicos da oficina"
        action={
          canManage && (
            <Button onClick={() => setEditing({ mechanic: null })}>
              <Plus /> Novo Mecânico
            </Button>
          )
        }
      />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        errorMessage={error ? "Erro ao carregar mecânicos" : null}
        actions={canManage ? actions : undefined}
      />
      <MechanicForm open={!!editing} mechanic={editing?.mechanic ?? null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir mecânico"
        description={`Tem certeza que deseja excluir ${toDelete?.name}?`}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deleteMechanic.mutate(toDelete.id)}
      />
    </div>
  )
}
