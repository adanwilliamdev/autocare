import type { LoginResponse } from "@/types"
import { clearSession, getRefreshToken, getToken, saveTokens } from "@/lib/auth-storage"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"

/** Erro devolvido pela API (corpo padrão: { status, message } ou { status, errors[] }). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[]
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    // Erros de validação (422) trazem uma lista; nos demais a mensagem já é legível.
    if (error.errors?.length) return error.errors.join(" · ")
    if (error.status !== 0 && error.status < 500 && error.message) return error.message
  }
  return fallback
}

type Query = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Query
  /** false nas rotas de autenticação (login/refresh/logout): sem Bearer e sem retry por 401. */
  auth?: boolean
}

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: { message?: string; errors?: string[] } = {}
  try {
    body = await response.json()
  } catch {
    // corpo vazio ou não-JSON
  }
  return new ApiError(response.status, body.message ?? response.statusText, body.errors)
}

async function send(path: string, { method = "GET", body, query, auth = true }: RequestOptions) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    return await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor")
  }
}

// O backend rotaciona o refresh token a cada uso. Se várias chamadas tomarem 401 ao mesmo
// tempo, todas esperam a MESMA renovação: uma segunda tentativa em paralelo já encontraria o
// token anterior revogado.
let refreshPromise: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)

  refreshPromise ??= send("/auth/refresh", { method: "POST", body: { refreshToken }, auth: false })
    .then(async (response) => {
      if (!response.ok) return false
      saveTokens((await response.json()) as LoginResponse)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true
  let response = await send(path, options)

  if (response.status === 401 && auth) {
    if (await refreshSession()) {
      response = await send(path, options)
    }
    if (response.status === 401) {
      // Sessão irrecuperável: limpar dispara o redirecionamento para /login (AppShell).
      clearSession()
    }
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
