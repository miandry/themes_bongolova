<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, MapPin, Briefcase,
  Phone, Mail, Heart, Share2, Award,
  GraduationCap, Globe, Home, Calendar,
  ShieldCheck, Code2, Loader2,
  FileText, Send, X, CheckCircle2,
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useUserStore } from '@/stores/user/user.store'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useToast } from '@/composables/useToast'
import {
  asList,
  personInitials,
  displayText,
  splitByNewline
} from '@/utils/apiData'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const candidateId = route.params.id as string

const userStore = useUserStore()
const auth = useAuthStore()
const { candidate, candidateLoading, candidateError } = storeToRefs(userStore)
const { currentUser } = storeToRefs(auth)

const certifications = computed(() =>
  splitByNewline(candidate.value?.certifications)
)

const languages = computed(() =>
  asList(candidate.value?.languages)
)

const skills = computed(() =>
  asList(candidate.value?.skills)
)

const education = computed(() =>
  splitByNewline(candidate.value?.educations ?? candidate.value?.education)
)

const experienceLabel = computed(() => {
  const c = candidate.value
  if (!c) return '—'
  return displayText(
    c.experience ?? c.experience_level ?? c.experiences,
    '—',
  )
})

const initials = computed(() =>
  personInitials(candidate.value?.first_name, candidate.value?.last_name),
)

function getPhotoUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath) return null
  if (photoPath.startsWith('/sites/')) {
    return photoPath
  }
  return `/sites/bongolava/files/bongolava_job/${photoPath}`
}

function getCvUrl(cvPath: string | null | undefined): string | null {
  if (!cvPath) return null
  if (cvPath.startsWith('/sites/')) {
    return cvPath
  }
  return `/sites/bongolava/files/bongolava_job/${cvPath}`
}

const photoUrl = computed(() => getPhotoUrl(candidate.value?.photo_path))
const cvFullUrl = computed(() => getCvUrl(candidate.value?.cv_path))

async function load() {
  await userStore.fetchCandidateById(candidateId)
}

onMounted(load)

const goBack = () => router.back()
const toggleSave = () => {
  if (candidate.value?.id) userStore.toggleSavedProfile(Number(candidate.value.id))
}
const isSaved = computed(() =>
  candidate.value?.id ? userStore.isProfileSaved(Number(candidate.value.id)) : false,
)

const isAuthenticated = computed(() => !!currentUser.value)

// ── Contact modal ───────────────────────────────────────────────────────────
const showContactModal = ref(false)
const contactSending = ref(false)
const contactSuccess = ref(false)
const contactForm = ref({ subject: '', message: '' })

function openContactModal() {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  contactForm.value = { subject: '', message: '' }
  contactSuccess.value = false
  showContactModal.value = true
}

function closeContactModal() {
  if (contactSending.value) return
  showContactModal.value = false
}

