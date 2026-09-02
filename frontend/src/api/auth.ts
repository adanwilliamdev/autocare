import api from './axios'
import { LoginCredentials, LoginResponse, RegisterRequest } from '@/types/auth'

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials)
  return response.data
}

export const register = async (data: RegisterRequest): Promise<void> => {
  await api.post('/auth/register', data)
}

export const logout = (): void => {
  localStorage.removeItem('token')
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}