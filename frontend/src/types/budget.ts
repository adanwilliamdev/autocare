export type BudgetStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO'

export interface Budget {
  id: string
  budgetNumber: string
  clientId: string
  clientName: string
  vehicleId: string
  vehicleInfo: string
  serviceOrderId?: string
  description?: string
  totalAmount: number
  status: BudgetStatus
  validUntil?: string
  createdAt: string
}

export interface BudgetRequest {
  clientId: string
  vehicleId: string
  serviceOrderId?: string
  description?: string
  totalAmount: number
  validUntil?: string
}
