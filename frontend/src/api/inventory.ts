import api from './axios'
import { Part, PartRequest } from '@/types/inventory'

export const getParts = async (): Promise<Part[]> => {
  const response = await api.get('/inventory/parts')
  return response.data
}

export const getPart = async (id: string): Promise<Part> => {
  const response = await api.get(`/inventory/parts/${id}`)
  return response.data
}

export const getLowStockParts = async (): Promise<Part[]> => {
  const response = await api.get('/inventory/parts/low-stock')
  return response.data
}

export const createPart = async (data: PartRequest): Promise<Part> => {
  const response = await api.post('/inventory/parts', data)
  return response.data
}

export const updatePart = async (id: string, data: PartRequest): Promise<Part> => {
  const response = await api.put(`/inventory/parts/${id}`, data)
  return response.data
}

export const deletePart = async (id: string): Promise<void> => {
  await api.delete(`/inventory/parts/${id}`)
}

export const addStock = async (id: string, quantity: number, reason: string, userId: string): Promise<void> => {
  await api.post(`/inventory/parts/${id}/add-stock?quantity=${quantity}&reason=${reason}&userId=${userId}`)
}

export const removeStock = async (id: string, quantity: number, reason: string, userId: string): Promise<void> => {
  await api.post(`/inventory/parts/${id}/remove-stock?quantity=${quantity}&reason=${reason}&userId=${userId}`)
}