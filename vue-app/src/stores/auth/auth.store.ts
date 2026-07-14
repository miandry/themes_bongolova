import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { AuthUser, UserRole } from '@/types/entities'
import { API_ROUTES } from '@/services/api-urls'
import { http, apiFetch, extractErrorMessage } from '@/services/http.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const checked = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const authReady = computed(() => checked.value)
  const currentUser = computed(() => user.value)
  const authRole = computed(() => user.value?.role ?? null)
  const canAccessProfils = computed(
    () => authRole.value === 'recruiter' || authRole.value === 'admin',
  )

  function applyUserFromPayload(json: {
    user?: { id?: number; name?: string; email?: string; phone?: string | null }
    role?: string
  }): void {
    if (!json.user?.id) return
    user.value = {
      id: json.user.id,
      name: json.user.name ?? '',
      email: json.user.email ?? '',
      role: (json.role as UserRole) ?? 'candidate',
      phone: json.user.phone ?? null,
    }
  }

  function clearSession(): void {
    user.value = null
  }

  function setSessionUser(u: AuthUser): void {
    user.value = u
    checked.value = true
    success.value = true
  }

  async function login(
    email: string,
    password: string,
  ): Promise<
    | { ok: true; role: string }
    | { ok: false; message: string; code?: string; errors?: Record<string, string[]> }
  > {
    loading.value = true
    error.value = null
    success.value = false
    try {
      const res = await http.post(API_ROUTES.login, { email, password })
      const json = res.data
      applyUserFromPayload(json)
      checked.value = true
      success.value = true
      return { ok: true, role: json.role }
    }
    catch (err) {
      if (!axios.isAxiosError(err) || !err.response) {
        const msg = 'Erreur de connexion. Veuillez réessayer.'
        error.value = msg
        return { ok: false, message: msg }
      }
      const json = err.response.data ?? {}
      const msg = extractErrorMessage(json, 'Identifiants incorrects.')
      error.value = msg
      return {
        ok: false,
        message: msg,
        code: typeof json?.code === 'string' ? json.code : undefined,
        errors: json?.errors,
      }
    }
    finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      if (user.value) {
        await http.post(API_ROUTES.logout).catch(() => {})
      }
      clearSession()
      checked.value = true
    }
    finally {
      loading.value = false
    }
  }

  async function restoreSession(): Promise<void> {
    if (checked.value) return
    loading.value = true
    error.value = null
    try {
      const res = await http.get(API_ROUTES.me, {
        validateStatus: (status) => status === 200 || status === 401,
      })
      if (res.status === 200) {
        applyUserFromPayload(res.data)
      }
      else {
        clearSession()
      }
    }
    catch {
      clearSession()
    }
    finally {
      checked.value = true
      loading.value = false
    }
  }

  async function ensureAuthChecked(): Promise<void> {
    if (!checked.value) {
      await restoreSession()
    }
  }

  async function registerCandidate(payload: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }): Promise<{ ok: boolean; message?: string; code?: string }> {
    loading.value = true
    error.value = null
    success.value = false
    try {
      const r = await apiFetch(API_ROUTES.registerCandidate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, "Erreur lors de l'inscription.")
        error.value = msg
        return { ok: false, message: msg }
      }
      // Email must be verified before login — do not open a session.
      checked.value = true
      success.value = true
      return {
        ok: true,
        message: json.message,
        code: typeof json.code === 'string' ? json.code : 'email_verification_required',
      }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function registerRecruiter(payload: {
    email: string
    password: string
    organization: string
    nif_number?: string
    cin_number?: string
    phone?: string
  }): Promise<{ ok: boolean; message?: string; code?: string }> {
    loading.value = true
    error.value = null
    success.value = false
    try {
      const r = await apiFetch(API_ROUTES.registerRecruiter, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, "Erreur lors de l'inscription.")
        error.value = msg
        return { ok: false, message: msg }
      }
      checked.value = true
      success.value = true
      return {
        ok: true,
        message: json.message,
        code: typeof json.code === 'string' ? json.code : 'email_verification_required',
      }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function verifyEmail(
    token: string,
  ): Promise<{ ok: boolean; message?: string; code?: string; role?: string }> {
    loading.value = true
    error.value = null
    try {
      const r = await apiFetch(API_ROUTES.verifyEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, 'Lien de vérification invalide ou expiré.')
        error.value = msg
        return { ok: false, message: msg }
      }
      return {
        ok: true,
        message: json.message,
        code: typeof json.code === 'string' ? json.code : 'email_verified',
        role: json.role,
      }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function resendVerification(email: string): Promise<{ ok: boolean; message?: string }> {
    loading.value = true
    error.value = null
    try {
      const r = await apiFetch(API_ROUTES.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, "Impossible d'envoyer l'email.")
        error.value = msg
        return { ok: false, message: msg }
      }
      return { ok: true, message: json.message }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function forgotPassword(email: string): Promise<{ ok: boolean; message?: string }> {
    loading.value = true
    error.value = null
    try {
      const r = await apiFetch(API_ROUTES.forgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, "Impossible d'envoyer l'email.")
        error.value = msg
        return { ok: false, message: msg }
      }
      return { ok: true, message: json.message }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function validateResetToken(token: string): Promise<{ ok: boolean; message?: string }> {
    loading.value = true
    error.value = null
    try {
      const r = await apiFetch(`${API_ROUTES.resetPassword}?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, 'Lien invalide ou expiré.')
        error.value = msg
        return { ok: false, message: msg }
      }
      return { ok: true, message: json.message }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  async function resetPassword(
    token: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<{ ok: boolean; message?: string }> {
    loading.value = true
    error.value = null
    try {
      const r = await apiFetch(API_ROUTES.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        const msg = extractErrorMessage(json, 'Impossible de réinitialiser le mot de passe.')
        error.value = msg
        return { ok: false, message: msg }
      }
      return { ok: true, message: json.message }
    }
    catch {
      const msg = 'Erreur de connexion. Veuillez réessayer.'
      error.value = msg
      return { ok: false, message: msg }
    }
    finally {
      loading.value = false
    }
  }

  return {
    user,
    checked,
    loading,
    error,
    success,
    isLoggedIn,
    authReady,
    currentUser,
    authRole,
    canAccessProfils,
    login,
    logout,
    restoreSession,
    ensureAuthChecked,
    setSessionUser,
    registerCandidate,
    registerRecruiter,
    verifyEmail,
    resendVerification,
    forgotPassword,
    validateResetToken,
    resetPassword,
  }
})
