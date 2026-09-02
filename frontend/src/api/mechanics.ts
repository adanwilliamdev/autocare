import api from './axios'
import { Mechanic, MechanicRequest } from '@/types/mechanic'

export const getMechanics = async (): Promise<Mechanic[]> => {
  const response = await api.get('/mechanics')
  return response.data
}

export const getAvailableMechanics = async (): Promise<Mechanic[]> => {
  const response = await api.get('/mechanics/available')
  return response.data
}

export const getMechanic = async (id: string): Promise<Mechanic> => {
  const response = await api.get(`/mechanics/${id}`)
  return response.data
}

export const createMechanic = async (data: MechanicRequest): Promise<Mechanic> => {
  const response = await api.post('/mechanics', data)
  return response.data
}

export const updateMechanic = async (id: string, data: MechanicRequest): Promise<Mechanic> => {
  const response = await api.put(`/mechanics/${id}`, data)
  return response.data
}

export const setMechanicAvailability = async (id: string, available: boolean): Promise<void> => {
  await api.patch(`/mechanics/${id}/availability?available=${available}`)
}

export const deleteMechanic = async (id: string): Promise<void> => {
  await api.delete(`/mechanics/${id}`)
}
