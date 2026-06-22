<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Calendar, MapPin, ArrowRight } from 'lucide-vue-next'
import { useNodeStore } from '@/stores/node/node.store'

const nodeStore = useNodeStore()
const { upcomingEvents, eventsLoading } = storeToRefs(nodeStore)

// Récupérer les 3 premiers événements
const events = computed(() => {
  if (!upcomingEvents.value || upcomingEvents.value.length === 0) return []
  return upcomingEvents.value.slice(0, 3)
})

// Vérifier si des événements sont en cours de chargement
const loading = computed(() => eventsLoading.value)

onMounted(async () => {
  try {
    await nodeStore.fetchEvents()
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error)
  }
})

// --- Utilitaires pour les dates ---
// Les dates de l'API sont au format ISO (ex: "2026-06-22T17:30:00")
const formatDate = (dateString: string) => {
  if (!dateString) return new Date()
  return new Date(dateString)
}

const getMonth = (event: { date?: string }) => {
  if (!event?.date) return ''
  return formatDate(event.date).toLocaleString('fr', { month: 'short' }).toUpperCase()
}

const getDay = (event: { date?: string }) => {
  if (!event?.date) return ''
  return formatDate(event.date).getDate()
}

// Fonction pour extraire le type depuis la taxonomy
const getEventType = (event: any) => {
  if (!event) return 'Événement'
  if (event.type && typeof event.type === 'string') {
    return event.type
  }
  return event.type?.label || event.type?.name || 'Événement'
}

// Fonction pour obtenir le lieu
const getLocation = (event: any) => {
  if (!event) return 'Lieu non spécifié'
  if (event.location && typeof event.location === 'string') {
    return event.location
  }
  return event.location?.label || event.location?.name || 'Lieu non spécifié'
}

// Fonction pour nettoyer la description (enlever les balises HTML)
const cleanDescription = (html: string) => {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
</script>

<template>
  <section class="py-16 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
    <!-- Décorations d'arrière-plan -->
    <div
      class="absolute top-0 left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2">
    </div>
    <div
      class="absolute bottom-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2">
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- En-tête -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full mb-3 backdrop-blur-sm border border-orange-200/30">
          <Calendar :size="12" class="text-orange-600" />
          <span class="text-[10px] font-bold text-orange-700 uppercase tracking-wider">À ne pas manquer</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          Événements à <span
            class="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">venir</span>
        </h2>
        <p class="text-gray-500 text-sm max-w-2xl mx-auto">Formations, salons, ateliers – Tout près de chez vous</p>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white/70 rounded-xl shadow-md border border-gray-200 p-5 animate-pulse">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 bg-gray-200 rounded-xl"></div>
            <div class="flex-1">
              <div class="h-3 bg-gray-200 rounded-full w-20 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded-full w-32"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded-full w-full"></div>
            <div class="h-3 bg-gray-200 rounded-full w-3/4"></div>
            <div class="h-10 bg-gray-200 rounded-lg w-full mt-3"></div>
          </div>
        </div>
      </div>

      <!-- Aucun événement -->
      <div v-else-if="events.length === 0"
        class="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar :size="32" class="text-gray-300" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun événement à venir</h3>
        <p class="text-gray-500">Revenez plus tard pour découvrir nos prochains événements.</p>
      </div>

      <!-- Grille des événements -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in events" :key="event.id"
          class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <!-- Effet de brillance au survol -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none">
          </div>

          <div class="p-5">
            <!-- En-tête avec date et titre -->
            <div class="flex items-start gap-3 mb-3">
              <div
                class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <span class="text-xl font-bold">{{ getDay(event) }}</span>
                <span class="text-[9px] font-bold uppercase">{{ getMonth(event) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <span
                  class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                  {{ getEventType(event) }}
                </span>
                <h3 class="font-bold text-gray-900 line-clamp-1 mt-1 group-hover:text-orange-600 transition text-base">
                  {{ event.title }}
                </h3>
              </div>
            </div>

            <!-- Lieu -->
            <p class="text-gray-500 text-xs mb-2 flex items-center gap-1">
              <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
              <span class="truncate">{{ getLocation(event) }}</span>
            </p>

            <!-- Description -->
            <p class="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">
              {{ cleanDescription(event.description) }}
            </p>

            <!-- Bouton d'inscription -->
            <RouterLink :to="`/evenements/${event.id}`"
              class="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1 group/btn">
              S'inscrire
              <ArrowRight :size="12" class="group-hover/btn:translate-x-0.5 transition" />
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Bouton "Voir tous" -->
      <div class="text-center mt-10">
        <RouterLink to="/evenements">
          <button
            class="group relative px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all inline-flex items-center gap-2 overflow-hidden">
            <span class="relative z-10">Découvrir tous les événements</span>
            <ArrowRight :size="14" class="relative z-10 group-hover:translate-x-1 transition" />
          </button>
        </RouterLink>
      </div>
    </div>
  </section>
</template>