"use client"

// Dashboard e relatórios: só ADMIN e MANAGER (mesma regra do DashboardController).
import AuthGuard from "@/lib/AuthGuard"
import Dashboard from "@/components/dashboard/Dashboard"

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <Dashboard />
    </AuthGuard>
  )
}
