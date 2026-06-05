import { ref, computed } from 'vue'

const TOKEN_KEY = 'bongolava_token'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
  phone?: string | null
}

// ── Reactive state (module-level singletons) ──────────────────────────────────
const token    = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const user     = ref<AuthUser | null>(null)
const checked  = ref(false)           // true once /me has been called

export const isLoggedIn  = computed(() => !!token.value)
export const currentUser = computed(() => user.value)
export const authRole    = computed(() => user.value?.role ?? null)
export const canAccessProfils = computed(
  () => authRole.value === 'recruiter' || authRole.value === 'admin',
)

// ── Base URL helper ───────────────────────────────────────────────────────────
function apiBase(): string {
  const base = (window as Record<string, unknown>).__drupalBasePath as string ?? '/'
  return base.replace(/\/$/, '')
}

function url(path: string): string {
  return `${apiBase()}/${path.replace(/^\//, '')}`
}

// ── Token helpers ─────────────────────────────────────────────────────────────
function saveToken(t: string) {
  token.value = t
  localStorage.setItem(TOKEN_KEY, t)
}

function clearToken() {
  token.value = null
  user.value  = null
  checked.value = false
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(json = true): Record<string, string> {
  const h: Record<string, string> = {}
  if (json) h['Content-Type'] = 'application/json'
  if (token.value) h['Authorization'] = `Bearer ${token.value}`
  return h
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; role: string } | { ok: false; message: string; errors?: Record<string, string[]> }> {
  const res = await fetch(url('bongolava_job/login'), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = json?.errors?.email?.[0]
      ?? json?.message
      ?? 'Identifiants incorrects.'
    return { ok: false, message: msg, errors: json?.errors }
  }

  saveToken(json.token)
  user.value = {
    id:    json.user?.id,
    name:  json.user?.name,
    email: json.user?.email,
    role:  json.role,
    phone: json.user?.phone ?? null,
  }
  checked.value = true
  return { ok: true, role: json.role }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  if (token.value) {
    await fetch(url('bongolava_job/logout'), {
      method:  'POST',
      headers: authHeaders(),
    }).catch(() => {})
  }
  clearToken()
}

/** Wait until /me has run (or no token). Use before route guards. */
export async function ensureAuthChecked(): Promise<void> {
  if (!checked.value) {
    await restoreSession()
  }
}

// ── Restore session (called once on app boot) ─────────────────────────────────
export async function restoreSession(): Promise<void> {
  if (checked.value) return
  if (!token.value) { checked.value = true; return }

  try {
    const res = await fetch(url('bongolava_job/me'), {
      headers: authHeaders(),
    })
    if (!res.ok) { clearToken(); return }
    const json = await res.json()
    user.value = {
      id:    json.user?.id,
      name:  json.user?.name,
      email: json.user?.email,
      role:  json.role,
      phone: json.user?.phone ?? null,
    }
  } catch {
    clearToken()
  } finally {
    checked.value = true
  }
}

// ── Authenticated fetch wrapper ───────────────────────────────────────────────
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  const headers = {
    ...authHeaders(!isFormData),
    ...(init.headers as Record<string, string> ?? {}),
  }

  // MAMP/Apache often strips Authorization on multipart POST — duplicate token in body + query.
  let body = init.body
  let fetchPath = path
  if (token.value) {
    if (isFormData && body instanceof FormData) {
      const fd = body as FormData
      if (!fd.has('token')) fd.append('token', token.value)
      body = fd
    }
    const sep = fetchPath.includes('?') ? '&' : '?'
    fetchPath += `${sep}token=${encodeURIComponent(token.value)}`
  }

  return fetch(url(fetchPath), { ...init, body, headers })
}

// ── Store token + user after registration ─────────────────────────────────────
export function loginWithToken(t: string, u: AuthUser): void {
  saveToken(t)
  user.value = u
  checked.value = true
}
