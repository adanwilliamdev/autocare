import api from './axios'
import { Vehicle, VehicleRequest } from '@/types/vehicle'

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles')
  return response.data
}

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`)
  return response.data
}

export const getVehiclesByClient = async (clientId: string): Promise<Vehicle[]> => {
  const response = await api.get(`/vehicles/client/${clientId}`)
  return response.data
}

export const createVehicle = async (data: VehicleRequest): Promise<Vehicle> => {
  const response = await api.post('/vehicles', data)
  return response.data
}

export const updateVehicle = async (id: string, data: VehicleRequest): Promise<Vehicle> => {
  const response = await api.put(`/vehicles/${id}`, data)
  return response.data
}

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`)
}

export const updateMileage = async (id: string, mileage: number): Promise<void> => {
  await api.patch(`/vehicles/${id}/mileage?mileage=${mileage}`)
}