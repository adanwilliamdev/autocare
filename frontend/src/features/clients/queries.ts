import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { Client, ClientRequest } from "@/types"

export const useClients = () =>
  useQuery({ queryKey: queryKeys.clients, queryFn: () => apiFetch<Client[]>("/clients") })

const invalidate = [queryKeys.clients, queryKeys.dashboard]

export const useCreateClient = () =>
  useAppMutation({
    mutationFn: (data: ClientRequest) => apiFetch<Client>("/clients", { method: "POST", body: data }),
    invalidate,
    success: "Cliente criado com sucesso",
    error: "Erro ao criar cliente",
  })

export const useUpdateClient = () =>
  useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientRequest }) =>
      apiFetch<Client>(`/clients/${id}`, { method: "PUT", body: data }),
    invalidate,
    success: "Cliente atualizado com sucesso",
    error: "Erro ao atualizar cliente",
  })

export const useDeleteClient = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<void>(`/clients/${id}`, { method: "DELETE" }),
    invalidate,
    success: "Cliente removido com sucesso",
    error: "Erro ao remover cliente",
  })

export const useActivateClient = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<void>(`/clients/${id}/activate`, { method: "PATCH" }),
    invalidate,
    success: "Cliente ativado com sucesso",
    error: "Erro ao ativar cliente",
  })
