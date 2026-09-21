import { useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { DashboardStats } from "@/types"

export const useDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
    refetchInterval: 30_000,
  })
