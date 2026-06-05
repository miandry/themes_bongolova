<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Calendar, MapPin, Clock, Users2,
  CheckCircle2, Share2, Phone, Mail, Loader2
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGet, apiPost } from '@/composables/api'
import { displayText } from '@/utils/apiData'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id as string

const event = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const error = ref('')
const registering = ref(false)
const regSuccess = ref(false)
const regError = ref('')
const regName = ref('')
const regEmail = ref('')
const regPhone = ref('')

function parseEventDate(e: Record<string, unknown>, end = false): Date | null {
  const date = String(end ? (e.end_date ?? e.date) : e.date ?? '')
  if (!date) return null
  const time = String(end ? (e.end_time ?? e.time ?? '00:00') : (e.time ?? '00:00'))
  const d = new Date(`${date}T${time}`)
  return Number.isNaN(d.getTime()) ? null : d
}

const formatDate = (e: Record<string, unknown>) => {
  const d = parseEventDate(e, false)
  return d
    ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
}

const formatTime = (d: Date | null) =>
  d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'

const startDate = computed(() => (event.value ? parseEventDate(event.value, false) : null))
const endDate = computed(() => (event.value ? parseEventDate(event.value, true) : null))

const availablePlaces = computed(() => {
  const e = event.value
  if (!e) return 0
  const cap = Number(e.capacity ?? 0)
  const reg = Number(e.registered ?? 0)
  return Math.max(0, cap - reg)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiGet<Record<string, unknown>>(`bongolava_job/events/${eventId}`)
    if (!data || typeof data !== 'object' || !data.id) {
      error.value = 'Événement introuvable.'
      event.value = null
    } else {
      event.value = data
    }
  } catch {
    error.value = 'Événement introuvable.'
    event.value = null
  } finally {
    loading.value = false
  }
}

async function register() {
  regError.value = ''
  if (!regName.value || !regEmail.value || !regPhone.value) {
    regError.value = 'Tous les champs sont requis.'
    return
  }
  registering.value = true
  try {
    await apiPost(`bongolava_job/events/${eventId}/register`, {
      name: regName.value,
      email: regEmail.value,
      phone: regPhone.value,
    })
    regSuccess.value = true
  } catch (e) {
    regError.value = e instanceof Error ? e.message : 'Erreur inscription.'
  } finally {
    registering.value = false
  }
}

onMounted(load)

const goBack = () => router.back()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-4xl mx-auto">
        <div v-if="loading" class="flex justify-center items-center py-24">
          <Loader2 :size="36" class="animate-spin text-orange-400" />
        </div>
        <div v-else-if="error" class="text-center py-20">
          <p class="text-red-500 font-semibold">{{ error }}</p>
          <button @click="load" class="mt-4 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">Réessayer</button>
        </div>
        <template v-else-if="event">
        <button @click="goBack" class="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition mb-6 text-sm">
          <ArrowLeft :size="16" />
          Retour aux événements
        </button>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div class="p-6 md:p-8 border-b border-gray-100">
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span v-if="event.type" class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">{{ event.type }}</span>
                  <span v-if="availablePlaces > 0" class="inline-block text-[10px] font-bold text-green-700 uppercase bg-green-50 px-2 py-0.5 rounded-full">Places disponibles</span>
                  <span v-else class="inline-block text-[10px] font-bold text-red-700 uppercase bg-red-50 px-2 py-0.5 rounded-full">Complet</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">{{ event.title }}</h1>
                <div class="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                  <span class="flex items-center gap-1"><Calendar :size="14" /> {{ formatDate(event) }}</span>
                  <span v-if="startDate" class="flex items-center gap-1"><Clock :size="14" /> {{ formatTime(startDate) }}<template v-if="endDate"> - {{ formatTime(endDate) }}</template></span>
                  <span v-if="event.location" class="flex items-center gap-1"><MapPin :size="14" /> {{ event.location }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <Users2 :size="14" class="text-orange-500" />
                  <span>{{ event.registered ?? 0 }} inscrits sur {{ event.capacity ?? '—' }} places</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                  <Share2 :size="18" class="text-gray-400 hover:text-blue-500 transition" />
                </button>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 space-y-6">
            <div v-if="event.long_description || event.description">
              <h3 class="font-bold text-gray-900 mb-2">À propos de l'événement</h3>
              <div class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{{ event.long_description || event.description }}</div>
            </div>

            <div v-if="event.organizer || event.contact_phone || event.contact_email" class="mt-6 pt-6 border-t border-gray-100">
              <h3 class="font-bold text-gray-900 mb-3">Organisateur</h3>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="font-semibold text-gray-900">{{ displayText(event.organizer) }}</p>
                <div class="flex flex-wrap gap-4 mt-2 text-sm">
                  <a v-if="event.contact_phone" :href="`tel:${event.contact_phone}`" class="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition">
                    <Phone :size="14" /> {{ event.contact_phone }}
                  </a>
                  <a v-if="event.contact_email" :href="`mailto:${event.contact_email}`" class="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition">
                    <Mail :size="14" /> {{ event.contact_email }}
                  </a>
                </div>
                <p v-if="event.address" class="text-gray-500 text-xs mt-2 flex items-center gap-1">
                  <MapPin :size="12" /> {{ event.address }}
                </p>
              </div>
            </div>

            <div class="pt-4">
              <div v-if="regSuccess" class="w-full py-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 :size="20" /> Inscription confirmée !
              </div>
              <div v-else class="space-y-3">
                <h3 class="font-bold text-gray-900">S'inscrire à cet événement</h3>
                <input v-model="regName" type="text" placeholder="Votre nom complet" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                <input v-model="regEmail" type="email" placeholder="Votre email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                <input v-model="regPhone" type="tel" placeholder="Votre téléphone" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                <p v-if="regError" class="text-xs text-red-500">{{ regError }}</p>
                <button @click="register" :disabled="registering" class="block w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {{ registering ? 'Inscription…' : "S'inscrire à cet événement" }}
                </button>
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
