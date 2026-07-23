import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Candidate, Application, RecruiterApplicationSearchFilters } from '@/types/entities'
import type { CandidateSearchFilters, PaginatedResponse } from '@/types/entities'
import { API_ROUTES } from '@/services/api-urls'
import {
  apiGet,
  apiPut,
  apiPost,
  apiPostForm,
  apiDelete,
  toQueryString,
  normalizePaginatedList,
} from '@/services/api.service'
import { useAuthStore } from '@/stores/auth/auth.store'

const CACHE_TTL_MS = 60_000

export const useUserStore = defineStore('user', () => {
  const auth = useAuthStore()

  // ── Profile (current user) ────────────────────────────────────────────────
  const profile = ref<Record<string, unknown> | null>(null)
  const profileLoading = ref(false)
  const profileSaving = ref(false)
  const profileError = ref<string | null>(null)
  const profileSuccess = ref(false)

  // ── Candidates directory ──────────────────────────────────────────────────
  const candidates = ref<Candidate[]>([])
  const candidate = ref<Candidate | null>(null)
  const candidatesLoading = ref(false)
  const candidateLoading = ref(false)
  const candidatesError = ref<string | null>(null)
  const candidateError = ref<string | null>(null)

  const candidatesTotal = ref(0)
  const candidatesCurrentPage = ref(1)
  const candidatesLastPage = ref(1)
  const candidatesPerPage = ref(12)

  // ── Applications ────────────────────────────────────────────────────────
  const applications = ref<Application[]>([])
  const applicationsLoading = ref(false)

  // ── Recruiter applications ───────────────────────────────────────────────
  const recruiterApplications = ref<Application[]>([])
  const recruiterApplicationsLoading = ref(false)
  const recruiterApplicationsTotal = ref(0)
  const recruiterApplicationsCurrentPage = ref(1)
  const recruiterApplicationsLastPage = ref(1)
  const recruiterApplicationsPerPage = ref(20)

  // ── Saved jobs / profiles (local UI state + API saved jobs) ─────────────
  const savedJobIds = ref<number[]>([])
  const savedProfileIds = ref<number[]>([])
  const savedJobsLoading = ref(false)

  // ── Upload states ───────────────────────────────────────────────────────
  const photoLoading = ref(false)
  const cvLoading = ref(false)
  const cvDeleting = ref(false)
  const logoLoading = ref(false)

  let candidatesCacheKey = ''
  let candidatesCacheTime = 0
  const candidateDetailCache = new Map<number, { data: Candidate; fetchedAt: number }>()

  const isRecruiter = computed(() => auth.authRole === 'recruiter')
  const isCandidate = computed(() => auth.authRole === 'candidate')

  const topCandidates = computed(() => candidates.value.slice(0, 4))

  function myProfilePath(): string {
    return isRecruiter.value
      ? API_ROUTES.myRecruiterProfile
      : API_ROUTES.myCandidateProfile
  }

  // ── My profile ────────────────────────────────────────────────────────────
  async function fetchMyProfile() {
    profileLoading.value = true
    profileError.value = null
    try {
      profile.value = await apiGet<Record<string, unknown>>(myProfilePath())
      return profile.value
    }
    catch (e) {
      profileError.value = (e instanceof Error ? e.message : 'Profil introuvable.')
        + ' — Complétez votre profil via le formulaire ci-dessous.'
      profile.value = {}
      return profile.value
    }
    finally {
      profileLoading.value = false
    }
  }

  async function updateMyProfile(payload: Record<string, unknown>) {
    profileSaving.value = true
    profileError.value = null
    profileSuccess.value = false
    try {
      profile.value = await apiPut<Record<string, unknown>>(myProfilePath(), payload)
      profileSuccess.value = true
      return profile.value
    }
    catch (e) {
      profileError.value = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
      throw e
    }
    finally {
      profileSaving.value = false
    }
  }

  async function uploadPhoto(file: File) {
    photoLoading.value = true
    profileError.value = null
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await apiPostForm<{ photo_path: string }>(API_ROUTES.candidateUploadPhoto, fd)
      if (profile.value) {
        profile.value = { ...profile.value, photo_path: res.photo_path }
      }
      return res
    }
    catch (e) {
      profileError.value = e instanceof Error ? e.message : 'Erreur upload photo.'
      throw e
    }
    finally {
      photoLoading.value = false
    }
  }

  async function uploadCv(file: File) {
    cvLoading.value = true
    profileError.value = null
    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res = await apiPostForm<{ cv_path: string }>(API_ROUTES.candidateUploadCv, fd)
      if (profile.value) {
        profile.value = { ...profile.value, cv_path: res.cv_path }
      }
      return res
    }
    catch (e) {
      profileError.value = e instanceof Error ? e.message : 'Erreur upload CV.'
      throw e
    }
    finally {
      cvLoading.value = false
    }
  }

  async function deleteCv() {
    cvDeleting.value = true
    profileError.value = null
    try {
      await apiDelete(API_ROUTES.candidateDeleteCv, {})
      if (profile.value) {
        profile.value = { ...profile.value, cv_path: null }
      }
    }
    catch (e) {
      profileError.value = e instanceof Error ? e.message : 'Erreur suppression CV.'
      throw e
    }
    finally {
      cvDeleting.value = false
    }
  }

  async function uploadLogo(file: File) {
    logoLoading.value = true
    profileError.value = null
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const res = await apiPostForm<{ logo_path: string }>(API_ROUTES.recruiterUploadLogo, fd)
      if (profile.value) {
        profile.value = { ...profile.value, logo_path: res.logo_path }
      }
      return res
    }
    catch (e) {
      profileError.value = e instanceof Error ? e.message : 'Erreur upload logo.'
      throw e
    }
    finally {
      logoLoading.value = false
    }
  }

  // ── Applications ──────────────────────────────────────────────────────────
  async function fetchMyApplications() {
    if (!isCandidate.value) return []
    applicationsLoading.value = true
    try {
      applications.value = await apiGet<Application[]>(API_ROUTES.candidateApplications)
      return applications.value
    }
    catch {
      applications.value = []
      return []
    }
    finally {
      applicationsLoading.value = false
    }
  }

  async function fetchRecruiterApplications(filters: RecruiterApplicationSearchFilters = {}) {
    if (!isRecruiter.value) return []
    recruiterApplicationsLoading.value = true
    try {
      const path = API_ROUTES.recruiterApplications + toQueryString({
        keyword: filters.keyword,
        status: filters.status,
        job_title: filters.job_title,
        per_page: filters.per_page ?? recruiterApplicationsPerPage.value,
        page: filters.page ?? recruiterApplicationsCurrentPage.value,
      })
      const data = await apiGet<Application[] | PaginatedResponse<Application>>(path)
      const { items, meta } = normalizePaginatedList(data)
      recruiterApplications.value = items
      if (meta) {
        recruiterApplicationsTotal.value = meta.total
        recruiterApplicationsCurrentPage.value = meta.current_page
        recruiterApplicationsLastPage.value = meta.last_page
        recruiterApplicationsPerPage.value = meta.per_page
      } else {
        recruiterApplicationsTotal.value = items.length
        recruiterApplicationsCurrentPage.value = 1
        recruiterApplicationsLastPage.value = 1
        recruiterApplicationsPerPage.value = items.length
      }
      return recruiterApplications.value
    } catch {
      recruiterApplications.value = []
      recruiterApplicationsTotal.value = 0
      return []
    } finally {
      recruiterApplicationsLoading.value = false
    }
  }

  async function updateRecruiterApplicationStatus(id: number | string, status: string) {
    if (!isRecruiter.value) throw new Error('Accès refusé.')
    const updated = await apiPut<Application>(API_ROUTES.recruiterApplication(id), { status })
    recruiterApplications.value = recruiterApplications.value.map((a) =>
      a.id === Number(id) ? { ...a, ...updated } : a,
    )
    return updated
  }

  // ── Candidates directory ──────────────────────────────────────────────────
  async function fetchCandidates(filters: CandidateSearchFilters = {}, useCache = true) {
    const key = toQueryString(filters as Record<string, string>)
    if (useCache && candidatesCacheKey === key && Date.now() - candidatesCacheTime < CACHE_TTL_MS) {
      return candidates.value
    }

    candidatesLoading.value = true
    candidatesError.value = null
    try {
      const path = API_ROUTES.candidates + toQueryString({
        keyword: filters.keyword,
        location: filters.location,
        per_page: filters.per_page,
        page: filters.page,
      })
      const data = await apiGet<Candidate[] | PaginatedResponse<Candidate>>(path)
      const { items, meta } = normalizePaginatedList(data)
      candidates.value = items
      if (meta) {
        candidatesTotal.value = meta.total
        candidatesCurrentPage.value = meta.current_page
        candidatesLastPage.value = meta.last_page
        candidatesPerPage.value = meta.per_page
      }
      else {
        candidatesTotal.value = items.length
        candidatesCurrentPage.value = 1
        candidatesLastPage.value = 1
        candidatesPerPage.value = items.length
      }
      candidatesCacheKey = key
      candidatesCacheTime = Date.now()
      return candidates.value
    }
    catch (e) {
      candidatesError.value = e instanceof Error ? e.message : 'Impossible de charger les profils.'
      candidates.value = []
      throw e
    }
    finally {
      candidatesLoading.value = false
    }
  }

  async function fetchCandidateById(id: number | string, useCache = true) {
    const numId = Number(id)
    const cached = candidateDetailCache.get(numId)
    if (useCache && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      candidate.value = cached.data
      return candidate.value
    }

    candidateLoading.value = true
    candidateError.value = null
    try {
      const data = await apiGet<Candidate>(API_ROUTES.candidate(id))
      if (!data?.id) {
        candidateError.value = 'Profil introuvable.'
        candidate.value = null
        return null
      }
      candidate.value = data
      candidateDetailCache.set(numId, { data, fetchedAt: Date.now() })
      return candidate.value
    }
    catch {
      candidateError.value = 'Profil introuvable.'
      candidate.value = null
      return null
    }
    finally {
      candidateLoading.value = false
    }
  }

  async function searchCandidates(filters: CandidateSearchFilters) {
    return fetchCandidates(filters, false)
  }

  async function contactCandidate(
    id: number | string,
    payload: { subject: string; message: string },
  ) {
    return apiPost<{ message: string }>(API_ROUTES.candidateContact(id), payload)
  }

  // ── Saved jobs (API) ──────────────────────────────────────────────────────
  async function fetchSavedJobs() {
    if (!isCandidate.value) return []
    savedJobsLoading.value = true
    try {
      const data = await apiGet<{ job_id: number }[]>(API_ROUTES.savedJobs)
      savedJobIds.value = data.map((s) => s.job_id)
      return savedJobIds.value
    }
    catch {
      savedJobIds.value = []
      return []
    }
    finally {
      savedJobsLoading.value = false
    }
  }

  async function saveJob(jobId: number) {
    await apiPost(API_ROUTES.savedJob(jobId), {})
    if (!savedJobIds.value.includes(jobId)) {
      savedJobIds.value.push(jobId)
    }
  }

  async function unsaveJob(savedJobId: number) {
    await apiDelete(API_ROUTES.savedJob(savedJobId))
    savedJobIds.value = savedJobIds.value.filter((id) => id !== savedJobId)
  }

  // ── Local favorites (profiles — UI only until API exists) ─────────────────
  function toggleSavedProfile(id: number) {
    const i = savedProfileIds.value.indexOf(id)
    if (i > -1) savedProfileIds.value.splice(i, 1)
    else savedProfileIds.value.push(id)
  }

  function isProfileSaved(id: number): boolean {
    return savedProfileIds.value.includes(id)
  }

  function clearProfileState() {
    profile.value = null
    applications.value = []
    savedJobIds.value = []
  }

  return {
    profile,
    profileLoading,
    profileSaving,
    profileError,
    profileSuccess,
    candidates,
    candidate,
    candidatesLoading,
    candidateLoading,
    candidatesError,
    candidateError,
    candidatesTotal,
    candidatesCurrentPage,
    candidatesLastPage,
    candidatesPerPage,
    applications,
    applicationsLoading,
    recruiterApplications,
    recruiterApplicationsLoading,
    recruiterApplicationsTotal,
    recruiterApplicationsCurrentPage,
    recruiterApplicationsLastPage,
    recruiterApplicationsPerPage,
    savedJobIds,
    savedProfileIds,
    savedJobsLoading,
    photoLoading,
    cvLoading,
    cvDeleting,
    logoLoading,
    isRecruiter,
    isCandidate,
    topCandidates,
    fetchMyProfile,
    updateMyProfile,
    uploadPhoto,
    uploadCv,
    deleteCv,
    uploadLogo,
    fetchMyApplications,
    fetchRecruiterApplications,
    updateRecruiterApplicationStatus,
    fetchCandidates,
    fetchCandidateById,
    searchCandidates,
    contactCandidate,
    fetchSavedJobs,
    saveJob,
    unsaveJob,
    toggleSavedProfile,
    isProfileSaved,
    clearProfileState,
  }
})
