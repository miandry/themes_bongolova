import { apiFetch } from './useAuth'
import { startLoading, stopLoading } from './useLoading'

function base() {
  const b = (window as Record<string, unknown>).__drupalBasePath as string ?? '/'
  return b.replace(/\/$/, '')
}

export function apiUrl(path: string) {
  return `${base()}/${path.replace(/^\//, '')}`
}

// ── Core fetch wrapper with global loading tracking ───────────────────────────
async function tracked<T>(fn: () => Promise<T>): Promise<T> {
  startLoading()
  try {
    return await fn()
  } finally {
    stopLoading()
  }
}

// ── Public helpers ─────────────────────────────────────────────────────────────
export async function apiGet<T>(path: string): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path)
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error((j as { message?: string })?.message ?? `${r.status}`)
    }
    return r.json() as Promise<T>
  })
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error((j as { message?: string })?.message ?? `${r.status}`)
    }
    return r.json() as Promise<T>
  })
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error((j as { message?: string })?.message ?? `${r.status}`)
    }
    return r.json() as Promise<T>
  })
}

export async function apiPostForm<T>(path: string, fd: FormData): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, { method: 'POST', body: fd })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      const msg = (j as { message?: string })?.message ?? `${r.status}`
      if (r.status === 401) {
        throw new Error('Session expirée ou non authentifié. Reconnectez-vous en tant que candidat.')
      }
      if (r.status === 403) {
        throw new Error('Accès refusé. Seuls les comptes candidat peuvent postuler.')
      }
      throw new Error(msg)
    }
    return r.json() as Promise<T>
  })
}

export async function apiDelete<T>(path: string): Promise<T> {
  return tracked(async () => {
    const r = await apiFetch(path, { method: 'DELETE' })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      throw new Error((j as { message?: string })?.message ?? `${r.status}`)
    }
    return r.json() as Promise<T>
  })
}
