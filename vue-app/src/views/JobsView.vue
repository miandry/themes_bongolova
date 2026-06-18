<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import {
  Search, MapPin, Building2,
  Heart, Zap, ChevronDown, LayoutGrid, List,
  Eye, Loader2
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import Pagination from '../components/Pagination.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'

const PER_PAGE = 12

const route = useRoute()
const router = useRouter()
const nodeStore = useNodeStore()
const taxonomyStore = useTaxonomyStore()
const { jobs, jobsLoading, jobsError, jobsTotal, jobsCurrentPage, jobsLastPage } = storeToRefs(nodeStore)
const { sectors, contractTypes, locations } = storeToRefs(taxonomyStore)

const searchQuery = ref('')
const selectedSector = ref('')
const selectedType = ref('')
const selectedLocation = ref('')
const sortBy = ref('pertinence')
const viewMode = ref('grid')
const currentPage = ref(1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let syncingFromRoute = false
let ignoreNextRouteWatch = false

function readFiltersFromRoute() {
  const q = route.query
  searchQuery.value = typeof q.keyword === 'string' ? q.keyword : ''
  selectedSector.value = typeof q.sector === 'string' ? q.sector : ''
  selectedType.value = typeof q.contract_type === 'string' ? q.contract_type : ''
  selectedLocation.value = typeof q.location === 'string' ? q.location : ''
  currentPage.value = Math.max(1, Number(q.page) || 1)
}

function buildRouteQuery() {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.keyword = searchQuery.value.trim()
  if (selectedSector.value) query.sector = selectedSector.value
  if (selectedType.value) query.contract_type = selectedType.value
  if (selectedLocation.value) query.location = selectedLocation.value
  if (currentPage.value > 1) query.page = String(currentPage.value)
  return query
}

function syncRoute() {
  ignoreNextRouteWatch = true
  router.replace({ path: '/jobs', query: buildRouteQuery() })
}

async function loadJobs() {
  try {
    await nodeStore.searchJobs({
      keyword: searchQuery.value.trim() || undefined,
      sector: selectedSector.value || undefined,
      contract_type: selectedType.value || undefined,
      location: selectedLocation.value || undefined,
      sort: sortBy.value === 'recent' ? 'recent' : undefined,
      page: currentPage.value,
      per_page: PER_PAGE,
    })
  } catch { /* error in store */ }
}

function applyFilters(resetPage = true) {
  if (resetPage) currentPage.value = 1
  syncRoute()
  loadJobs()
}

onMounted(async () => {
  try {
    await taxonomyStore.loadMultiple(['sector', 'contract_type', 'location'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }
  syncingFromRoute = true
  readFiltersFromRoute()
  syncingFromRoute = false
  await loadJobs()
})

watch([searchQuery, selectedSector, selectedType, selectedLocation, sortBy], () => {
  if (syncingFromRoute) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => applyFilters(true), 350)
})

watch(() => route.query, () => {
  if (ignoreNextRouteWatch) {
    ignoreNextRouteWatch = false
    return
  }
  syncingFromRoute = true
  readFiltersFromRoute()
  syncingFromRoute = false
  loadJobs()
})

function onPageChange(page: number) {
  currentPage.value = page
  syncRoute()
  loadJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetFilters() {
  searchQuery.value = ''
  selectedSector.value = ''
  selectedType.value = ''
  selectedLocation.value = ''
  sortBy.value = 'pertinence'
  applyFilters(true)
}

const formatSalary = (job: { salary?: string | number }) => {
  if (!job.salary) return ''

  // Convertir en string si c'est un nombre
  const salaryStr = String(job.salary)

  // Nettoyer la chaîne (enlever les espaces)
  const cleaned = salaryStr.replace(/\s/g, '')

  // Vérifier si c'est un nombre valide
  const num = Number(cleaned)
  if (isNaN(num)) return salaryStr

  // Formater avec des espaces tous les 3 chiffres
  return num.toLocaleString('fr-FR')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Header />

    <main class="flex-grow pt-20 pb-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">

        <!-- EN-TÊTE -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Découvrez les <span class="text-blue-600">meilleures offres</span>
            </h1>
            <p class="text-gray-500 text-lg mt-1 flex items-center gap-2">
              {{ jobsTotal }} offre{{ jobsTotal > 1 ? 's' : '' }} trouvée{{ jobsTotal > 1 ? 's' : '' }}
            </p>
          </div>
          <div
            class="flex items-center gap-3 text-sm font-medium bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hidden">
            <span class="text-gray-500 shrink-0">Trier par :</span>
            <div class="relative min-w-[140px]">
              <select v-model="sortBy"
                class="w-full appearance-none bg-transparent pl-3 pr-8 py-1 outline-none text-gray-700 font-semibold cursor-pointer focus:ring-2 focus:ring-blue-200 rounded">
                <option value="pertinence">Pertinence</option>
                <option value="recent">Plus récent</option>
                <option value="salary">Meilleur salaire</option>
              </select>
              <ChevronDown class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                :size="16" />
            </div>
          </div>
        </div>

        <!-- BARRE DE RECHERCHE + FILTRES -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-10">
          <div class="flex flex-col lg:flex-row gap-3">
            <div class="flex-1 relative">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher un titre, un mot-clé..."
                class="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 placeholder:text-gray-400" />
            </div>
            <div class="flex flex-wrap gap-2">
              <div class="relative min-w-[140px]">
                <select v-model="selectedSector"
                  class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                  <option value="">Tous secteurs</option>
                  <option v-for="s in sectors" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  :size="18" />
              </div>
              <div class="relative min-w-[120px]">
                <select v-model="selectedType"
                  class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                  <option value="">Tous types</option>
                  <option v-for="t in contractTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  :size="18" />
              </div>
              <div class="relative min-w-[140px]">
                <select v-model="selectedLocation"
                  class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                  <option value="">Toutes villes</option>
                  <option v-for="l in locations" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  :size="18" />
              </div>
            </div>
          </div>
        </div>

        <!-- TOGGLE GRID / LISTE -->
        <div class="flex justify-end mb-6">
          <div class="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button @click="viewMode = 'grid'"
              :class="`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`">
              <LayoutGrid :size="18" />
            </button>
            <button @click="viewMode = 'list'"
              :class="`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`">
              <List :size="18" />
            </button>
          </div>
        </div>

        <!-- RÉSULTATS -->
        <!-- Loading -->
        <div v-if="jobsLoading" class="flex justify-center items-center py-24">
          <Loader2 :size="36" class="animate-spin text-blue-500" />
        </div>

        <!-- Error -->
        <div v-else-if="jobsError" class="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
          <p class="text-red-500 font-semibold">{{ jobsError }}</p>
          <button @click="loadJobs"
            class="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Réessayer</button>
        </div>

        <!-- Empty -->
        <div v-else-if="jobs.length === 0"
          class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search :size="32" class="text-gray-300" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-1">Aucune offre trouvée</h3>
          <p class="text-gray-500">Essayez d'ajuster vos filtres.</p>
          <button @click="resetFilters"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            Réinitialiser tout
          </button>
        </div>

        <!-- MODE GRILLE -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="job in jobs" :key="job.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div class="p-5 flex flex-col flex-grow">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex gap-1.5 flex-wrap">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide">{{
                    job.contract_type ?? job.type }}</span>
                  <span v-if="job.is_urgent ?? job.urgent"
                    class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                    <Zap :size="12" class="fill-current" /> Urgent
                  </span>
                  <span v-if="job.is_remote ?? job.remote"
                    class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide">À distance</span>
                </div>
                <button class="p-1.5 rounded-full hover:bg-red-50 transition-all">
                  <Heart :size="18" class="text-gray-300 hover:text-red-400 transition-colors" />
                </button>
              </div>
              <div class="flex-grow">
                <RouterLink :to="`/jobs/${job.id}`" class="block">
                  <h3
                    class="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {{ job.title }}</h3>
                </RouterLink>
                <p class="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <Building2 :size="14" class="text-gray-400 shrink-0" />
                  <span class="truncate">{{ job.company }}</span>
                </p>
              </div>
              <div class="flex items-center justify-between border-t border-gray-100/60 pt-3 mt-3">
                <div class="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin :size="14" class="text-green-500 shrink-0" />
                  <span class="truncate">{{ job.location }}</span>
                </div>
                <div class="text-green-600 font-bold text-sm shrink-0 ml-2">
                  {{ formatSalary(job) }} Ar
                </div>
              </div>
              <div class="mt-4 pt-2">
                <RouterLink :to="`/jobs/${job.id}`"
                  class="flex items-center justify-center w-full py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all hover:translate-y-[-2px]">
                  <Eye :size="16" class="mr-1" /> Voir détail
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- MODE LISTE -->
        <div v-else class="space-y-4">
          <div v-for="job in jobs" :key="job.id"
            class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-4">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 :size="24" class="text-gray-400" />
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <RouterLink :to="`/jobs/${job.id}`">
                      <h3 class="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-1">{{ job.title }}</h3>
                    </RouterLink>
                    <p class="text-gray-500 text-sm">{{ job.company }}</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide">{{
                        job.contract_type ?? job.type }}</span>
                    <span v-if="job.is_urgent ?? job.urgent"
                      class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                      <Zap :size="10" class="fill-current" /> Urgent
                    </span>
                    <span v-if="job.is_remote ?? job.remote"
                      class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide">À distance</span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-500 text-xs">
                  <span class="flex items-center gap-1">
                    <MapPin :size="12" class="text-green-500" /> {{ job.location }}
                  </span>
                  <span class="font-bold text-green-600">
                    {{ formatSalary(job) }} Ar
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <button class="p-2 rounded-full hover:bg-gray-100 transition">
                  <Heart :size="18" class="text-gray-300 hover:text-red-400 transition-colors" />
                </button>
                <RouterLink :to="`/jobs/${job.id}`"
                  class="px-5 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all hover:translate-y-[-1px] flex items-center gap-1">
                  <Eye :size="14" /> Voir détail
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          v-if="!jobsLoading && !jobsError && jobs.length > 0"
          :current-page="jobsCurrentPage"
          :last-page="jobsLastPage"
          :total="jobsTotal"
          @update:current-page="onPageChange"
        />

      </div>
    </main>

    <Footer />
  </div>
</template>