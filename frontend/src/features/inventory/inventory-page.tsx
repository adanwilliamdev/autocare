"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable, type Column, type RowAction } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PartForm } from "@/features/inventory/part-form"
import { StockDialog } from "@/features/inventory/stock-dialog"
import { useDeletePart, useParts, type StockMovementKind } from "@/features/inventory/queries"
import { formatCurrency } from "@/lib/format"
import type { Part } from "@/types"

const columns: Column<Part>[] = [
  { header: "Código", cell: (p) => <span className="font-mono text-graphite-800">{p.code}</span> },
  { header: "Nome", cell: (p) => <span className="font-medium text-graphite-800">{p.name}</span> },
  { header: "Fabricante", cell: (p) => p.manufacturer ?? "—" },
  { header: "Estoque", cell: (p) => <span className="font-mono">{p.stockQuantity}</span> },
  { header: "Preço de venda", cell: (p) => <span className="font-mono">{formatCurrency(p.salePrice)}</span> },
  {
    header: "Status",
    cell: (p) => <Badge tone={p.isLowStock ? "rust" : "moss"}>{p.isLowStock ? "Estoque baixo" : "Normal"}</Badge>,
  },
]

// A página inteira é restrita a ADMIN/MANAGER (ver lib/navigation.ts e a API).
export function InventoryPage() {
  const { data, isLoading, error } = useParts()
  const deletePart = useDeletePart()

  const [editing, setEditing] = useState<{ part: Part | null } | null>(null)
  const [stockTarget, setStockTarget] = useState<{ part: Part; kind: StockMovementKind } | null>(null)
  const [toDelete, setToDelete] = useState<Part | null>(null)

  const actions: RowAction<Part>[] = [
    { label: "Editar", onSelect: (part) => setEditing({ part }) },
    { label: "Entrada de estoque", onSelect: (part) => setStockTarget({ part, kind: "ENTRADA" }) },
    { label: "Saída de estoque", onSelect: (part) => setStockTarget({ part, kind: "SAIDA" }) },
    { label: "Excluir", onSelect: setToDelete, destructive: true },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de peças e movimentações"
        action={
          <Button onClick={() => setEditing({ part: null })}>
            <Plus /> Nova Peça
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        errorMessage={error ? "Erro ao carregar estoque" : null}
        actions={actions}
      />
      <PartForm open={!!editing} part={editing?.part ?? null} onClose={() => setEditing(null)} />
      <StockDialog target={stockTarget} onClose={() => setStockTarget(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir peça"
        description={`Tem certeza que deseja excluir ${toDelete?.name}?`}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deletePart.mutate(toDelete.id)}
      />
    </div>
  )
}
