import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { LoginResponse } from '@/types/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Evita que várias chamadas 401 simultâneas disparem várias tentativas de refresh
// em paralelo (o backend rotaciona o refresh token a cada uso, então a segunda
// tentativa em paralelo já encontraria o token anterior revogado).
let refreshPromise: Promise<string | null> | null = null

async function attemptRefresh(): Promise<string | null> {
  const storedRefreshToken = localStorage.getItem('refreshToken')
  if (!storedRefreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<LoginResponse>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
        { refreshToken: storedRefreshToken }
      )
      .then((response) => {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        return response.data.token
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      const newToken = await attemptRefresh()

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
