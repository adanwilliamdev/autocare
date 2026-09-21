import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { Mechanic, MechanicRequest } from "@/types"

export const useMechanics = () =>
  useQuery({ queryKey: queryKeys.mechanics, queryFn: () => apiFetch<Mechanic[]>("/mechanics") })

const invalidate = [queryKeys.mechanics]

export const useCreateMechanic = () =>
  useAppMutation({
    mutationFn: (data: MechanicRequest) => apiFetch<Mechanic>("/mechanics", { method: "POST", body: data }),
    invalidate,
    success: "Mecânico criado com sucesso",
    error: "Erro ao criar mecânico",
  })

export const useUpdateMechanic = () =>
  useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: MechanicRequest }) =>
      apiFetch<Mechanic>(`/mechanics/${id}`, { method: "PUT", body: data }),
    invalidate,
    success: "Mecânico atualizado com sucesso",
    error: "Erro ao atualizar mecânico",
  })

export const useDeleteMechanic = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<void>(`/mechanics/${id}`, { method: "DELETE" }),
    invalidate,
    success: "Mecânico removido com sucesso",
    error: "Erro ao remover mecânico",
  })

export const useSetMechanicAvailability = () =>
  useAppMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      apiFetch<void>(`/mechanics/${id}/availability`, { method: "PATCH", query: { available } }),
    invalidate,
    success: "Disponibilidade atualizada",
    error: "Erro ao atualizar disponibilidade",
  })
