<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Calendar, MapPin, Clock, ArrowRight,
  Search, Users2
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'

const nodeStore = useNodeStore()
const taxonomyStore = useTaxonomyStore()
const { events, eventsLoading } = storeToRefs(nodeStore)
const { eventTypes } = storeToRefs(taxonomyStore)

const searchQuery = ref('')
const selectedType = ref('')

async function loadEvents() {
  try {
    await nodeStore.searchEvents({
      search: searchQuery.value || undefined,
      type: selectedType.value || undefined,
    })
  } catch { /* handled in store */ }
}

onMounted(async () => {
  // Load taxonomies from API if not already cached
  try {
    await taxonomyStore.loadMultiple(['event_type', 'location'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }

  // Load events
  await loadEvents()
})

watch([searchQuery, selectedType], loadEvents)

// --- Utilitaires pour les dates ---
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMonthShort = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('fr', { month: 'short' }).toUpperCase()
}

const getDay = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.getDate()
}

// --- Filtrage des événements ---
const filteredEvents = computed(() => {
  let result = events.value || []

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(event =>
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    )
  }

  // Filtre par type
  if (selectedType.value) {
    result = result.filter(event =>
      event.type === selectedType.value
    )
  }

  return result
})

// Fonction pour extraire le type depuis la taxonomy
const getEventType = (event: any) => {
  if (event.type && typeof event.type === 'string') {
    // Si le type est déjà une chaîne, on le retourne
    return event.type
  }
  // Si c'est un objet taxonomy, on extrait le label
  return event.type?.label || event.type?.name || 'Événement'
}

// Fonction pour obtenir le lieu
const getLocation = (event: any) => {
  if (event.location && typeof event.location === 'string') {
    return event.location
  }
  return event.location?.label || event.location?.name || 'Lieu non spécifié'
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <!-- En-tête -->
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Événements</h1>
          <p class="text-gray-500 mt-2">{{ filteredEvents.length }} événement{{ filteredEvents.length > 1 ? 's' : '' }}
            à venir</p>
        </div>

        <!-- Barre de recherche + Filtres -->
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
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <!-- Skeletons -->
        <div v-if="eventsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard v-for="n in 6" :key="n" :lines="3" />
        </div>

        <div v-else-if="filteredEvents.length === 0"
          class="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar :size="32" class="text-gray-300" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p class="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>

        <!-- Grille des événements -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="event in filteredEvents" :key="event.id"
            class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none">
            </div>

            <div class="p-5">
              <!-- En-tête avec date et titre -->
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <span class="text-xl font-bold">{{ getDay(event.date) }}</span>
                  <span class="text-[9px] font-bold uppercase">{{ getMonthShort(event.date) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <span
                    class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                    {{ getEventType(event) }}
                  </span>
                  <h3
                    class="font-bold text-gray-900 line-clamp-1 mt-1 group-hover:text-orange-600 transition text-base">
                    {{ event.title }}
                  </h3>
                </div>
              </div>

              <!-- Détails de l'événement -->
              <div class="space-y-1.5 text-xs text-gray-500 mb-3">
                <p class="flex items-center gap-1">
                  <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
                  <span class="truncate">{{ getLocation(event) }}</span>
                </p>
                <p class="flex items-center gap-1">
                  <Clock :size="12" class="text-orange-500 flex-shrink-0" />
                  {{ formatDate(event.date) }} - {{ formatTime(event.date) }}
                  <span v-if="event.end_date"> à {{ formatTime(event.end_date) }}</span>
                </p>
                <p class="flex items-center gap-1">
                  <Users2 :size="12" class="text-orange-500 flex-shrink-0" />
                  {{ event.registered || 0 }} / {{ event.capacity || 0 }} inscrits
                </p>
              </div>

              <!-- Description -->
              <p class="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed" v-html="event.description"></p>

              <!-- Bouton -->
              <RouterLink :to="`/evenements/${event.id}`"
                class="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1">
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