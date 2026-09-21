"use client"

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/lib/api-client"

interface Options<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  /** Chaves de cache a invalidar quando a mutação dá certo. */
  invalidate: readonly QueryKey[]
  success: string
  error: string
  /** Também recarrega os dados quando falha (ex.: outro usuário já decidiu o orçamento). */
  invalidateOnError?: boolean
}

/** useMutation com o padrão do app: invalida o cache e mostra toast de sucesso/erro. */
export function useAppMutation<TData, TVariables = void>({
  mutationFn,
  invalidate,
  success,
  error,
  invalidateOnError = false,
}: Options<TData, TVariables>) {
  const queryClient = useQueryClient()
  const refresh = () => invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))

  return useMutation({
    mutationFn,
    onSuccess: () => {
      refresh()
      toast.success(success)
    },
    onError: (err) => {
      if (invalidateOnError) refresh()
      toast.error(getErrorMessage(err, error))
    },
  })
}
