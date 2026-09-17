import api from './axios'
import { LoginCredentials, LoginResponse, RegisterRequest } from '@/types/auth'

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

export const register = async (data: RegisterRequest): Promise<void> => {
  await api.post('/auth/register', data)
}

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/refresh', { refreshToken })
  return response.data
}

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken')
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  if (refreshToken) {
    try {
      // Revoga o refresh token no servidor. Best-effort: se falhar (ex.: já
      // expirado, sem rede), o logout local já aconteceu de qualquer forma.
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // Intencionalmente ignorado — ver comentário acima.
    }
  }
}