async function submitContact() {
  if (!candidate.value?.id) return
  const subject = contactForm.value.subject.trim()
  const message = contactForm.value.message.trim()
  if (!subject || !message) {
    toast.error('Veuillez remplir le sujet et le message.', { persistent: true })
    return
  }
  contactSending.value = true
  try {
    await userStore.contactCandidate(candidate.value.id, { subject, message })
    contactSuccess.value = true
    toast.success('Message envoyé au candidat.')
  }
  catch (e) {
    toast.error(
      e instanceof Error ? e.message : "Erreur lors de l'envoi. Veuillez réessayer.",
      { persistent: true },
    )
  }
  finally {
    contactSending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <Header />

    <div v-if="candidateLoading" class="flex justify-center items-center py-32 pt-40">
      <Loader2 :size="36" class="animate-spin text-purple-500" />
    </div>

    <div v-else-if="candidateError" class="text-center py-24 pt-32">
      <p class="text-red-500 font-semibold text-lg">{{ candidateError }}</p>
      <button @click="load"
        class="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">
        Réessayer
      </button>
    </div>

    <template v-else-if="candidate">
      <!-- Navigation -->
      <nav class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button @click="goBack" class="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <div class="p-2 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition">
              <ArrowLeft :size="18" />
            </div>
            <span class="hidden sm:inline">Retour</span>
          </button>
          <div class="flex gap-2">
            <button @click="toggleSave"
              :class="`p-2.5 rounded-xl border transition ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'}`">
              <Heart :size="18" :fill="isSaved ? 'currentColor' : 'none'" />
            </button>
            <button
              class="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 transition">
              <Share2 :size="18" />
            </button>
          </div>
        </div>
      </nav>

      <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <!-- Colonne de gauche -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Carte de profil -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
              <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-pink-500" />
              <div class="p-6 text-center">
                <div
                  class="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4">
                  <img v-if="photoUrl" :src="photoUrl" :alt="`${candidate.first_name} ${candidate.last_name}`"
                    class="w-full h-full object-cover" />
                  <span v-else>{{ initials }}</span>
                </div>
                <h1 class="text-xl font-bold text-gray-900 mb-1">{{ candidate.first_name }} {{ candidate.last_name }}
                </h1>
                <p class="text-purple-600 font-bold text-sm mb-3">{{ displayText(candidate.job_target) }}</p>
                <div
                  class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-bold border border-green-100 mb-4">
                  <ShieldCheck :size="12" /> Profil vérifié
                </div>
                <div class="space-y-3 text-left pt-4 border-t border-gray-100">
                  <div v-if="candidate.location" class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <MapPin :size="14" class="text-gray-400" />
                    </div>
                    <span class="font-medium text-sm">{{ candidate.location }}</span>
                  </div>
                  <div v-if="candidate.address" class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Home :size="14" class="text-gray-400" />
                    </div>
                    <span class="font-medium text-sm">{{ candidate.address }}</span>
                  </div>
                  <div v-if="candidate.age" class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Calendar :size="14" class="text-gray-400" />
                    </div>
                    <span class="font-medium text-sm">{{ candidate.age }} ans</span>
                  </div>
                  <div class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Briefcase :size="14" class="text-gray-400" />
                    </div>
                    <span class="font-medium text-sm">{{ experienceLabel }} d'expérience</span>
                  </div>
                  <div v-if="candidate.phone" class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Phone :size="14" class="text-gray-400" />
                    </div>
                    <span class="font-medium text-sm">{{ candidate.phone }}</span>
                  </div>
                  <div v-if="candidate.cv_path" class="flex items-center gap-3 text-gray-600">
                    <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <FileText :size="14" class="text-gray-400" />
                    </div>
                    <a :href="cvFullUrl" target="_blank" rel="noopener noreferrer"
                      class="font-medium text-sm text-purple-600 hover:text-purple-700 hover:underline transition flex items-center gap-1">
                      Voir le CV
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div v-if="candidate.email" class="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
                <button type="button" @click="openContactModal"
                  class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-[10px] uppercase hover:opacity-90 transition shadow-md">
                  <Mail :size="14" /> Contacter par email
                </button>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="certifications.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <Award :size="18" class="text-purple-600" />
                <h3 class="font-bold text-gray-900">Certifications</h3>
              </div>
              <ul class="space-y-2">
                <li v-for="(cert, index) in certifications" :key="index"
                  class="flex items-start gap-2 text-sm text-gray-700">
                  <span class="text-purple-500 font-bold">•</span>
                  <span>{{ cert }}</span>
                </li>
              </ul>
            </div>

            <!-- Langues -->
            <div v-if="languages.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <Globe :size="18" class="text-purple-600" />
                <h3 class="font-bold text-gray-900">Langues</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="lang in languages" :key="lang"
                  class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">{{ lang }}</span>
              </div>
            </div>
          </div>

          <!-- Colonne de droite -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Compétences -->
            <div v-if="skills.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                  <Code2 :size="18" />
                </div>
                <h2 class="text-lg font-bold text-gray-900">Compétences</h2>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="skill in skills" :key="skill"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">{{ skill }}</span>
              </div>
            </div>

            <!-- À propos -->
            <div v-if="candidate.bio" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 class="text-lg font-bold text-gray-900 mb-3">À propos</h2>
              <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{{ candidate.bio }}</p>
            </div>

            <!-- Formation -->
            <div v-if="education.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                  <GraduationCap :size="18" />
                </div>
                <h2 class="text-lg font-bold text-gray-900">Formation</h2>
              </div>
              <ul class="space-y-3">
                <li v-for="(edu, index) in education" :key="index" class="flex items-start gap-2 text-sm text-gray-700">
                  <span class="text-purple-500 font-bold mt-0.5">•</span>
                  <span>{{ edu }}</span>
                </li>
              </ul>
            </div>

            <!-- Bouton de contact -->
            <div class="pt-4">
              <template v-if="!isAuthenticated">
                <RouterLink to="/login"
                  class="block w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all">
                  Contacter ce talent
                </RouterLink>
                <p class="text-center text-xs text-gray-400 mt-2">Connectez-vous ou créez un compte pour contacter</p>
              </template>
              <template v-else-if="candidate.email">
                <button type="button" @click="openContactModal"
                  class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-[10px] uppercase hover:opacity-90 transition shadow-md">
                  <Mail :size="14" /> Contacter par email
                </button>
              </template>
              <template v-else>
                <div class="text-center text-sm text-gray-500">
                  Aucun email disponible
                </div>
              </template>
            </div>
          </div>
        </div>
      </main>
    </template>

    <!-- Modal contact candidat -->
    <Teleport to="body">
      <div v-if="showContactModal" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeContactModal" />
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" @click.stop role="dialog"
            aria-modal="true" aria-labelledby="contact-modal-title">
            <button type="button" @click="closeContactModal"
              class="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              :disabled="contactSending" aria-label="Fermer">
              <X :size="18" />
            </button>

            <div v-if="contactSuccess" class="text-center py-4">
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 :size="28" class="text-green-600" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">Message envoyé</h3>
              <p class="text-sm text-gray-600 mt-2">
                Votre message a été envoyé à
                {{ candidate?.first_name }} {{ candidate?.last_name }}.
              </p>
              <button type="button" @click="closeContactModal"
                class="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition">
                Fermer
              </button>
            </div>

            <template v-else>
              <div class="flex items-center gap-3 mb-5 pr-8">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <Mail :size="18" />
                </div>
                <div>
                  <h3 id="contact-modal-title" class="text-lg font-bold text-gray-900">Contacter le candidat</h3>
                  <p class="text-xs text-gray-500">
                    {{ candidate?.first_name }} {{ candidate?.last_name }}
                  </p>
                </div>
              </div>

              <form class="space-y-4" @submit.prevent="submitContact">
                <div>
                  <label for="contact-subject" class="text-sm font-medium text-gray-700 mb-1.5 block">
                    Sujet <span class="text-red-500">*</span>
                  </label>
                  <input id="contact-subject" v-model="contactForm.subject" type="text" required maxlength="200"
                    placeholder="Ex. Opportunité de poste"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                    :disabled="contactSending" />
                </div>
                <div>
                  <label for="contact-message" class="text-sm font-medium text-gray-700 mb-1.5 block">
                    Message <span class="text-red-500">*</span>
                  </label>
                  <textarea id="contact-message" v-model="contactForm.message" rows="5" required
                    placeholder="Écrivez votre message…"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-sm"
                    :disabled="contactSending" />
                </div>
                <div class="flex gap-2 pt-1">
                  <button type="button" @click="closeContactModal"
                    class="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
                    :disabled="contactSending">
                    Annuler
                  </button>
                  <button type="submit"
                    class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="contactSending">
                    <Loader2 v-if="contactSending" :size="16" class="animate-spin" />
                    <Send v-else :size="16" />
                    {{ contactSending ? 'Envoi…' : 'Envoyer' }}
                  </button>
                </div>
              </form>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <Footer />
  </div>
</template>
