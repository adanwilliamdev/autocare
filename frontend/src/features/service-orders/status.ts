import type { ServiceOrderStatus } from "@/types"

export const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  CRIADA: "Criada",
  EM_DIAGNOSTICO: "Em diagnóstico",
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  APROVADA: "Aprovada",
  EM_EXECUCAO: "Em execução",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
}

export const STATUS_FLOW: ServiceOrderStatus[] = [
  "CRIADA",
  "EM_DIAGNOSTICO",
  "AGUARDANDO_APROVACAO",
  "APROVADA",
  "EM_EXECUCAO",
  "FINALIZADA",
]

export function nextStatus(status: ServiceOrderStatus): ServiceOrderStatus | null {
  const index = STATUS_FLOW.indexOf(status)
  return index === -1 || index === STATUS_FLOW.length - 1 ? null : STATUS_FLOW[index + 1]
}

export const isTerminal = (status: ServiceOrderStatus) => status === "FINALIZADA" || status === "CANCELADA"
