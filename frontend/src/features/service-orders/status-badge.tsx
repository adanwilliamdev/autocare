import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/features/service-orders/status"
import type { ServiceOrderStatus } from "@/types"

const TONES: Record<ServiceOrderStatus, ComponentTone> = {
  CRIADA: "neutral",
  EM_DIAGNOSTICO: "steel",
  AGUARDANDO_APROVACAO: "amber",
  APROVADA: "amberSoft",
  EM_EXECUCAO: "steel",
  FINALIZADA: "moss",
  CANCELADA: "rust",
}

type ComponentTone = React.ComponentProps<typeof Badge>["tone"]

export function StatusBadge({ status }: { status: ServiceOrderStatus }) {
  return <Badge tone={TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
