"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/contexts/AuthContext"
import { User } from "@/types/auth"

const menuItems: { path: string; label: string; icon: typeof HomeIcon; roles: User["role"][] }[] = [
  { path: "/", label: "Dashboard", icon: HomeIcon, roles: ["ADMIN", "MANAGER"] },
  { path: "/clients", label: "Clientes", icon: UsersIcon, roles: ["ADMIN", "RECEPTIONIST", "MANAGER"] },
  { path: "/vehicles", label: "Veículos", icon: TruckIcon, roles: ["ADMIN", "RECEPTIONIST", "MANAGER", "MECHANIC"] },
  { path: "/mechanics", label: "Mecânicos", icon: UserGroupIcon, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
  { path: "/service-orders", label: "Ordens de serviço", icon: ClipboardDocumentListIcon, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "MECHANIC"] },
  { path: "/budgets", label: "Orçamentos", icon: CurrencyDollarIcon, roles: ["ADMIN", "RECEPTIONIST", "MANAGER"] },
  { path: "/inventory", label: "Estoque", icon: CubeIcon, roles: ["ADMIN", "MANAGER"] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  // Sem isso, o menu mostrava links que o próprio backend recusaria para o papel
  // logado (ex.: um MECHANIC via "Estoque" e caía num 403 ao clicar).
  const visibleItems = menuItems.filter((item) => !user || item.roles.includes(user.role))

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-graphite-900 text-graphite-200 flex flex-col">
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-400 flex-shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-lg font-display font-semibold text-white tracking-tight">AutoCare</h1>
        </div>
        <p className="text-xs text-graphite-400 mt-1 pl-[30px]">Sistema de gestão</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-graphite-800 text-white"
                  : "text-graphite-400 hover:bg-graphite-800/60 hover:text-graphite-100"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full transition-opacity duration-150 ${
                  isActive ? "bg-amber-400 opacity-100" : "opacity-0"
                }`}
              />
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-amber-400" : "text-graphite-500 group-hover:text-graphite-300"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-5 border-t border-graphite-800">
        <p className="text-xs text-graphite-500">v1.0 · Painel interno</p>
      </div>
    </aside>
  )
}
