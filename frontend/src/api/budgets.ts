import api from './axios'
import { Budget, BudgetRequest, BudgetStatus } from '@/types/budget'

export const getBudgets = async (): Promise<Budget[]> => {
  const response = await api.get('/budgets')
  return response.data
}

export const getBudget = async (id: string): Promise<Budget> => {
  const response = await api.get(`/budgets/${id}`)
  return response.data
}

export const getBudgetsByClient = async (clientId: string): Promise<Budget[]> => {
  const response = await api.get(`/budgets/client/${clientId}`)
  return response.data
}

export const getBudgetsByStatus = async (status: BudgetStatus): Promise<Budget[]> => {
  const response = await api.get(`/budgets/status/${status}`)
  return response.data
}

export const createBudget = async (data: BudgetRequest): Promise<Budget> => {
  const response = await api.post('/budgets', data)
  return response.data
}

export const approveBudget = async (id: string): Promise<Budget> => {
  const response = await api.patch(`/budgets/${id}/approve`)
  return response.data
}

export const rejectBudget = async (id: string): Promise<Budget> => {
  const response = await api.patch(`/budgets/${id}/reject`)
  return response.data
}
