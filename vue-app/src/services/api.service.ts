import { apiFetch, extractErrorMessage } from './http.service'
import { useUiStore } from '@/stores/ui/ui.store'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function tracked<T>(fn: () => Promise<T>, trackLoading = true): Promise<T> {
  const ui = useUiStore()
  if (trackLoading) ui.startLoading()
  try {
    return await fn()
  } finally {
    if (trackLoading) ui.stopLoading()
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = extractErrorMessage(data, `${response.status}`)
    if (response.status === 401) {
      throw new ApiError('Session expirée ou non authentifié. Reconnectez-vous.', 401, data)
    }
    if (response.status === 403) {
      throw new ApiError('Accès refusé.', 403, data)
    }
    throw new ApiError(message, response.status, data)
  }
  return response.json() as Promise<T>
}

export async function apiGet<T>(path: string, trackLoading = true): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path)
    return handleResponse<T>(r)
  }, trackLoading)
}

export async function apiPost<T>(path: string, body: unknown, trackLoading = true): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse<T>(r)
  }, trackLoading)
}

export async function apiPut<T>(path: string, body: unknown, trackLoading = true): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return handleResponse<T>(r)
  }, trackLoading)
}

export async function apiDelete<T>(path: string, trackLoading = true): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, { method: 'DELETE' })
    return handleResponse<T>(r)
  }, trackLoading)
}

export async function apiPostForm<T>(path: string, fd: FormData, trackLoading = true): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, { method: 'POST', body: fd })
    return handleResponse<T>(r)
  }, trackLoading)
}

/** Build query string from filter object, skipping empty values. */
export function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/** Normalize list responses (array or { data: [] }). */
export function normalizeList<T>(data: T[] | { data?: T[] }): T[] {
  if (Array.isArray(data)) return data
  return data?.data ?? []
}
