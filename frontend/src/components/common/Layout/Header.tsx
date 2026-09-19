"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clientes",
  "/vehicles": "Veículos",
  "/mechanics": "Mecânicos",
  "/service-orders": "Ordens de serviço",
  "/budgets": "Orçamentos",
  "/inventory": "Estoque",
}

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const initials = (user?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")

  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-sm border-b border-graphite-100">
      <div className="flex items-center justify-between px-8 py-4">
        <p className="text-sm font-medium text-graphite-500">
          {pageTitles[pathname] ?? "AutoCare"}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-graphite-800 text-white flex items-center justify-center text-xs font-semibold font-display">
              {initials || "?"}
            </div>
            <div className="text-sm leading-tight">
              <p className="font-medium text-graphite-800">{user?.name}</p>
              <p className="text-graphite-400 text-xs">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-graphite-400 hover:text-graphite-700 hover:bg-graphite-100 transition-colors duration-150"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
