<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Calendar, MapPin, Clock, ArrowRight,
  Search, Users2, AlertCircle,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'

const PER_PAGE = 9

const route = useRoute()
const router = useRouter()
const nodeStore = useNodeStore()
const taxonomyStore = useTaxonomyStore()
const {
  events, eventsLoading, eventsError,
  eventsTotal, eventsCurrentPage, eventsLastPage,
} = storeToRefs(nodeStore)
const { eventTypes, locations } = storeToRefs(taxonomyStore)

const searchQuery = ref('')
const selectedType = ref('')
const selectedLocation = ref('')
const currentPage = ref(1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let syncingFromRoute = false
let ignoreNextRouteWatch = false

function readFiltersFromRoute() {
  const q = route.query
  searchQuery.value = typeof q.search === 'string' ? q.search : ''
  selectedType.value = typeof q.type === 'string' ? q.type : ''
  selectedLocation.value = typeof q.location === 'string' ? q.location : ''
  currentPage.value = Math.max(1, Number(q.page) || 1)
}

function buildRouteQuery() {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedType.value) query.type = selectedType.value
  if (selectedLocation.value) query.location = selectedLocation.value
  if (currentPage.value > 1) query.page = String(currentPage.value)
  return query
}

function syncRoute() {
  ignoreNextRouteWatch = true
  router.replace({ path: '/evenements', query: buildRouteQuery() })
}

async function loadEvents() {
  try {
    await nodeStore.searchEvents({
      search: searchQuery.value.trim() || undefined,
      type: selectedType.value || undefined,
      location: selectedLocation.value || undefined,
      status: 'published',
      page: currentPage.value,
      per_page: PER_PAGE,
    })
  } catch { /* handled in store */ }
}

function applyFilters(resetPage = true) {
  if (resetPage) currentPage.value = 1
  syncRoute()
  loadEvents()
}

onMounted(async () => {
  try {
    await taxonomyStore.loadMultiple(['event_type', 'location'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }
  syncingFromRoute = true
  readFiltersFromRoute()
  syncingFromRoute = false
  await loadEvents()
})

watch([searchQuery, selectedType, selectedLocation], () => {
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
  loadEvents()
})

function onPageChange(page: number) {
  currentPage.value = page
  syncRoute()
  loadEvents()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getMonthShort = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fr', { month: 'short' }).toUpperCase()
}

const getDay = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).getDate()
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Événements</h1>
          <p class="text-gray-500 mt-2">
            {{ eventsTotal }} événement{{ eventsTotal > 1 ? 's' : '' }} publié{{ eventsTotal > 1 ? 's' : '' }}
          </p>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-4 mb-8">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 flex items-center px-3 py-2 bg-gray-100 rounded-lg">
              <Search :size="18" class="text-gray-400 mr-2" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher un événement..."
                class="bg-transparent outline-none w-full text-gray-800 placeholder:text-gray-400 text-sm" />
            </div>
            <div class="flex flex-wrap gap-2">
              <select v-model="selectedType"
                class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous types</option>
                <option v-for="type in eventTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
              <select v-model="selectedLocation"
                class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous lieux</option>
                <option v-for="loc in locations" :key="loc.value" :value="loc.value">{{ loc.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="eventsError" class="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle :size="18" />
          {{ eventsError }}
        </div>

        <div v-if="eventsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="n in 9" :key="n" :lines="3" />
        </div>

        <div v-else-if="events.length === 0"
          class="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar :size="32" class="text-gray-300" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p class="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="event in events" :key="event.id"
            class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div class="p-5">
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                  <span class="text-xl font-bold">{{ getDay(event.date ?? '') }}</span>
                  <span class="text-[9px] font-bold uppercase">{{ getMonthShort(event.date ?? '') }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                    {{ event.type || 'Événement' }}
                  </span>
                  <h3 class="font-bold text-gray-900 line-clamp-1 mt-1 group-hover:text-orange-600 transition text-base">
                    {{ event.title }}
                  </h3>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-gray-500 mb-3">
                <p class="flex items-center gap-1">
                  <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
                  <span class="truncate">{{ event.location || 'Lieu non spécifié' }}</span>
                </p>
                <p class="flex items-center gap-1">
                  <Clock :size="12" class="text-orange-500 flex-shrink-0" />
                  {{ formatDate(event.date ?? '') }}<template v-if="event.horaires"> - {{ event.horaires }}</template>
                </p>
                <p class="flex items-center gap-1">
                  <Users2 :size="12" class="text-orange-500 flex-shrink-0" />
                  {{ event.registered || 0 }} / {{ event.capacity || 0 }} inscrits
                </p>
              </div>

              <p class="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed" v-html="event.description"></p>

              <RouterLink :to="`/evenements/${event.id}`"
                class="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1">
                S'inscrire
                <ArrowRight :size="12" />
              </RouterLink>
            </div>
          </div>
        </div>

        <Pagination
          :current-page="eventsCurrentPage"
          :last-page="eventsLastPage"
          :total="eventsTotal"
          @update:current-page="onPageChange"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>
