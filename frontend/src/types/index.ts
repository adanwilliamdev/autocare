export * from './auth'
export * from './client'
export * from './vehicle'
export * from './mechanic'
export * from './serviceOrder'
export * from './inventory'
export * from './budget'

export interface DashboardStats {
  totalClients: number
  totalVehicles: number
  totalServiceOrders: number
  openServiceOrders: number
  inProgressServiceOrders: number
  waitingApprovalServiceOrders: number
  monthlyRevenue: number
  lowStockItems: number
  monthlyRevenueChart: Array<{ month: string; amount: number }>
  topMechanics: Array<{
    mechanicId: string
    mechanicName: string
    completedOrders: number
  }>
  mostUsedParts: Array<{
    partId: string
    partName: string
    usageCount: number
  }>
}