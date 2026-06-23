/**
 * Cliente de API minimalista
 * En la FASE VERDE se expandirá con Axios u otra librería HTTP
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}

export class SimpleApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return (
    localStorage.getItem('token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken')
  )
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    const token = this.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    })

    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/seguridad/login'
    }

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`
      try {
        const errorBody = await response.json()
        if (errorBody?.message) errorMessage = errorBody.message
        if (errorBody?.errors) errorMessage += `\n${JSON.stringify(errorBody.errors, null, 2)}`
      } catch {}
      throw new Error(errorMessage)
    }

    return response.json() as Promise<T>
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data })
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data })
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new SimpleApiClient()


