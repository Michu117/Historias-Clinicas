export interface ApiErrorResponse {
  success: boolean
  message: string
  detail?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public errors?: Record<string, string[]>
  ) {
    super(detail)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message)
  }

  return new ApiError(500, 'Error desconocido en la API')
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.detail
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido'
}
