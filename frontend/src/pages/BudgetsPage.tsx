import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getBudgets, approveBudget, rejectBudget } from '@/api/budgets'
import { Budget, BudgetStatus } from '@/types/budget'
import BudgetForm from '@/components/budgets/BudgetForm'

const statusStyles: Record<BudgetStatus, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  APROVADO: 'bg-green-100 text-green-800',
  RECUSADO: 'bg-red-100 text-red-800',
  EXPIRADO: 'bg-gray-100 text-gray-800',
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
    { key: 'budgetNumber', label: 'Número' },
    { key: 'clientName', label: 'Cliente' },
    { key: 'vehicleInfo', label: 'Veículo' },
    {
      key: 'totalAmount',
      label: 'Valor',
      render: (value: number) =>
        (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: BudgetStatus) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[value]}`}>
          {value}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: 'Aprovar',
      onClick: (budget: Budget) => approveMutation.mutate(budget.id),
      className: 'text-green-600 hover:text-green-800',
    },
    {
      label: 'Recusar',
      onClick: (budget: Budget) => rejectMutation.mutate(budget.id),
      className: 'text-red-600 hover:text-red-800',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
            <p className="text-gray-600">Acompanhe e aprove os orçamentos da oficina</p>
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
