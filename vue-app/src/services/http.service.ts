import axios, { type AxiosRequestConfig } from 'axios'

export function drupalBasePath(): string {
  const base = (window as unknown as { __drupalBasePath?: string }).__drupalBasePath ?? '/'
  return base.replace(/\/$/, '')
}

export function buildUrl(path: string): string {
  return `${drupalBasePath()}/${path.replace(/^\//, '')}`
}

export const http = axios.create({
  withCredentials: true,
})

/** Ensure relative API paths resolve from Drupal root, not the current Vue route. */
http.interceptors.request.use((config) => {
  const url = config.url
  if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    config.url = buildUrl(url)
  }
  return config
})

/** Fetch-compatible wrapper around axios (session cookies). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData

  const headers: Record<string, string> = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (init.headers) {
    Object.assign(headers, init.headers as Record<string, string>)
  }

  const config: AxiosRequestConfig = {
    url: buildUrl(path),
    method: method as AxiosRequestConfig['method'],
    headers,
    data: init.body,
    withCredentials: true,
    validateStatus: () => true,
    responseType: 'json',
  }

  const res = await http.request(config)
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    statusText: String(res.status),
    headers: new Headers(),
    json: async () => res.data,
    text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
    blob: async () => new Blob([JSON.stringify(res.data)]),
    arrayBuffer: async () => new TextEncoder().encode(JSON.stringify(res.data)).buffer,
    clone: () => { throw new Error('clone not supported') },
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: config.url ?? '',
  } as unknown as Response
}

export function extractErrorMessage(
  data: unknown,
  fallback = 'Une erreur est survenue.',
): string {
  if (data && typeof data === 'object') {
    const json = data as { message?: string; errors?: Record<string, string[]> }
    const fromField = json.errors
      ? Object.values(json.errors).flat().filter(Boolean)[0]
      : undefined
    if (fromField) return fromField
    if (json.message) return json.message
  }
  return fallback
}
