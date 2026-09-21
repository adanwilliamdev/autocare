"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { DataTable, type Column, type RowAction } from "@/components/data-table"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useHasRole } from "@/features/auth/auth-provider"
import { BudgetForm } from "@/features/budgets/budget-form"
import { useApproveBudget, useBudgets, useRejectBudget } from "@/features/budgets/queries"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Budget, BudgetStatus } from "@/types"

const TONES: Record<BudgetStatus, React.ComponentProps<typeof Badge>["tone"]> = {
  PENDENTE: "amber",
  APROVADO: "moss",
  RECUSADO: "rust",
  EXPIRADO: "neutral",
}

const LABELS: Record<BudgetStatus, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  EXPIRADO: "Expirado",
}

const columns: Column<Budget>[] = [
  { header: "Número", cell: (b) => <span className="font-mono text-graphite-800">{b.budgetNumber}</span> },
  { header: "Cliente", cell: (b) => b.clientName },
  { header: "Veículo", cell: (b) => b.vehicleInfo },
  { header: "Valor", cell: (b) => <span className="font-mono">{formatCurrency(b.totalAmount)}</span> },
  { header: "Validade", cell: (b) => (b.validUntil ? formatDate(b.validUntil) : "—") },
  { header: "Status", cell: (b) => <Badge tone={TONES[b.status]}>{LABELS[b.status]}</Badge> },
]

export function BudgetsPage() {
  // Criar: ADMIN/RECEPTIONIST. Aprovar/recusar é decisão financeira: só ADMIN/MANAGER.
  const canCreate = useHasRole("ADMIN", "RECEPTIONIST")
  const canDecide = useHasRole("ADMIN", "MANAGER")
  const { data, isLoading, error } = useBudgets()
  const approve = useApproveBudget()
  const reject = useRejectBudget()
  const [creating, setCreating] = useState(false)

  const busy = approve.isPending || reject.isPending
  const actions: RowAction<Budget>[] = [
    { label: "Aprovar", onSelect: (b) => !busy && approve.mutate(b.id), hidden: (b) => b.status !== "PENDENTE" },
    {
      label: "Recusar",
      onSelect: (b) => !busy && reject.mutate(b.id),
      destructive: true,
      hidden: (b) => b.status !== "PENDENTE",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Acompanhe e aprove os orçamentos da oficina"
        action={
          canCreate && (
            <Button onClick={() => setCreating(true)}>
              <Plus /> Novo Orçamento
            </Button>
          )
        }
      />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        errorMessage={error ? "Erro ao carregar orçamentos" : null}
        actions={canDecide ? actions : undefined}
      />
      <BudgetForm open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
