export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  mileage?: number
  fuelType?: string
  clientId: string
  clientName: string
  createdAt: string
  isActive: boolean
}

export interface VehicleRequest {
  plate: string
  brand: string
  model: string
  year: number
  mileage?: number
  fuelType?: string
  clientId: string
}