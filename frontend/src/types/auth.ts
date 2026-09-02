export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RECEPTIONIST' | 'MECHANIC' | 'MANAGER'
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  userId: string
  name: string
  email: string
  role: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: string
}