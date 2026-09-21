import type { LoginResponse, User } from "@/types"

// Tokens em localStorage (mesma estratégia do app original). O store abaixo é lido pelo React
// via useSyncExternalStore, então login/logout em qualquer aba atualiza a interface.
const TOKEN_KEY = "token"
const REFRESH_KEY = "refreshToken"
const USER_KEY = "user"

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

const isBrowser = () => typeof window !== "undefined"

export const getToken = () => (isBrowser() ? localStorage.getItem(TOKEN_KEY) : null)
export const getRefreshToken = () => (isBrowser() ? localStorage.getItem(REFRESH_KEY) : null)

export function saveSession(response: LoginResponse) {
  const user: User = { id: response.userId, name: response.name, email: response.email, role: response.role }
  localStorage.setItem(TOKEN_KEY, response.token)
  localStorage.setItem(REFRESH_KEY, response.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  emit()
}

/** Atualiza só os tokens (renovação), mantendo o usuário salvo. */
export function saveTokens(response: LoginResponse) {
  saveSession(response)
}

export function clearSession() {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  emit()
}

// getSnapshot precisa devolver a MESMA referência enquanto nada mudou; por isso o cache por string.
let cachedRaw: string | null = null
let cachedUser: User | null = null

export function getUserSnapshot(): User | null {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(TOKEN_KEY) ? localStorage.getItem(USER_KEY) : null
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedUser = raw ? (JSON.parse(raw) as User) : null
    } catch {
      cachedUser = null
    }
  }
  return cachedUser
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || [TOKEN_KEY, REFRESH_KEY, USER_KEY].includes(event.key)) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}
