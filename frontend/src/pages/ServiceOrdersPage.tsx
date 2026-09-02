import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getServiceOrders, updateServiceOrderStatus } from '@/api/serviceOrders'
import { ServiceOrder, ServiceOrderStatus } from '@/types/serviceOrder'
import ServiceOrderForm from '@/components/serviceOrders/ServiceOrderForm'
import StatusBadge from '@/components/serviceOrders/StatusBadge'

const STATUS_FLOW: ServiceOrderStatus[] = [
  'CRIADA',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'EM_EXECUCAO',
  'FINALIZADA',
]

function nextStatus(status: ServiceOrderStatus): ServiceOrderStatus | null {
  const index = STATUS_FLOW.indexOf(status)
  if (index === -1 || index === STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[index + 1]
}

export default function ServiceOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: serviceOrders, isLoading } = useQuery({
    queryKey: ['serviceOrders'],
    queryFn: getServiceOrders,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceOrderStatus }) =>
      updateServiceOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
      toast.success('Status atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar status')
    },
  })

  const columns = [
    { key: 'orderNumber', label: 'Número' },
    { key: 'clientName', label: 'Cliente' },
    { key: 'vehicleInfo', label: 'Veículo' },
    { key: 'mechanicName', label: 'Mecânico' },
    {
      key: 'status',
      label: 'Status',
      render: (value: ServiceOrderStatus) => <StatusBadge status={value} />,
    },
    {
      key: 'totalAmount',
      label: 'Valor',
      render: (value: number) =>
        (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
  ]

  const actions = [
    {
      label: 'Avançar status',
      onClick: (order: ServiceOrder) => {
        const next = nextStatus(order.status)
        if (!next) {
          toast.error('Esta ordem já está finalizada')
          return
        }
        statusMutation.mutate({ id: order.id, status: next })
      },
    },
    {
      label: 'Cancelar',
      onClick: (order: ServiceOrder) => {
        if (window.confirm('Tem certeza que deseja cancelar esta ordem de serviço?')) {
          statusMutation.mutate({ id: order.id, status: 'CANCELADA' })
        }
      },
      className: 'text-red-600 hover:text-red-800',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
            <p className="text-gray-600">Acompanhe o ciclo de atendimento da oficina</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Nova Ordem
          </button>
        </div>

        <DataTable
          data={serviceOrders || []}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
        />

        <ServiceOrderForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </Layout>
  )
}
