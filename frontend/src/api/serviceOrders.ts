import api from './axios'
import { ServiceOrder, ServiceOrderRequest, StatusUpdateRequest } from '@/types/serviceOrder'

export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
  const response = await api.get('/service-orders')
  return response.data
}

export const getServiceOrder = async (id: string): Promise<ServiceOrder> => {
  const response = await api.get(`/service-orders/${id}`)
  return response.data
}

export const getServiceOrdersByClient = async (clientId: string): Promise<ServiceOrder[]> => {
  const response = await api.get(`/service-orders/client/${clientId}`)
  return response.data
}

export const getServiceOrdersByVehicle = async (vehicleId: string): Promise<ServiceOrder[]> => {
  const response = await api.get(`/service-orders/vehicle/${vehicleId}`)
  return response.data
}

export const getServiceOrdersByStatus = async (status: string): Promise<ServiceOrder[]> => {
  const response = await api.get(`/service-orders/status/${status}`)
  return response.data
}

export const createServiceOrder = async (data: ServiceOrderRequest): Promise<ServiceOrder> => {
  const response = await api.post('/service-orders', data)
  return response.data
}

export const updateServiceOrderStatus = async (id: string, data: StatusUpdateRequest): Promise<ServiceOrder> => {
  const response = await api.patch(`/service-orders/${id}/status`, data)
  return response.data
}

export const assignMechanic = async (id: string, mechanicId: string): Promise<ServiceOrder> => {
  const response = await api.patch(`/service-orders/${id}/mechanic?mechanicId=${mechanicId}`)
  return response.data
}