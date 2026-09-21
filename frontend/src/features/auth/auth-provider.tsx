"use client"

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { clearSession, getRefreshToken, getUserSnapshot, saveSession, subscribeSession } from "@/lib/auth-storage"
import type { LoginCredentials, LoginResponse, Role, User } from "@/types"

interface AuthContextValue {
  user: User | null
  /** false até a sessão salva no navegador ser lida (evita piscar a tela de login). */
  isReady: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const subscribeNever = () => () => {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const user = useSyncExternalStore(subscribeSession, getUserSnapshot, () => null)
  const isReady = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      async login(credentials) {
        const response = await apiFetch<LoginResponse>("/auth/login", {
          method: "POST",
          body: credentials,
          auth: false,
        })
        // Descarta o cache da sessão anterior para que ninguém veja dados de outro usuário.
        queryClient.clear()
        saveSession(response)
        return { id: response.userId, name: response.name, email: response.email, role: response.role }
      },
      async logout() {
        const refreshToken = getRefreshToken()
        clearSession()
        queryClient.clear()
        if (refreshToken) {
          // Revoga o refresh token no servidor. Best-effort: o logout local já aconteceu.
          await apiFetch("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }).catch(() => {})
        }
      },
    }),
    [user, isReady, queryClient]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  return context
}

/** true se o usuário logado tem um dos papéis (usado para esconder ações que a API negaria). */
export function useHasRole(...roles: Role[]) {
  const { user } = useAuth()
  return !!user && roles.includes(user.role)
}
