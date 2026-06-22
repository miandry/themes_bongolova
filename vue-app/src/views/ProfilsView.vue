<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Search, MapPin, Users2,
  Heart, LayoutGrid, List, Sparkles,
  Briefcase, ArrowUpRight, ChevronDown
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useUserStore } from '@/stores/user/user.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'
import { asList, personInitials } from '@/utils/apiData'

const PER_PAGE = 12

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const taxonomyStore = useTaxonomyStore()
const {
  candidates,
  candidatesLoading,
  savedProfileIds,
  candidatesTotal,
  candidatesCurrentPage,
  candidatesLastPage,
} = storeToRefs(userStore)
const { locations } = storeToRefs(taxonomyStore)

const searchQuery = ref('')
const selectedLocation = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let syncingFromRoute = false
let ignoreNextRouteWatch = false

function readFiltersFromRoute() {
  const q = route.query
  searchQuery.value = typeof q.keyword === 'string' ? q.keyword : ''
  selectedLocation.value = typeof q.location === 'string' ? q.location : ''
  currentPage.value = Math.max(1, Number(q.page) || 1)
}

function buildRouteQuery() {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.keyword = searchQuery.value.trim()
  if (selectedLocation.value) query.location = selectedLocation.value
  if (currentPage.value > 1) query.page = String(currentPage.value)
  return query
}

function syncRoute() {
  ignoreNextRouteWatch = true
  router.replace({ path: '/profils', query: buildRouteQuery() })
}

async function loadCandidates() {
  try {
    await userStore.searchCandidates({
      keyword: searchQuery.value.trim() || undefined,
      location: selectedLocation.value || undefined,
      page: currentPage.value,
      per_page: PER_PAGE,
    })
  } catch { /* handled in store */ }
}

function applyFilters(resetPage = true) {
  if (resetPage) currentPage.value = 1
  syncRoute()
  loadCandidates()
}

// ✅ Fonction pour obtenir l'URL complète de la photo
function getPhotoUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath) return null

  // Sinon on construit le chemin complet
  return `/sites/bongolava/files/bongolava_job/${photoPath}`
}

