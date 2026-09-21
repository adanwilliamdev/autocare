import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import { useAppMutation } from "@/lib/use-app-mutation"
import type { Budget, BudgetRequest } from "@/types"

export const useBudgets = () => useQuery({ queryKey: queryKeys.budgets, queryFn: () => apiFetch<Budget[]>("/budgets") })

const invalidate = [queryKeys.budgets]

export const useCreateBudget = () =>
  useAppMutation({
    mutationFn: (data: BudgetRequest) => apiFetch<Budget>("/budgets", { method: "POST", body: data }),
    invalidate,
    success: "Orçamento criado com sucesso",
    error: "Erro ao criar orçamento",
  })

export const useApproveBudget = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<Budget>(`/budgets/${id}/approve`, { method: "PATCH" }),
    invalidate,
    success: "Orçamento aprovado",
    error: "Erro ao aprovar orçamento",
    // Se outra pessoa já decidiu, recarrega para mostrar o status atual.
    invalidateOnError: true,
  })

export const useRejectBudget = () =>
  useAppMutation({
    mutationFn: (id: string) => apiFetch<Budget>(`/budgets/${id}/reject`, { method: "PATCH" }),
    invalidate,
    success: "Orçamento recusado",
    error: "Erro ao recusar orçamento",
    invalidateOnError: true,
  })
