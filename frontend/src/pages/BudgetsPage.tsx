import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getBudgets, approveBudget, rejectBudget } from '@/api/budgets'
import { Budget, BudgetStatus } from '@/types/budget'
import BudgetForm from '@/components/budgets/BudgetForm'

const statusStyles: Record<BudgetStatus, { bg: string; text: string; dot: string }> = {
  PENDENTE: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  APROVADO: { bg: 'bg-moss-50', text: 'text-moss-700', dot: 'bg-moss-500' },
  RECUSADO: { bg: 'bg-rust-50', text: 'text-rust-500', dot: 'bg-rust-400' },
  EXPIRADO: { bg: 'bg-graphite-100', text: 'text-graphite-500', dot: 'bg-graphite-400' },
}

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  })

  const approveMutation = useMutation({
    mutationFn: approveBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento aprovado')
    },
    onError: () => {
      toast.error('Erro ao aprovar orçamento')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento recusado')
    },
    onError: () => {
      toast.error('Erro ao recusar orçamento')
    },
  })

  const columns = [
    { key: 'budgetNumber', label: 'Número', render: (value: string) => <span className="font-mono text-graphite-800">{value}</span> },
    { key: 'clientName', label: 'Cliente' },
    { key: 'vehicleInfo', label: 'Veículo' },
    {
      key: 'totalAmount',
      label: 'Valor',
      render: (value: number) =>
        <span className="font-mono">{(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: BudgetStatus) => (
        <span className={`badge ${statusStyles[value].bg} ${statusStyles[value].text}`}>
          <span className={`badge-dot ${statusStyles[value].dot}`} />
          {value}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: 'Aprovar',
      onClick: (budget: Budget) => approveMutation.mutate(budget.id),
      className: 'text-moss-600 hover:text-moss-700',
    },
    {
      label: 'Recusar',
      onClick: (budget: Budget) => rejectMutation.mutate(budget.id),
      className: 'text-rust-500 hover:text-rust-600',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-semibold text-graphite-900">Orçamentos</h1>
            <p className="text-graphite-500">Acompanhe e aprove os orçamentos da oficina</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Novo Orçamento
          </button>
        </div>

        <DataTable
          data={budgets || []}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
        />

        <BudgetForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </Layout>
  )
}