onMounted(async () => {
  try {
    await taxonomyStore.loadMultiple(['location'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }
  syncingFromRoute = true
  readFiltersFromRoute()
  syncingFromRoute = false
  await loadCandidates()
})

watch([searchQuery, selectedLocation], () => {
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
  loadCandidates()
})

function onPageChange(page: number) {
  currentPage.value = page
  syncRoute()
  loadCandidates()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetFilters() {
  searchQuery.value = ''
  selectedLocation.value = ''
  applyFilters(true)
}

const getInitials = (c: { first_name?: string; last_name?: string }) =>
  personInitials(c.first_name, c.last_name)

const skillPreview = (c: { skills?: unknown }) => asList(c.skills).slice(0, 3)

const toggleSave = (id: number) => userStore.toggleSavedProfile(id)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- En-tête premium -->
    <section class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 pt-20 pb-16 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <Sparkles :size="14" class="text-yellow-300" />
          <span class="text-white text-[10px] font-bold uppercase tracking-wider">Annuaire des talents</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Les <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">talents</span> de la région
        </h1>

        <!-- Barre de recherche -->
        <div class="mt-8 max-w-3xl mx-auto">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">
            <div class="flex-grow flex items-center px-5 py-3">
              <Search class="text-blue-600 mr-3 shrink-0" :size="20" />
              <input v-model="searchQuery" type="text" placeholder="Nom, métier ou compétence..." class="w-full bg-transparent outline-none text-gray-800" />
            </div>
            <div class="flex items-center px-5 py-3 border-t sm:border-t-0 sm:border-l border-gray-100 relative min-w-[180px]">
              <MapPin class="text-green-500 mr-3 shrink-0" :size="20" />
              <select v-model="selectedLocation" class="bg-transparent outline-none text-gray-800 w-full appearance-none cursor-pointer pr-6">
                <option value="">Toutes les villes</option>
                <option v-for="l in locations" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
              <ChevronDown :size="16" class="absolute right-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Barre de contrôle -->
      <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div class="flex gap-2">
          <button @click="viewMode = 'grid'" :class="`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`"><LayoutGrid :size="18" /></button>
          <button @click="viewMode = 'list'" :class="`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`"><List :size="18" /></button>
        </div>
        <p class="text-gray-500 text-sm">{{ candidatesTotal }} talent{{ candidatesTotal > 1 ? 's' : '' }} trouvé{{ candidatesTotal > 1 ? 's' : '' }}</p>
      </div>

      <!-- Skeletons -->
      <div v-if="candidatesLoading" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'">
        <SkeletonCard v-for="n in 8" :key="n" :avatar="true" :lines="2" />
      </div>

      <div v-else-if="candidates.length === 0" class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <Users2 :size="40" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-1">Aucun talent trouvé</h3>
        <p class="text-gray-500">Modifiez vos critères de recherche.</p>
        <button @click="resetFilters" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm">Réinitialiser</button>
      </div>

      <!-- Grille / Liste -->
      <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'">
        <div v-for="c in candidates" :key="c.id" class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all group p-6">
          <!-- Contenu Grid -->
          <div v-if="viewMode === 'grid'" class="text-center">
            <div class="relative inline-block mb-4">
              <!-- ✅ Affichage de la photo si elle existe, sinon les initiales -->
              <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                <img 
                  v-if="c.photo_path" 
                  :src="getPhotoUrl(c.photo_path)" 
                  :alt="`${c.first_name} ${c.last_name}`" 
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ getInitials(c) }}</span>
              </div>
            </div>
            <button @click="toggleSave(c.id)" class="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-50 transition">
              <Heart :size="16" :class="savedProfileIds.includes(c.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'" />
            </button>
            <h3 class="text-lg font-bold text-gray-900">{{ c.first_name }} {{ c.last_name }}</h3>
            <p class="text-blue-600 text-sm font-medium mb-2">{{ c.job_target }}</p>
            <div class="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
              <MapPin :size="12" class="text-purple-500" /> {{ c.location }}
            </div>
            <!-- <div class="flex flex-wrap justify-center gap-1 mb-4">
              <span v-for="skill in skillPreview(c)" :key="skill" class="px-2 py-0.5 bg-gray-100 rounded-full text-[9px] text-gray-600">{{ skill }}</span>
            </div> -->
            <RouterLink :to="`/profils/${c.id}`" class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition flex items-center justify-center gap-1">
              Voir le profil <ArrowUpRight :size="12" />
            </RouterLink>
          </div>

          <!-- Contenu Liste -->
          <div v-else class="flex flex-col sm:flex-row items-center gap-4">
            <!-- ✅ Affichage de la photo si elle existe, sinon les initiales -->
            <div class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-md">
              <img 
                v-if="c.photo_path" 
                :src="getPhotoUrl(c.photo_path)" 
                :alt="`${c.first_name} ${c.last_name}`" 
                class="w-full h-full object-cover"
              />
              <span v-else>{{ getInitials(c) }}</span>
            </div>
            <div class="flex-grow text-center sm:text-left">
              <h3 class="text-lg font-bold text-gray-900">{{ c.first_name }} {{ c.last_name }}</h3>
              <p class="text-blue-600 text-sm font-medium">{{ c.job_target }}</p>
              <div class="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1"><MapPin :size="12" class="text-purple-500" /> {{ c.location }}</span>
                <span class="flex items-center gap-1"><Briefcase :size="12" class="text-purple-500" /> {{ c.experience }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleSave(c.id)" class="p-2 rounded-full hover:bg-red-50 transition hidden">
                <Heart :size="16" :class="savedProfileIds.includes(c.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'" />
              </button>
              <RouterLink :to="`/profils/${c.id}`" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-md transition">
                Voir le profil
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        v-if="!candidatesLoading && candidates.length > 0"
        :current-page="candidatesCurrentPage"
        :last-page="candidatesLastPage"
        :total="candidatesTotal"
        @update:current-page="onPageChange"
      />
    </main>
    <Footer />
  </div>
</template>