import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { Vehicle, VehicleRequest } from "@/types"

export const useVehicles = () =>
  useQuery({ queryKey: queryKeys.vehicles, queryFn: () => apiFetch<Vehicle[]>("/vehicles") })

export const useVehiclesByClient = (clientId: string) =>
  useQuery({
    queryKey: queryKeys.vehiclesByClient(clientId),
    queryFn: () => apiFetch<Vehicle[]>(`/vehicles/client/${clientId}`),
    enabled: !!clientId,
  })

// O total de veículos aparece na lista de clientes, então ela também é recarregada.
const invalidate = [queryKeys.vehicles, queryKeys.clients, queryKeys.dashboard]

export const useCreateVehicle = () =>
  useAppMutation({
    mutationFn: (data: VehicleRequest) => apiFetch<Vehicle>("/vehicles", { method: "POST", body: data }),
    invalidate,
    success: "Veículo criado com sucesso",
    error: "Erro ao criar veículo",
  })

export const useUpdateVehicle = () =>
  useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleRequest }) =>
      apiFetch<Vehicle>(`/vehicles/${id}`, { method: "PUT", body: data }),
    invalidate,
    success: "Veículo atualizado com sucesso",
    error: "Erro ao atualizar veículo",
  })
