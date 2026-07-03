<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Save, AlertCircle, Loader2, ChevronLeft, Calendar, MapPin,
  Clock, Users2, Mail, Phone, FileText, Tag,
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'
import type { Event } from '@/types/entities'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const nodeStore = useNodeStore()
const taxonomy = useTaxonomyStore()

const { currentUser, authRole } = storeToRefs(auth)
const { eventLoading, eventError } = storeToRefs(nodeStore)
const { eventTypes } = storeToRefs(taxonomy)

const form = ref({
  title: '',
  description: '',
  horaires: '',
  date: '',
  type: '',
  location: '',
  address: '',
  capacity: '',
  organizer: '',
  contact_email: '',
  contact_phone: '',
})

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const isEditing = computed(() => route.path.includes('/edit'))
const eventId = computed(() => {
  const id = route.params.id
  return id && typeof id === 'string' && id !== 'nouveau' ? Number(id) : null
})

const saving = ref(false)
const formErrors = ref<Record<string, string[]>>({})
const errorMessage = ref('')
const successMessage = ref('')

const pageTitle = computed(() =>
  isEditing.value ? 'Modifier l\'événement' : 'Créer un événement',
)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(): boolean {
  formErrors.value = {}

  if (!form.value.title.trim()) {
    formErrors.value.title = ['Le titre est requis.']
  } else if (form.value.title.trim().length < 3) {
    formErrors.value.title = ['Le titre doit contenir au moins 3 caractères.']
  }

  if (!form.value.description.trim()) {
    formErrors.value.description = ['La description est requise.']
  } else if (form.value.description.trim().length < 10) {
    formErrors.value.description = ['La description doit contenir au moins 10 caractères.']
  }

  if (!form.value.date) {
    formErrors.value.date = ['La date est requise.']
  }

  if (!form.value.type) {
    formErrors.value.type = ['Le type d\'événement est requis.']
  }

  if (!form.value.location.trim()) {
    formErrors.value.location = ['La localisation est requise.']
  }

  if (!form.value.horaires.trim()) {
    formErrors.value.horaires = ['Les horaires sont requis.']
  }

  if (form.value.contact_email && !isValidEmail(form.value.contact_email)) {
    formErrors.value.contact_email = ['Adresse email invalide.']
  }

  return Object.keys(formErrors.value).length === 0
}

async function loadEventData() {
  if (!eventId.value) return

  try {
    const event = await nodeStore.fetchEventById(eventId.value, false)
    if (!event) {
      errorMessage.value = 'Événement introuvable.'
      return
    }

    if (authRole.value === 'recruiter' && event.owner_id !== currentUser.value?.id) {
      errorMessage.value = 'Vous n\'êtes pas autorisé à modifier cet événement.'
      return
    }

    form.value = {
      title: event.title ?? '',
      description: event.description ?? '',
      horaires: event.horaires ?? '',
      date: event.date ? String(event.date).split('T')[0] : '',
      type: event.type ?? '',
      location: event.location ?? '',
      address: event.address ?? '',
      capacity: event.capacity != null ? String(event.capacity) : '',
      organizer: event.organizer ?? '',
      contact_email: event.contact_email ?? '',
      contact_phone: event.contact_phone ?? '',
    }
    
    if (event.image_url) {
      imagePreview.value = event.image_url
    }
  } catch {
    errorMessage.value = 'Erreur lors du chargement de l\'événement.'
  }
}

function prefillEmail() {
  if (!form.value.contact_email && currentUser.value?.email) {
    form.value.contact_email = currentUser.value.email
  }
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = 'L\'image ne doit pas dépasser 5MB.'
    return
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'Format d\'image non supporté. Formats acceptés: JPG, PNG, WEBP, GIF.'
    return
  }

  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  errorMessage.value = ''
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
}

