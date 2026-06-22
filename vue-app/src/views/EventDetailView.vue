<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, Calendar, MapPin, Clock, Users2,
  CheckCircle2, Share2, Phone, Mail, Loader2
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useNodeStore } from '@/stores/node/node.store'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id as string

const nodeStore = useNodeStore()
const { event, eventLoading, eventError } = storeToRefs(nodeStore)

const registering = ref(false)
const regSuccess = ref(false)
const regError = ref('')
const regName = ref('')
const regEmail = ref('')
const regPhone = ref('')

// --- Utilitaires pour les dates ---
// Les dates de l'API sont au format ISO (ex: "2026-06-30T09:00:00")
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (dateString: string) => {
  const date = parseDate(dateString)
  return date
    ? date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    : 'Date non spécifiée'
}

const formatTime = (dateString: string) => {
  const date = parseDate(dateString)
  return date
    ? date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    : '—'
}

const startDate = computed(() => event.value?.date ? parseDate(event.value.date) : null)
const endDate = computed(() => event.value?.end_date ? parseDate(event.value.end_date) : null)

// --- Calcul des places disponibles ---
const availablePlaces = computed(() => {
  const e = event.value
  if (!e) return 0
  const cap = Number(e.capacity ?? 0)
  const reg = Number(e.registered ?? 0)
  return Math.max(0, cap - reg)
})

// --- Fonction pour obtenir le type d'événement ---
const getEventType = (event: any) => {
  if (!event) return 'Événement'
  if (event.type && typeof event.type === 'string') {
    return event.type
  }
  return event.type?.label || event.type?.name || 'Événement'
}

// --- Fonction pour obtenir le lieu ---
const getLocation = (event: any) => {
  if (!event) return 'Lieu non spécifié'
  if (event.location && typeof event.location === 'string') {
    return event.location
  }
  return event.location?.label || event.location?.name || 'Lieu non spécifié'
}

// --- Fonction pour nettoyer la description ---
const cleanDescription = (html: string) => {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

// --- Fonction pour obtenir l'organisateur ---
const getOrganizer = (event: any) => {
  if (!event) return 'Organisateur non spécifié'
  if (event.organizer && typeof event.organizer === 'string') {
    return event.organizer
  }
  return event.organizer?.label || event.organizer?.name || 'Organisateur non spécifié'
}

// --- Chargement des données ---
async function load() {
  await nodeStore.fetchEventById(eventId)
}

// --- Inscription ---
async function register() {
  regError.value = ''
  if (!regName.value || !regEmail.value || !regPhone.value) {
    regError.value = 'Tous les champs sont requis.'
    return
  }

  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(regEmail.value)) {
    regError.value = 'Veuillez entrer une adresse email valide.'
    return
  }

  registering.value = true
  try {
    await nodeStore.registerEvent(eventId, {
      name: regName.value,
      email: regEmail.value,
      phone: regPhone.value,
    })
    regSuccess.value = true
    // Réinitialiser les champs
    regName.value = ''
    regEmail.value = ''
    regPhone.value = ''
  } catch (error) {
    regError.value = error instanceof Error ? error.message : 'Erreur lors de l\'inscription.'
  } finally {
    registering.value = false
  }
}

// --- Navigation ---
const goBack = () => router.back()

