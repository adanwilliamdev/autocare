"use client"

import { ServiceOrderStatus } from '@/types/serviceOrder'

const statusStyles: Record<ServiceOrderStatus, { bg: string; text: string; dot: string }> = {
  CRIADA: { bg: 'bg-graphite-100', text: 'text-graphite-600', dot: 'bg-graphite-400' },
  EM_DIAGNOSTICO: { bg: 'bg-steel-100', text: 'text-steel-600', dot: 'bg-steel-400' },
  AGUARDANDO_APROVACAO: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  APROVADA: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  EM_EXECUCAO: { bg: 'bg-steel-50', text: 'text-steel-600', dot: 'bg-steel-500' },
  FINALIZADA: { bg: 'bg-moss-50', text: 'text-moss-700', dot: 'bg-moss-500' },
  CANCELADA: { bg: 'bg-rust-50', text: 'text-rust-500', dot: 'bg-rust-400' },
}

const statusLabels: Record<ServiceOrderStatus, string> = {
  CRIADA: 'Criada',
  EM_DIAGNOSTICO: 'Em diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação',
  APROVADA: 'Aprovada',
  EM_EXECUCAO: 'Em execução',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

interface StatusBadgeProps {
  status: ServiceOrderStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status]
  return (
    <span className={`badge ${style.bg} ${style.text}`}>
      <span className={`badge-dot ${style.dot}`} />
      {statusLabels[status]}
    </span>
  )
}
