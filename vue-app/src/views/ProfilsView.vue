<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Search, MapPin, Users2, CheckCircle2, ArrowUpRight,
  Heart, LayoutGrid, List, Sparkles, Clock,
  Briefcase, Filter, ChevronDown, X
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { apiGet } from '@/composables/api'
import { asList, personInitials } from '@/utils/apiData'

// --- Filtres et états ---
const searchQuery = ref('')
const selectedLocation = ref('all')
const viewMode = ref('grid')
const savedProfiles = ref([])

const locations = ['Tsiroanomandidy', 'Maintirano', 'Bongolava', 'Télé-travail']

const candidates = ref([])
const apiLoading = ref(false)

async function loadCandidates() {
  apiLoading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.set('keyword', searchQuery.value)
    if (selectedLocation.value && selectedLocation.value !== 'all') params.set('location', selectedLocation.value)
    const data = await apiGet('bongolava_job/candidates?' + params.toString())
    candidates.value = Array.isArray(data) ? data : ((data as { data?: unknown[] }).data ?? [])
  } catch { candidates.value = [] }
  finally { apiLoading.value = false }
}

onMounted(() => loadCandidates())
watch([searchQuery, selectedLocation], () => loadCandidates())

const getInitials = (c: { first_name?: string; last_name?: string }) =>
  personInitials(c.first_name, c.last_name)

const skillPreview = (c: { skills?: unknown }) => asList(c.skills).slice(0, 3)

// --- Favoris ---
const toggleSave = (id) => {
  const i = savedProfiles.value.indexOf(id)
  i > -1 ? savedProfiles.value.splice(i, 1) : savedProfiles.value.push(id)
}
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
            <div class="flex items-center px-5 py-3 border-t sm:border-t-0 sm:border-l border-gray-100">
              <MapPin class="text-green-500 mr-3 shrink-0" :size="20" />
              <select v-model="selectedLocation" class="bg-transparent outline-none text-gray-800">
                <option value="all">Toutes les villes</option>
                <option v-for="l in locations" :key="l" :value="l">{{ l }}</option>
              </select>
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
        <p class="text-gray-500 text-sm">{{ candidates.length }} talent{{ candidates.length > 1 ? 's' : '' }} trouvé{{ candidates.length > 1 ? 's' : '' }}</p>
      </div>

      <!-- Skeletons -->
      <div v-if="apiLoading" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'">
        <SkeletonCard v-for="n in 8" :key="n" :avatar="true" :lines="2" />
      </div>

      <div v-else-if="candidates.length === 0" class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
        <Users2 :size="40" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-1">Aucun talent trouvé</h3>
        <p class="text-gray-500">Modifiez vos critères de recherche.</p>
        <button @click="searchQuery = ''; selectedLocation = 'all'" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm">Réinitialiser</button>
      </div>

      <!-- Grille / Liste -->
      <div v-else :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'">
        <div v-for="c in candidates" :key="c.id" class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all group p-6">
          <!-- Contenu Grid -->
          <div v-if="viewMode === 'grid'" class="text-center">
            <div class="relative inline-block mb-4">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {{ getInitials(c) }}
              </div>
            </div>
            <button @click="toggleSave(c.id)" class="absolute top-3 right-3 p-1.5 rounded-full hover:bg-red-50 transition">
              <Heart :size="16" :class="savedProfiles.includes(c.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'" />
            </button>
            <h3 class="text-lg font-bold text-gray-900">{{ c.first_name }} {{ c.last_name }}</h3>
            <p class="text-blue-600 text-sm font-medium mb-2">{{ c.job_target }}</p>
            <div class="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
              <MapPin :size="12" class="text-purple-500" /> {{ c.location }}
            </div>
            <div class="flex flex-wrap justify-center gap-1 mb-4">
              <span v-for="skill in skillPreview(c)" :key="skill" class="px-2 py-0.5 bg-gray-100 rounded-full text-[9px] text-gray-600">{{ skill }}</span>
            </div>
            <RouterLink :to="`/profils/${c.id}`" class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition flex items-center justify-center gap-1">
              Voir le profil <ArrowUpRight :size="12" />
            </RouterLink>
          </div>

          <!-- Contenu Liste -->
          <div v-else class="flex flex-col sm:flex-row items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {{ getInitials(c) }}
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
              <button @click="toggleSave(c.id)" class="p-2 rounded-full hover:bg-red-50 transition">
                <Heart :size="16" :class="savedProfiles.includes(c.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'" />
              </button>
              <RouterLink :to="`/profils/${c.id}`" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-md transition">
                Voir le profil
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>