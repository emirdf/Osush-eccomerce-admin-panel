/** Every error leaving the service layer is normalized into this shape. */
export interface FieldErrors {
  [field: string]: string
}

export class ApiError extends Error {
  status: number
  /** Stable key for a localized fallback message (`errors.<code>`). */
  code: string
  /** Message from the backend, when it sent one. */
  serverMessage: string | null
  fieldErrors?: FieldErrors

  constructor(status: number, code: string, serverMessage?: string | null, fieldErrors?: FieldErrors) {
    super(serverMessage || code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.serverMessage = serverMessage ?? null
    this.fieldErrors = fieldErrors
  }
}

export function errorCode(error: unknown): string {
  return error instanceof ApiError ? error.code : 'unknown'
}

/** Backend-provided message, shown as-is for 4xx (§2). */
export function serverMessage(error: unknown): string | null {
  return error instanceof ApiError ? error.serverMessage : null
}

export function fieldErrorsOf(error: unknown): FieldErrors | undefined {
  return error instanceof ApiError ? error.fieldErrors : undefined
}
