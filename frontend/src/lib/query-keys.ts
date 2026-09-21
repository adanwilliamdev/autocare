export const queryKeys = {
  clients: ["clients"] as const,
  vehicles: ["vehicles"] as const,
  vehiclesByClient: (clientId: string) => ["vehicles", "client", clientId] as const,
  mechanics: ["mechanics"] as const,
  parts: ["parts"] as const,
  serviceOrders: ["serviceOrders"] as const,
  budgets: ["budgets"] as const,
  dashboard: ["dashboard"] as const,
}