// --- Partager ---
const shareEvent = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: event.value?.title || 'Événement',
        text: `Découvrez cet événement : ${event.value?.title || ''}`,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Erreur de partage:', error)
    }
  } else {
    // Fallback: copier le lien
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier !')
    } catch {
      alert('Partagez l\'URL de cette page.')
    }
  }
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-4xl mx-auto">
        <!-- Chargement -->
        <div v-if="eventLoading" class="flex justify-center items-center py-24">
          <Loader2 :size="36" class="animate-spin text-orange-400" />
        </div>

        <!-- Erreur -->
        <div v-else-if="eventError" class="text-center py-20">
          <p class="text-red-500 font-semibold">{{ eventError }}</p>
          <button @click="load"
            class="mt-4 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
            Réessayer
          </button>
        </div>

        <!-- Événement trouvé -->
        <template v-else-if="event">
          <!-- Bouton retour -->
          <button @click="goBack"
            class="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition mb-6 text-sm">
            <ArrowLeft :size="16" />
            Retour aux événements
          </button>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <!-- En-tête -->
            <div class="p-6 md:p-8 border-b border-gray-100">
              <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">
                      {{ getEventType(event) }}
                    </span>
                    <span v-if="availablePlaces > 0"
                      class="inline-block text-[10px] font-bold text-green-700 uppercase bg-green-50 px-2 py-0.5 rounded-full">
                      Places disponibles
                    </span>
                    <span v-else
                      class="inline-block text-[10px] font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded-full">
                      Complet
                    </span>
                  </div>
                  <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">{{ event.title }}</h1>

                  <div class="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <span class="flex items-center gap-1">
                      <Calendar :size="14" /> {{ formatDate(event.date) }}
                    </span>
                    <span v-if="startDate" class="flex items-center gap-1">
                      <Clock :size="14" /> {{ formatTime(event.date) }}
                      <template v-if="endDate"> - {{ formatTime(event.end_date) }}</template>
                    </span>
                    <span class="flex items-center gap-1">
                      <MapPin :size="14" /> {{ getLocation(event) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <Users2 :size="14" class="text-orange-500" />
                    <span>{{ event.registered ?? 0 }} inscrit{{ event.registered > 1 ? 's' : '' }} sur {{ event.capacity
                      ?? '—' }}
                      places</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button @click="shareEvent"
                    class="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition hidden">
                    <Share2 :size="18" class="text-gray-400 hover:text-blue-500 transition" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Contenu -->
            <div class="p-6 md:p-8 space-y-6">
              <!-- Description -->
              <div v-if="event.long_description || event.description">
                <h3 class="font-bold text-gray-900 mb-2">À propos de l'événement</h3>
                <div class="text-gray-600 text-sm leading-relaxed">
                  {{ cleanDescription(event.long_description || event.description) }}
                </div>
              </div>

              <!-- Organisateur -->
              <div v-if="getOrganizer(event) || event.contact_phone || event.contact_email"
                class="mt-6 pt-6 border-t border-gray-100">
                <h3 class="font-bold text-gray-900 mb-3">Organisateur</h3>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="font-semibold text-gray-900">{{ getOrganizer(event) }}</p>
                  <div class="flex flex-wrap gap-4 mt-2 text-sm">
                    <a v-if="event.contact_phone" :href="`tel:${event.contact_phone}`"
                      class="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition">
                      <Phone :size="14" /> {{ event.contact_phone }}
                    </a>
                    <a v-if="event.contact_email" :href="`mailto:${event.contact_email}`"
                      class="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition">
                      <Mail :size="14" /> {{ event.contact_email }}
                    </a>
                  </div>
                  <p v-if="event.address" class="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <MapPin :size="12" /> {{ event.address }}
                  </p>
                </div>
              </div>

              <!-- Inscription -->
              <div class="pt-4">
                <div v-if="regSuccess"
                  class="w-full py-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 :size="20" /> Inscription confirmée !
                </div>
                <div v-else class="space-y-3">
                  <h3 class="font-bold text-gray-900">S'inscrire à cet événement</h3>

                  <!-- Désactiver l'inscription si complet -->
                  <div v-if="availablePlaces === 0"
                    class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                    🎫 Désolé, toutes les places sont déjà prises.
                  </div>

                  <template v-else>
                    <input v-model="regName" type="text" placeholder="Votre nom complet"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                    <input v-model="regEmail" type="email" placeholder="Votre email"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                    <input v-model="regPhone" type="tel" placeholder="Votre téléphone"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                    <p v-if="regError" class="text-xs text-red-500">{{ regError }}</p>
                    <button @click="register" :disabled="registering || availablePlaces === 0"
                      class="block w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                      {{ registering ? 'Inscription en cours...' : "S'inscrire à cet événement" }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
    <Footer />
  </div>
</template>