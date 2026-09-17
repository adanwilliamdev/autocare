import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'
import { User } from '@/types/auth'
import { getDefaultRouteForRole } from './roleDefaults'

interface PrivateRouteProps {
  children: ReactNode
  // Se informado, apenas usuários com um desses papéis podem acessar a rota.
  // Sem isso, qualquer usuário autenticado passava para qualquer página, mesmo
  // quando o backend já negava a chamada correspondente (@PreAuthorize) — a UI
  // mostrava a tela e só falhava nas chamadas de API, uma experiência ruim e
  // que ainda expunha a existência/estrutura de telas que o usuário não pode usar.
  allowedRoles?: User['role'][]
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Manda para a home do próprio papel, nunca para "/" fixo — "/" é o Dashboard,
    // que nem todo papel pode acessar (ver getDefaultRouteForRole).
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <>{children}</>
}
