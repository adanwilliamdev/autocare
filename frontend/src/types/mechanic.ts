export interface Mechanic {
  id: string
  name: string
  specialty?: string
  phone?: string
  isAvailable: boolean
  createdAt: string
  isActive: boolean
}

export interface MechanicRequest {
  name: string
  specialty?: string
  phone?: string
}
