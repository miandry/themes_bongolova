<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Calendar, MapPin, Clock, Search, Users2,
  Edit3, Trash2, Plus, AlertCircle, AlertTriangle, Eye
} from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'
import { useAuthStore } from '@/stores/auth/auth.store'

const PER_PAGE = 9

const nodeStore = useNodeStore()
const taxonomyStore = useTaxonomyStore()
const authStore = useAuthStore()
const router = useRouter()

const {
  events, eventsLoading, eventsError,
  eventsTotal, eventsCurrentPage, eventsLastPage,
} = storeToRefs(nodeStore)
const { eventTypes } = storeToRefs(taxonomyStore)
const { authRole } = storeToRefs(authStore)

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const deleteConfirmId = ref<number | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadMyEvents() {
  try {
    await nodeStore.searchMyEvents({
      search: searchQuery.value.trim() || undefined,
      type: selectedType.value || undefined,
      status: selectedStatus.value || undefined,
      page: currentPage.value,
      per_page: PER_PAGE,
    })
  } catch { /* handled in store */ }
}

onMounted(async () => {
  if (authRole.value !== 'recruiter' && authRole.value !== 'admin') {
    router.push('/')
    return
  }

  try {
    await taxonomyStore.loadMultiple(['event_type'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }

  await loadMyEvents()
})

watch([searchQuery, selectedType, selectedStatus], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    loadMyEvents()
  }, 350)
})

function onPageChange(page: number) {
  currentPage.value = page
  loadMyEvents()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getMonthShort = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('fr', { month: 'short' }).toUpperCase()
}

const getDay = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).getDate()
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'En attente',
    published: 'Publié',
    rejected: 'Rejeté',
  }
  return map[status] || status || 'Inconnu'
}

const getStatusClass = (status: string) => {
  if (status === 'published') return 'bg-green-50 text-green-700'
  if (status === 'pending') return 'bg-yellow-50 text-yellow-700'
  if (status === 'rejected') return 'bg-red-50 text-red-700'
  return 'bg-gray-50 text-gray-700'
}

async function deleteEvent(eventId: number) {
  try {
    await nodeStore.removeEvent(eventId)
    deleteConfirmId.value = null
    await loadMyEvents()
  } catch (err) {
    console.error('Error deleting event:', err)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-gray-900">Mes événements</h1>
            <p class="text-gray-500 mt-2">
              {{ eventsTotal }} événement{{ eventsTotal > 1 ? 's' : '' }}
            </p>
          </div>
          <RouterLink to="/evenements/nouveau"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-md transition text-sm">
            <Plus :size="16" />
            Ajouter un événement
          </RouterLink>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-4 mb-8">
          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 flex items-center px-3 py-2 bg-gray-100 rounded-lg">
              <Search :size="18" class="text-gray-400 mr-2" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher..."
                class="bg-transparent outline-none w-full text-gray-800 placeholder:text-gray-400 text-sm" />
            </div>
            <div class="flex flex-wrap gap-2">
              <select v-model="selectedType"
                class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous types</option>
                <option v-for="type in eventTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
              <select v-model="selectedStatus"
                class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="published">Publié</option>
                <option value="rejected">Rejeté</option>
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
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun événement</h3>
          <p class="text-gray-500 mb-4">Vous n'avez pas encore créé d'événement.</p>
          <RouterLink to="/evenements/nouveau"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-lg text-sm">
            <Plus :size="16" />
            Créer un événement
          </RouterLink>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="event in events" :key="event.id"
            class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div class="p-5">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                    <span class="text-xl font-bold">{{ getDay(event.date ?? '') }}</span>
                    <span class="text-[9px] font-bold uppercase">{{ getMonthShort(event.date ?? '') }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span
                      :class="['inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-1', getStatusClass(event.status ?? '')]">
                      {{ getStatusLabel(event.status ?? '') }}
                    </span>
                    <h3 class="font-bold text-gray-900 line-clamp-1 text-base">{{ event.title }}</h3>
                    <span class="text-[10px] text-orange-700 font-semibold uppercase">{{ event.type }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5 text-xs text-gray-500 mb-3">
                <p class="flex items-center gap-1">
                  <MapPin :size="12" class="text-orange-500 flex-shrink-0" />
                  <span class="truncate">{{ event.location || '—' }}</span>
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

              <div class="flex gap-2">
                <RouterLink :to="`/evenements/${event.id}`"
                  class="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-1">
                  <Eye :size="12" /> voir
                </RouterLink>
                <RouterLink :to="`/evenements/${event.id}/edit`"
                  class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-1">
                  <Edit3 :size="12" /> Modifier
                </RouterLink>
                <button type="button" @click="deleteConfirmId = event.id"
                  class="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1">
                  <Trash2 :size="12" /> Supprimer
                </button>
              </div>
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

    <!-- Modal confirmation suppression -->
    <div v-if="deleteConfirmId" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle :size="20" class="text-red-600" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">Supprimer l'événement ?</h3>
        </div>
        <p class="text-gray-600 text-sm mb-6">Cette action est irréversible. Toutes les inscriptions associées seront également supprimées.</p>
        <div class="flex gap-3">
          <button type="button" @click="deleteConfirmId = null"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
            Annuler
          </button>
          <button type="button" @click="deleteEvent(deleteConfirmId!)"
            class="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
