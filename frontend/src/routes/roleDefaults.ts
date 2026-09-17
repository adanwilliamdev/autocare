import { User } from '@/types/auth'

/**
 * Página inicial de cada papel. Necessário porque "/" (Dashboard) é restrito a
 * ADMIN/MANAGER no backend — sem isso, um RECEPTIONIST ou MECHANIC logando cairia
 * em "/", seria barrado pelo PrivateRoute e redirecionado de volta para "/",
 * causando um loop de redirecionamento.
 */
export function getDefaultRouteForRole(role: User['role']): string {
  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return '/'
    case 'RECEPTIONIST':
      return '/clients'
    case 'MECHANIC':
      return '/service-orders'
    default:
      return '/'
  }
}