async function submitForm() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) {
    errorMessage.value = 'Veuillez corriger les erreurs du formulaire.'
    return
  }

  saving.value = true
  try {
    // Use FormData for image upload
    const formData = new FormData()
    formData.append('title', form.value.title.trim())
    formData.append('description', form.value.description.trim())
    formData.append('horaires', form.value.horaires.trim())
    formData.append('date', form.value.date)
    formData.append('type', form.value.type)
    formData.append('location', form.value.location.trim())
    if (form.value.address.trim()) formData.append('address', form.value.address.trim())
    if (form.value.capacity) formData.append('capacity', String(Number(form.value.capacity)))
    if (form.value.organizer.trim()) formData.append('organizer', form.value.organizer.trim())
    if (form.value.contact_email.trim()) formData.append('contact_email', form.value.contact_email.trim())
    if (form.value.contact_phone.trim()) formData.append('contact_phone', form.value.contact_phone.trim())
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    if (isEditing.value && eventId.value) {
      await nodeStore.updateEventForm(eventId.value, formData)
      successMessage.value = 'Événement mis à jour avec succès.'
      setTimeout(() => router.push('/mes-evenements'), 1500)
    } else {
      await nodeStore.createEventForm(formData)
      successMessage.value = 'Événement créé avec succès. Il sera visible après validation.'
      setTimeout(() => router.push('/mes-evenements'), 1500)
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (authRole.value !== 'recruiter' && authRole.value !== 'admin') {
    router.push('/')
    return
  }

  try {
    await taxonomy.loadMultiple(['event_type'])
  } catch (err) {
    console.error('Error loading taxonomies:', err)
  }

  if (isEditing.value) {
    await loadEventData()
  } else {
    prefillEmail()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Header />

    <main class="flex-grow pt-20 pb-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <RouterLink to="/mes-evenements"
          class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition">
          <ChevronLeft :size="16" />
          Retour à mes événements
        </RouterLink>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
            <h1 class="text-2xl font-black text-white">{{ pageTitle }}</h1>
            <p class="text-orange-100 text-sm mt-1">
              Remplissez les informations de l'événement
            </p>
          </div>

          <div class="p-6 space-y-6">
            <div v-if="errorMessage" class="flex items-start gap-2 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle :size="18" class="flex-shrink-0 mt-0.5" />
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
              {{ successMessage }}
            </div>
            <div v-if="eventError" class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {{ eventError }}
            </div>

            <form class="space-y-5" @submit.prevent="submitForm">
              <!-- Titre -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                <input v-model="form.title" type="text" placeholder="Ex: Salon de l'emploi 2026"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p v-if="formErrors.title" class="text-red-600 text-xs mt-1">{{ formErrors.title[0] }}</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText :size="14" class="inline mr-1" />
                  Description *
                </label>
                <textarea v-model="form.description" rows="5" placeholder="Décrivez l'événement..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y" />
                <p v-if="formErrors.description" class="text-red-600 text-xs mt-1">{{ formErrors.description[0] }}</p>
              </div>

              <!-- Image upload -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Image de l'événement</label>
                <div class="space-y-3">
                  <div v-if="imagePreview" class="relative inline-block">
                    <img :src="imagePreview" alt="Aperçu" class="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300" />
                    <button type="button" @click="removeImage"
                      class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                      ✕
                    </button>
                  </div>
                  <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition">
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" @change="handleImageUpload"
                      class="hidden" id="event-image-upload" />
                    <label for="event-image-upload" class="cursor-pointer">
                      <div class="text-gray-500">
                        <p class="text-sm font-medium">Cliquez pour télécharger une image</p>
                        <p class="text-xs mt-1">JPG, PNG, WEBP, GIF (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Date -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar :size="14" class="inline mr-1" />
                    Date *
                  </label>
                  <input v-model="form.date" type="date"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <p v-if="formErrors.date" class="text-red-600 text-xs mt-1">{{ formErrors.date[0] }}</p>
                </div>

                <!-- Horaires -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock :size="14" class="inline mr-1" />
                    Horaires *
                  </label>
                  <input v-model="form.horaires" type="text" placeholder="Ex: 8h30 - 17h"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <p v-if="formErrors.horaires" class="text-red-600 text-xs mt-1">{{ formErrors.horaires[0] }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <!-- Type -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag :size="14" class="inline mr-1" />
                    Type d'événement *
                  </label>
                  <select v-model="form.type"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Sélectionner un type</option>
                    <option v-for="t in eventTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                  <p v-if="formErrors.type" class="text-red-600 text-xs mt-1">{{ formErrors.type[0] }}</p>
                </div>

                <!-- Capacité -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Users2 :size="14" class="inline mr-1" />
                    Capacité
                  </label>
                  <input v-model="form.capacity" type="number" min="0" placeholder="Ex: 50"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <!-- Localisation (texte libre) -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin :size="14" class="inline mr-1" />
                  Localisation *
                </label>
                <input v-model="form.location" type="text" placeholder="Ex: Tsiroanomandidy"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p class="text-xs text-gray-400 mt-1">Saisissez une ville ou zone. Un nouveau terme sera créé si nécessaire.</p>
                <p v-if="formErrors.location" class="text-red-600 text-xs mt-1">{{ formErrors.location[0] }}</p>
              </div>

              <!-- Adresse -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                <input v-model="form.address" type="text" placeholder="Adresse précise du lieu"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <!-- Organisateur -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Organisateur</label>
                <input v-model="form.organizer" type="text" placeholder="Nom de l'organisateur"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail :size="14" class="inline mr-1" />
                    Email de contact
                  </label>
                  <input v-model="form.contact_email" type="email" placeholder="contact@exemple.mg"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <p v-if="formErrors.contact_email" class="text-red-600 text-xs mt-1">{{ formErrors.contact_email[0] }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone :size="14" class="inline mr-1" />
                    Téléphone
                  </label>
                  <input v-model="form.contact_phone" type="tel" placeholder="+261 34 00 000 00"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button type="submit" :disabled="saving || eventLoading"
                  class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:shadow-md transition disabled:opacity-60">
                  <Loader2 v-if="saving" :size="18" class="animate-spin" />
                  <Save v-else :size="18" />
                  {{ isEditing ? 'Enregistrer les modifications' : 'Créer l\'événement' }}
                </button>
                <RouterLink to="/mes-evenements"
                  class="px-6 py-3 text-center border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                  Annuler
                </RouterLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
