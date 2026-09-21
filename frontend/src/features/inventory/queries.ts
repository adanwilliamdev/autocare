import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { Part, PartRequest } from "@/types"

export const useParts = () => useQuery({ queryKey: queryKeys.parts, queryFn: () => apiFetch<Part[]>("/inventory/parts") })

// Estoque baixo aparece no dashboard, então ele também é recarregado.
const invalidate = [queryKeys.parts, queryKeys.dashboard]

export const useCreatePart = () =>
  useAppMutation({
    mutationFn: (data: PartRequest) => apiFetch<Part>("/inventory/parts", { method: "POST", body: data }),
    invalidate,
    success: "Peça criada com sucesso",
    error: "Erro ao criar peça",
  })

export const useUpdatePart = () =>
  useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: PartRequest }) =>
      apiFetch<Part>(`/inventory/parts/${id}`, { method: "PUT", body: data }),
    invalidate,
    success: "Peça atualizada com sucesso",
    error: "Erro ao atualizar peça",
  })

export const useDeletePart = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<void>(`/inventory/parts/${id}`, { method: "DELETE" }),
    invalidate,
    success: "Peça removida com sucesso",
    error: "Erro ao remover peça",
  })

export type StockMovementKind = "ENTRADA" | "SAIDA"

export const useMoveStock = () =>
  useAppMutation({
    mutationFn: ({
      id,
      kind,
      quantity,
      reason,
    }: {
      id: string
      kind: StockMovementKind
      quantity: number
      reason: string | null
    }) =>
      apiFetch<void>(`/inventory/parts/${id}/${kind === "ENTRADA" ? "add-stock" : "remove-stock"}`, {
        method: "POST",
        // O usuário da auditoria vem do token no servidor; nada de userId aqui.
        query: { quantity, reason },
      }),
    invalidate,
    success: "Estoque atualizado",
    error: "Erro ao atualizar estoque",
    // 409 = outra pessoa mexeu na mesma peça: recarrega para mostrar o estoque atual.
    invalidateOnError: true,
  })
