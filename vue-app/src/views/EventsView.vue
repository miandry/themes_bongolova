<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Calendar, MapPin, Clock, ArrowRight,
  Search, Filter, Users2
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { apiGet } from '@/composables/api'

// --- Filtres ---
const searchQuery = ref('')
const selectedType = ref('')

const eventTypes = ['Salon', 'Atelier', 'Conférence', 'Formation']

const events = ref([])
const apiLoading = ref(false)

async function loadEvents() {
  apiLoading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.set('search', searchQuery.value)
    if (selectedType.value) params.set('type', selectedType.value)
    const data = await apiGet('bongolava_job/events?' + params.toString())
    events.value = Array.isArray(data) ? data : []
  } catch { events.value = [] }
  finally { apiLoading.value = false }
}

onMounted(loadEvents)
watch([searchQuery, selectedType], loadEvents)

// --- Utilitaires ---
const parseEventDate = (event) => new Date(event.date + 'T' + (event.time ?? '00:00'))
const parseEventEndDate = (event) => new Date((event.end_date ?? event.date) + 'T' + (event.end_time ?? event.time ?? '00:00'))

const formatDate = (event) => {
  return parseEventDate(event).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateObj) => {
  if (dateObj instanceof Date) {
    return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return ''
}

const getMonthShort = (event) => {
  return parseEventDate(event).toLocaleString('fr', { month: 'short' }).toUpperCase()
}

const getDay = (event) => parseEventDate(event).getDate()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <!-- En-tête -->
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Événements</h1>
          <p class="text-gray-500 mt-2">{{ events.length }} événement{{ events.length > 1 ? 's' : '' }} à venir</p>
        </div>

        <!-- Barre de recherche + Filtres -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-4 mb-8">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 flex items-center px-3 py-2 bg-gray-100 rounded-lg">
              <Search :size="18" class="text-gray-400 mr-2" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Rechercher un événement..." 
                class="bg-transparent outline-none w-full text-gray-800 placeholder:text-gray-400 text-sm"
              />
            </div>
            <div class="flex flex-wrap gap-2">
              <select v-model="selectedType" class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous types</option>
                <option v-for="type in eventTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <!-- Skeletons -->
        <div v-if="apiLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="n in 6" :key="n" :lines="3" />
        </div>

        <div v-else-if="events.length === 0" class="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar :size="32" class="text-gray-300" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p class="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>

        <!-- Grille des événements -->
        <div v-else-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="event in events" :key="event.id" class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
            <div class="p-5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <span class="text-xl font-bold">{{ getDay(event) }}</span>
                  <span class="text-[9px] font-bold uppercase">{{ getMonthShort(event) }}</span>
                </div>
                <div>
                  <span class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">{{ event.type }}</span>
                  <h3 class="font-bold text-gray-900 line-clamp-1 mt-1 group-hover:text-orange-600 transition text-base">{{ event.title }}</h3>
                </div>
              </div>
              <div class="space-y-1.5 text-xs text-gray-500 mb-3">
                <p class="flex items-center gap-1"><MapPin :size="12" class="text-orange-500" /> {{ event.location }}</p>
                <p class="flex items-center gap-1"><Clock :size="12" class="text-orange-500" /> {{ formatTime(parseEventDate(event)) }} - {{ formatTime(parseEventEndDate(event)) }}</p>
                <p class="flex items-center gap-1"><Users2 :size="12" class="text-orange-500" /> {{ event.registered }} / {{ event.capacity }} inscrits</p>
              </div>
              <p class="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">{{ event.description }}</p>
              <RouterLink :to="`/evenements/${event.id}`" class="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1">
                S'inscrire
                <ArrowRight :size="12" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>