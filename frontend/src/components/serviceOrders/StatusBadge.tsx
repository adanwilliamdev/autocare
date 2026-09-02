import { ServiceOrderStatus } from '@/types/serviceOrder'

const statusStyles: Record<ServiceOrderStatus, string> = {
  CRIADA: 'bg-gray-100 text-gray-800',
  EM_DIAGNOSTICO: 'bg-blue-100 text-blue-800',
  AGUARDANDO_APROVACAO: 'bg-yellow-100 text-yellow-800',
  APROVADA: 'bg-indigo-100 text-indigo-800',
  EM_EXECUCAO: 'bg-purple-100 text-purple-800',
  FINALIZADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
}

const statusLabels: Record<ServiceOrderStatus, string> = {
  CRIADA: 'Criada',
  EM_DIAGNOSTICO: 'Em Diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADA: 'Aprovada',
  EM_EXECUCAO: 'Em Execução',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

interface StatusBadgeProps {
  status: ServiceOrderStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}
