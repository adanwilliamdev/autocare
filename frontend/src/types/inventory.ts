export interface Part {
  id: string
  name: string
  code: string
  manufacturer?: string
  purchasePrice: number
  salePrice: number
  stockQuantity: number
  minimumStock: number
  isLowStock: boolean
  createdAt: string
  isActive: boolean
}

export interface PartRequest {
  name: string
  code: string
  manufacturer?: string
  purchasePrice: number
  salePrice: number
  stockQuantity: number
  minimumStock?: number
}