import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet } from '@/services/api.service'
import { API_ROUTES } from '@/services/api-urls'

export interface TaxonomyTerm {
  value: string
  label: string
  id?: number
  count?: number
}

export interface TaxonomyState {
  [key: string]: TaxonomyTerm[] // e.g., 'sector': [...]
}

export const useTaxonomyStore = defineStore('taxonomy', () => {
  // ── State ───────────────────────────────────────────────────────────────────
  const vocabularies = ref<TaxonomyState>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref<Set<string>>(new Set())

  // ── Computed ────────────────────────────────────────────────────────────────
  const sectors = computed(() => vocabularies.value.sector ?? [])
  const contractTypes = computed(() => vocabularies.value.contract_type ?? [])
  const locations = computed(() => vocabularies.value.location ?? [])
  const eventTypes = computed(() => vocabularies.value.event_type ?? [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  /**
   * Ensure a vocabulary is loaded from the API.
   * Uses local cache to avoid duplicate API calls.
   */
  async function ensureVocabularyLoaded(key: string): Promise<void> {
    if (loaded.value.has(key)) {
      return // Already loaded
    }

    loading.value = true
    error.value = null
    try {
      const data = await apiGet<TaxonomyTerm[]>(`bongolava_job/taxonomies/${key}`, false)
      if (Array.isArray(data)) {
        vocabularies.value[key] = data
        loaded.value.add(key)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabularies'
      console.error('[taxonomy] Failed to load vocabulary:', key, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load multiple vocabularies at once via batch endpoint.
   */
  async function loadMultiple(keys: string[]): Promise<void> {
    // Filter out already loaded vocabularies
    const toLoad = keys.filter((k) => !loaded.value.has(k))
    if (toLoad.length === 0) {
      return
    }

    loading.value = true
    error.value = null
    try {
      const queryParam = toLoad.join(',')
      const data = await apiGet<TaxonomyState>(
        `bongolava_job/taxonomies/batch?vocabularies=${encodeURIComponent(queryParam)}`,
        false,
      )
      if (data && typeof data === 'object') {
        Object.assign(vocabularies.value, data)
        toLoad.forEach((k) => loaded.value.add(k))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabularies'
      console.error('[taxonomy] Failed to load multiple vocabularies:', toLoad, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get terms for a vocabulary by key.
   * Auto-loads from API if not yet cached.
   */
  async function getTerms(key: string): Promise<TaxonomyTerm[]> {
    await ensureVocabularyLoaded(key)
    return vocabularies.value[key] ?? []
  }

  /**
   * Get label for a specific term value.
   */
  function getLabel(vocabulary: string, value: string): string {
    const terms = vocabularies.value[vocabulary] ?? []
    const term = terms.find((t) => t.value === value)
    return term?.label ?? value
  }

  /**
   * Check if a vocabulary is loaded.
   */
  function isLoaded(key: string): boolean {
    return loaded.value.has(key)
  }

  /**
   * Preload all standard vocabularies on app initialization.
   */
  async function preloadAll(): Promise<void> {
    await loadMultiple(['sector', 'contract_type', 'location', 'event_type'])
  }

  /**
   * Clear all cached data and loaded flags.
   */
  function reset(): void {
    vocabularies.value = {}
    loaded.value.clear()
    error.value = null
  }

  return {
    // State
    vocabularies,
    loading,
    error,
    loaded,

    // Computed
    sectors,
    contractTypes,
    locations,
    eventTypes,

    // Methods
    ensureVocabularyLoaded,
    loadMultiple,
    getTerms,
    getLabel,
    isLoaded,
    preloadAll,
    reset,
  }
})
