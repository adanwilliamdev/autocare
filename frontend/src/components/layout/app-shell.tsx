"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/features/auth/auth-provider"
import { canAccess, getDefaultRouteForRole } from "@/lib/navigation"

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-2 border-graphite-200 border-t-amber-500" />
    </div>
  )
}

/**
 * Casca das páginas autenticadas: exige login e aplica o acesso por papel em UM lugar
 * (antes cada página se embrulhava em <AuthGuard> e <Layout>). É só experiência de uso —
 * quem realmente autoriza é a API, que devolve 401/403.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const allowed = !!user && canAccess(pathname, user.role)

  useEffect(() => {
    if (!isReady) return
    if (!user) router.replace("/login")
    else if (!allowed) router.replace(getDefaultRouteForRole(user.role))
  }, [isReady, user, allowed, router])

  if (!isReady || !user || !allowed) return <FullScreenSpinner />

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  )
}
