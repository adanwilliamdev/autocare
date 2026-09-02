export type ServiceOrderStatus =
  | 'CRIADA'
  | 'EM_DIAGNOSTICO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'EM_EXECUCAO'
  | 'FINALIZADA'
  | 'CANCELADA'

export interface ServiceOrder {
  id: string
  orderNumber: string
  clientId: string
  clientName: string
  vehicleId: string
  vehicleInfo: string
  mechanicId?: string
  mechanicName?: string
  reportedProblem?: string
  diagnosis?: string
  status: ServiceOrderStatus
  totalAmount: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export interface ServiceOrderRequest {
  clientId: string
  vehicleId: string
  mechanicId?: string
  reportedProblem?: string
}

export interface StatusUpdateRequest {
  status: ServiceOrderStatus
  diagnosis?: string
}