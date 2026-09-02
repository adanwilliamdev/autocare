import api from './axios'
import { Client, ClientRequest } from '@/types/client'

export const getClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients')
  return response.data
}

export const getClient = async (id: string): Promise<Client> => {
  const response = await api.get(`/clients/${id}`)
  return response.data
}

export const searchClients = async (name: string): Promise<Client[]> => {
  const response = await api.get(`/clients/search?name=${name}`)
  return response.data
}

export const createClient = async (data: ClientRequest): Promise<Client> => {
  const response = await api.post('/clients', data)
  return response.data
}

export const updateClient = async (id: string, data: ClientRequest): Promise<Client> => {
  const response = await api.put(`/clients/${id}`, data)
  return response.data
}

export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/clients/${id}`)
}

export const activateClient = async (id: string): Promise<void> => {
  await api.patch(`/clients/${id}/activate`)
}