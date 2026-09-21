"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable, type Column, type RowAction } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useHasRole } from "@/features/auth/auth-provider"
import { ClientForm } from "@/features/clients/client-form"
import { useActivateClient, useClients, useDeleteClient } from "@/features/clients/queries"
import { formatCPF, formatPhone } from "@/lib/format"
import type { Client } from "@/types"

const columns: Column<Client>[] = [
  { header: "Nome", cell: (c) => <span className="font-medium text-graphite-800">{c.name}</span> },
  { header: "CPF", cell: (c) => (c.cpf ? formatCPF(c.cpf) : "—") },
  { header: "Telefone", cell: (c) => (c.phone ? formatPhone(c.phone) : "—") },
  { header: "Email", cell: (c) => c.email ?? "—" },
  { header: "Veículos", cell: (c) => c.vehicleCount },
  {
    header: "Status",
    cell: (c) => <Badge tone={c.isActive ? "moss" : "rust"}>{c.isActive ? "Ativo" : "Inativo"}</Badge>,
  },
]

export function ClientsPage() {
  // Escrita: ADMIN e RECEPTIONIST; MANAGER só consulta (mesma regra da API).
  const canWrite = useHasRole("ADMIN", "RECEPTIONIST")
  const { data, isLoading, error } = useClients()
  const deleteClient = useDeleteClient()
  const activateClient = useActivateClient()

  const [editing, setEditing] = useState<{ client: Client | null } | null>(null)
  const [toDelete, setToDelete] = useState<Client | null>(null)

  const actions: RowAction<Client>[] = [
    { label: "Editar", onSelect: (client) => setEditing({ client }) },
    { label: "Ativar", onSelect: (client) => activateClient.mutate(client.id), hidden: (c) => c.isActive },
    { label: "Excluir", onSelect: setToDelete, destructive: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie todos os clientes da oficina"
        action={
          canWrite && (
            <Button onClick={() => setEditing({ client: null })}>
              <Plus /> Novo Cliente
            </Button>
          )
        }
      />

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        errorMessage={error ? "Erro ao carregar clientes" : null}
        actions={canWrite ? actions : undefined}
      />

      <ClientForm open={!!editing} client={editing?.client ?? null} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir ${toDelete?.name}? O cliente ficará inativo e poderá ser reativado depois.`}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deleteClient.mutate(toDelete.id)}
      />
    </div>
  )
}
