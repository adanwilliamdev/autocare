import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { ServiceOrder, ServiceOrderRequest, ServiceOrderStatus } from "@/types"

/** MECHANIC vê só as OS atribuídas a ele (GET /service-orders/mine); os demais veem todas. */
export const useServiceOrders = (onlyMine: boolean) =>
  useQuery({
    queryKey: [...queryKeys.serviceOrders, onlyMine ? "mine" : "all"],
    queryFn: () => apiFetch<ServiceOrder[]>(onlyMine ? "/service-orders/mine" : "/service-orders"),
  })

const invalidate = [queryKeys.serviceOrders, queryKeys.dashboard]

export const useCreateServiceOrder = () =>
  useAppMutation({
    mutationFn: (data: ServiceOrderRequest) => apiFetch<ServiceOrder>("/service-orders", { method: "POST", body: data }),
    invalidate,
    success: "Ordem de serviço criada com sucesso",
    error: "Erro ao criar ordem de serviço",
  })

export const useUpdateServiceOrderStatus = () =>
  useAppMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceOrderStatus }) =>
      apiFetch<ServiceOrder>(`/service-orders/${id}/status`, { method: "PATCH", body: { status } }),
    invalidate,
    success: "Status atualizado com sucesso",
    error: "Erro ao atualizar status",
    invalidateOnError: true,
  })
