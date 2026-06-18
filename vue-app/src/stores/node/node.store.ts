import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Job,
  Event,
  ContentType,
  JobSearchFilters,
  EventSearchFilters,
  PaginatedResponse,
} from '@/types/entities'
import { API_ROUTES, CONTENT_TYPE_ROUTES } from '@/services/api-urls'
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPostForm,
  toQueryString,
  normalizeList,
  normalizePaginatedList,
} from '@/services/api.service'

const CACHE_TTL_MS = 60_000

interface CacheEntry<T> {
  data: T
  fetchedAt: number
}

export const useNodeStore = defineStore('node', () => {
  // ── Jobs ──────────────────────────────────────────────────────────────────
  const jobs = ref<Job[]>([])
  const job = ref<Job | null>(null)
  const jobsLoading = ref(false)
  const jobLoading = ref(false)
  const jobsError = ref<string | null>(null)
  const jobError = ref<string | null>(null)
  const jobsSuccess = ref(false)
  const jobSuccess = ref(false)

  const jobsTotal = ref(0)
  const jobsCurrentPage = ref(1)
  const jobsLastPage = ref(1)
  const jobsPerPage = ref(12)

  // ── Events ────────────────────────────────────────────────────────────────
  const events = ref<Event[]>([])
  const event = ref<Event | null>(null)
  const eventsLoading = ref(false)
  const eventLoading = ref(false)
  const eventsError = ref<string | null>(null)
  const eventError = ref<string | null>(null)

  // ── Contact ───────────────────────────────────────────────────────────────
  const contactLoading = ref(false)
  const contactError = ref<string | null>(null)
  const contactSuccess = ref(false)

  // ── Cache ─────────────────────────────────────────────────────────────────
  const listCache = new Map<string, CacheEntry<Job[] | Event[]>>()
  const detailCache = new Map<string, CacheEntry<Job | Event>>()

  const publishedJobs = computed(() =>
    jobs.value.filter((j) => !j.status || j.status === 'approved' || j.status === 'published'),
  )

  const featuredJobs = computed(() => publishedJobs.value.slice(0, 4))

  const upcomingEvents = computed(() =>
    [...events.value].sort((a, b) => String(a.date).localeCompare(String(b.date))),
  )

  function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false
    return Date.now() - entry.fetchedAt < CACHE_TTL_MS
  }

  function cacheKey(type: ContentType, suffix = ''): string {
    return `${type}${suffix}`
  }

  // ── Jobs CRUD ─────────────────────────────────────────────────────────────
  async function fetchJobs(filters: JobSearchFilters = {}, useCache = true) {
    const key = cacheKey('job', toQueryString(filters as Record<string, string>))
    const cached = listCache.get(key) as CacheEntry<Job[]> | undefined
    if (useCache && isCacheValid(cached)) {
      jobs.value = cached!.data
      return jobs.value
    }

    jobsLoading.value = true
    jobsError.value = null
    jobsSuccess.value = false
    try {
      const path = API_ROUTES.jobs + toQueryString({
        keyword: filters.keyword,
        sector: filters.sector,
        contract_type: filters.contract_type,
        location: filters.location,
        sort: filters.sort,
        per_page: filters.per_page,
        page: filters.page,
      })
      const data = await apiGet<Job[] | PaginatedResponse<Job>>(path)
      const { items, meta } = normalizePaginatedList(data)
      jobs.value = items
      if (meta) {
        jobsTotal.value = meta.total
        jobsCurrentPage.value = meta.current_page
        jobsLastPage.value = meta.last_page
        jobsPerPage.value = meta.per_page
      }
      else {
        jobsTotal.value = items.length
        jobsCurrentPage.value = 1
        jobsLastPage.value = 1
        jobsPerPage.value = items.length
      }
      listCache.set(key, { data: jobs.value, fetchedAt: Date.now() })
      jobsSuccess.value = true
      return jobs.value
    }
    catch (e) {
      jobsError.value = e instanceof Error ? e.message : 'Impossible de charger les offres.'
      jobs.value = []
      throw e
    }
    finally {
      jobsLoading.value = false
    }
  }

  async function fetchFeaturedJobs() {
    return fetchJobs({ per_page: 4 })
  }

  async function fetchJobById(id: number | string, useCache = true) {
    const key = cacheKey('job', `:${id}`)
    const cached = detailCache.get(key) as CacheEntry<Job> | undefined
    if (useCache && isCacheValid(cached)) {
      job.value = cached!.data
      return job.value
    }

    jobLoading.value = true
    jobError.value = null
    jobSuccess.value = false
    try {
      const data = await apiGet<Job>(API_ROUTES.job(id))
      if (!data?.id) {
        jobError.value = 'Offre introuvable.'
        job.value = null
        return null
      }
      job.value = data
      detailCache.set(key, { data, fetchedAt: Date.now() })
      jobSuccess.value = true
      return job.value
    }
    catch {
      jobError.value = 'Offre introuvable.'
      job.value = null
      return null
    }
    finally {
      jobLoading.value = false
    }
  }

  async function searchJobs(filters: JobSearchFilters) {
    return fetchJobs(filters, false)
  }

  async function createJob(payload: Partial<Job>) {
    jobsLoading.value = true
    jobsError.value = null
    try {
      const created = await apiPost<Job>(API_ROUTES.jobs, payload)
      listCache.clear()
      return created
    }
    catch (e) {
      jobsError.value = e instanceof Error ? e.message : 'Erreur création offre.'
      throw e
    }
    finally {
      jobsLoading.value = false
    }
  }

  async function updateJob(id: number | string, payload: Partial<Job>) {
    jobLoading.value = true
    jobError.value = null
    try {
      const updated = await apiPut<Job>(API_ROUTES.job(id), payload)
      job.value = updated
      detailCache.delete(cacheKey('job', `:${id}`))
      listCache.clear()
      return updated
    }
    catch (e) {
      jobError.value = e instanceof Error ? e.message : 'Erreur mise à jour offre.'
      throw e
    }
    finally {
      jobLoading.value = false
    }
  }

  async function removeJob(id: number | string) {
    jobsLoading.value = true
    jobsError.value = null
    try {
      await apiDelete(API_ROUTES.job(id))
      jobs.value = jobs.value.filter((j) => j.id !== Number(id))
      if (job.value?.id === Number(id)) job.value = null
      detailCache.delete(cacheKey('job', `:${id}`))
      listCache.clear()
    }
    catch (e) {
      jobsError.value = e instanceof Error ? e.message : 'Erreur suppression offre.'
      throw e
    }
    finally {
      jobsLoading.value = false
    }
  }

  async function applyToJob(jobId: number | string, formData: FormData) {
    jobLoading.value = true
    jobError.value = null
    try {
      return await apiPostForm(API_ROUTES.jobApply(jobId), formData)
    }
    catch (e) {
      jobError.value = e instanceof Error ? e.message : 'Erreur lors de la candidature.'
      throw e
    }
    finally {
      jobLoading.value = false
    }
  }

  // ── Events CRUD ─────────────────────────────────────────────────────────────
  async function fetchEvents(filters: EventSearchFilters = {}, useCache = true) {
    const key = cacheKey('event', toQueryString(filters as Record<string, string>))
    const cached = listCache.get(key) as CacheEntry<Event[]> | undefined
    if (useCache && isCacheValid(cached)) {
      events.value = cached!.data
      return events.value
    }

    eventsLoading.value = true
    eventsError.value = null
    try {
      const path = API_ROUTES.events + toQueryString({
        search: filters.search,
        type: filters.type,
      })
      const data = await apiGet<Event[]>(path)
      events.value = normalizeList(data)
      listCache.set(key, { data: events.value, fetchedAt: Date.now() })
      return events.value
    }
    catch (e) {
      eventsError.value = e instanceof Error ? e.message : 'Impossible de charger les événements.'
      events.value = []
      throw e
    }
    finally {
      eventsLoading.value = false
    }
  }

  async function fetchEventById(id: number | string, useCache = true) {
    const key = cacheKey('event', `:${id}`)
    const cached = detailCache.get(key) as CacheEntry<Event> | undefined
    if (useCache && isCacheValid(cached)) {
      event.value = cached!.data
      return event.value
    }

    eventLoading.value = true
    eventError.value = null
    try {
      const data = await apiGet<Event>(API_ROUTES.event(id))
      if (!data?.id) {
        eventError.value = 'Événement introuvable.'
        event.value = null
        return null
      }
      event.value = data
      detailCache.set(key, { data, fetchedAt: Date.now() })
      return event.value
    }
    catch {
      eventError.value = 'Événement introuvable.'
      event.value = null
      return null
    }
    finally {
      eventLoading.value = false
    }
  }

  async function searchEvents(filters: EventSearchFilters) {
    return fetchEvents(filters, false)
  }

  async function registerEvent(
    id: number | string,
    payload: { name: string; email: string; phone: string },
  ) {
    eventLoading.value = true
    eventError.value = null
    try {
      const result = await apiPost(API_ROUTES.eventRegister(id), payload)
      detailCache.delete(cacheKey('event', `:${id}`))
      return result
    }
    catch (e) {
      eventError.value = e instanceof Error ? e.message : 'Erreur inscription.'
      throw e
    }
    finally {
      eventLoading.value = false
    }
  }

  async function createEvent(payload: Partial<Event>) {
    eventsLoading.value = true
    eventsError.value = null
    try {
      const created = await apiPost<Event>(API_ROUTES.events, payload)
      listCache.clear()
      return created
    }
    catch (e) {
      eventsError.value = e instanceof Error ? e.message : 'Erreur création événement.'
      throw e
    }
    finally {
      eventsLoading.value = false
    }
  }

  async function updateEvent(id: number | string, payload: Partial<Event>) {
    eventLoading.value = true
    eventError.value = null
    try {
      const updated = await apiPut<Event>(API_ROUTES.event(id), payload)
      event.value = updated
      detailCache.delete(cacheKey('event', `:${id}`))
      listCache.clear()
      return updated
    }
    catch (e) {
      eventError.value = e instanceof Error ? e.message : 'Erreur mise à jour événement.'
      throw e
    }
    finally {
      eventLoading.value = false
    }
  }

  async function removeEvent(id: number | string) {
    eventsLoading.value = true
    eventsError.value = null
    try {
      await apiDelete(API_ROUTES.event(id))
      events.value = events.value.filter((ev) => ev.id !== Number(id))
      if (event.value?.id === Number(id)) event.value = null
      detailCache.delete(cacheKey('event', `:${id}`))
      listCache.clear()
    }
    catch (e) {
      eventsError.value = e instanceof Error ? e.message : 'Erreur suppression événement.'
      throw e
    }
    finally {
      eventsLoading.value = false
    }
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  async function submitContact(payload: {
    name: string
    email: string
    subject?: string
    message: string
  }) {
    contactLoading.value = true
    contactError.value = null
    contactSuccess.value = false
    try {
      await apiPost(API_ROUTES.contact, payload)
      contactSuccess.value = true
    }
    catch (e) {
      contactError.value = e instanceof Error ? e.message : "Erreur lors de l'envoi."
      throw e
    }
    finally {
      contactLoading.value = false
    }
  }

  /** Generic fetch by content type (job | event). */
  async function fetchAll(type: ContentType, filters: JobSearchFilters | EventSearchFilters = {}) {
    if (type === 'job') return fetchJobs(filters as JobSearchFilters)
    if (type === 'event') return fetchEvents(filters as EventSearchFilters)
    throw new Error(`fetchAll not supported for type: ${type}`)
  }

  async function fetchById(type: 'job' | 'event', id: number | string) {
    if (type === 'job') return fetchJobById(id)
    return fetchEventById(id)
  }

  function invalidateCache(type?: ContentType) {
    if (!type) {
      listCache.clear()
      detailCache.clear()
      return
    }
    for (const key of listCache.keys()) {
      if (key.startsWith(type)) listCache.delete(key)
    }
    for (const key of detailCache.keys()) {
      if (key.startsWith(type)) detailCache.delete(key)
    }
  }

  return {
    jobs,
    job,
    jobsLoading,
    jobLoading,
    jobsError,
    jobError,
    jobsSuccess,
    jobSuccess,
    jobsTotal,
    jobsCurrentPage,
    jobsLastPage,
    jobsPerPage,
    events,
    event,
    eventsLoading,
    eventLoading,
    eventsError,
    eventError,
    contactLoading,
    contactError,
    contactSuccess,
    publishedJobs,
    featuredJobs,
    upcomingEvents,
    fetchJobs,
    fetchFeaturedJobs,
    fetchJobById,
    searchJobs,
    createJob,
    updateJob,
    removeJob,
    applyToJob,
    fetchEvents,
    fetchEventById,
    searchEvents,
    registerEvent,
    createEvent,
    updateEvent,
    removeEvent,
    submitContact,
    fetchAll,
    fetchById,
    invalidateCache,
    CONTENT_TYPE_ROUTES,
  }
})
