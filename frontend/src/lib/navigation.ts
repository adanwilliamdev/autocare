import {
  ClipboardList,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import type { Role } from "@/types"

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  /** Papéis que podem abrir a rota — espelha as regras de acesso da API. */
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER"] },
  { path: "/clients", label: "Clientes", icon: Users, roles: ["ADMIN", "RECEPTIONIST", "MANAGER"] },
  { path: "/vehicles", label: "Veículos", icon: Truck, roles: ["ADMIN", "RECEPTIONIST", "MANAGER", "MECHANIC"] },
  { path: "/mechanics", label: "Mecânicos", icon: UsersRound, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
  {
    path: "/service-orders",
    label: "Ordens de serviço",
    icon: ClipboardList,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "MECHANIC"],
  },
  { path: "/budgets", label: "Orçamentos", icon: CircleDollarSign, roles: ["ADMIN", "RECEPTIONIST", "MANAGER"] },
  { path: "/inventory", label: "Estoque", icon: Package, roles: ["ADMIN", "MANAGER"] },
]

export const isActivePath = (itemPath: string, pathname: string) =>
  itemPath === "/" ? pathname === "/" : pathname === itemPath || pathname.startsWith(`${itemPath}/`)

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => isActivePath(item.path, pathname))
}

/** Rotas desconhecidas (ex.: 404) passam; o backend continua sendo quem de fato autoriza. */
export function canAccess(pathname: string, role: Role): boolean {
  const item = findNavItem(pathname)
  return !item || item.roles.includes(role)
}

/**
 * Página inicial de cada papel. "/" (Dashboard) é restrito a ADMIN/MANAGER; sem isto, um
 * RECEPTIONIST ou MECHANIC seria barrado em "/" e redirecionado de volta a "/" (loop).
 */
export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "RECEPTIONIST":
      return "/clients"
    case "MECHANIC":
      return "/service-orders"
    default:
      return "/"
  }
}
