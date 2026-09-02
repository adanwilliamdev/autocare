export interface Client {
  id: string
  name: string
  cpf?: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
  isActive: boolean
  vehicleCount: number
}

export interface ClientRequest {
  name: string
  cpf?: string
  phone?: string
  email?: string
  address?: string
}