"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ReactNode } from "react"
import { User } from "@/types/auth"
import { getDefaultRouteForRole } from "./roleDefaults"

interface AuthGuardProps {
  children: ReactNode
  // Se informado, apenas usuários com um desses papéis podem acessar a rota.
  // Sem isso, qualquer usuário autenticado passava para qualquer página, mesmo
  // quando o backend já negava a chamada correspondente (RolesGuard) — a UI
  // mostrava a tela e só falhava nas chamadas de API, uma experiência ruim e
  // que ainda expunha a existência/estrutura de telas que o usuário não pode usar.
  allowedRoles?: User["role"][]
}

// Equivalente ao PrivateRoute.tsx do React Router original, adaptado para App
// Router: em vez de <Navigate>, usa useRouter().replace dentro de um efeito,
// já que Next não tem um componente de redirect declarativo client-side.
export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Manda para a home do próprio papel, nunca para "/" fixo — "/" é o
      // Dashboard, que nem todo papel pode acessar (ver getDefaultRouteForRole).
      router.replace(getDefaultRouteForRole(user.role))
    }
  }, [isLoading, isAuthenticated, allowedRoles, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
