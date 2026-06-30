<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, MapPin, Building2, Briefcase, Calendar,
  Heart, CheckCircle2, Zap, Share2,
  Phone, Mail, Tag, Award, Edit3, Trash2, Loader2, X, Maximize2
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import JobApplyForm from '../components/JobApplyForm.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { useAuthStore } from '@/stores/auth/auth.store'

const route = useRoute()
const router = useRouter()
const jobId = route.params.id as string

const nodeStore = useNodeStore()
const auth = useAuthStore()
const { job, jobLoading, jobError } = storeToRefs(nodeStore)
const { currentUser, authRole } = storeToRefs(auth)

const applySuccess = ref(false)
const deleting = ref(false)
const imageFullscreenOpen = ref(false)

const jobImageUrl = computed(() => {
  const url = job.value?.image_url
  return url ? String(url) : ''
})

const hasJobImage = computed(() => jobImageUrl.value.length > 0)

function openImageFullscreen() {
  if (!hasJobImage.value) return
  imageFullscreenOpen.value = true
}

function closeImageFullscreen() {
  imageFullscreenOpen.value = false
}

function onImageKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeImageFullscreen()
}

const isPartnerJob = computed(() => (job.value?.user_type ?? null) === 'partenaire')

const canShowApplyForm = computed(() => {
  if (isPartnerJob.value) return false
  if (authRole.value === 'partenaire') return false
  return true
})

/** API returns recruiter_id only — build a safe display object (avoids render crash). */
const recruiter = computed(() => {
  const j = job.value
  if (!j) return null
  const r = j.recruiter as Record<string, string> | undefined
  if (r && typeof r === 'object') {
    return {
      organization: r.organization || String(j.company ?? ''),
      name: r.name || String(j.company ?? ''),
      email: r.email || String(j.contact_email ?? ''),
      phone: r.phone || String(j.contact_phone ?? ''),
    }
  }
  return {
    organization: String(j.company ?? 'Entreprise'),
    name: String(j.company ?? 'Recruteur'),
    email: String(j.contact_email ?? ''),
    phone: String(j.contact_phone ?? ''),
  }
})

// Fonction pour formater le texte avec sauts de ligne
const formatText = (text: string | undefined) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

// Fonction pour diviser le texte en lignes (pour les listes)
const splitLines = (text: string | undefined) => {
  if (!text) return []
  return text.split('\n').filter(line => line.trim() !== '')
}

// Check if current user can edit or delete this job
const canEdit = computed(() => {
  if (!job.value || !currentUser.value) return false
  if (authRole.value === 'admin') return true
  if (authRole.value === 'recruiter' && job.value.recruiter_id === currentUser.value.id) return true
  return false
})

async function load() {
  await nodeStore.fetchJobById(jobId)
}

const goBack = () => router.back()
const formatDate = (date?: string) => date
  ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—'

async function editJob() {
  router.push(`/jobs/${jobId}/edit`)
}

async function deleteJob() {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) return

  deleting.value = true
  try {
    await nodeStore.removeJob(jobId)
    router.push('/jobs')
  } catch (err) {
    console.error('Error deleting job:', err)
    alert('Erreur lors de la suppression.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('keydown', onImageKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onImageKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="flex-grow pt-20 pb-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">

        <div v-if="jobLoading" class="text-center py-20 text-gray-500">Chargement…</div>
        <div v-else-if="jobError" class="text-center py-20 text-red-500">{{ jobError }}</div>
        <template v-else-if="job">

          <!-- Bouton retour -->
          <div class="flex items-center justify-between mb-8">
            <button @click="goBack" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft :size="16" />
              <span class="text-sm font-medium">Retour</span>
            </button>
            <div class="flex gap-2">
              <button v-if="canEdit" @click="editJob"
                class="p-2 rounded-full border border-blue-200 hover:bg-blue-50 transition" title="Éditer">
                <Edit3 :size="18" class="text-blue-600" />
              </button>
              <button v-if="canEdit" @click="deleteJob" :disabled="deleting"
                class="p-2 rounded-full border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
                title="Supprimer">
                <Loader2 v-if="deleting" :size="18" class="text-red-600 animate-spin" />
                <Trash2 v-else :size="18" class="text-red-600" />
              </button>
              <button class="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                <Heart :size="18" class="text-gray-400 hover:text-red-500" />
              </button>
              <button class="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                <Share2 :size="18" class="text-gray-400 hover:text-blue-500" />
              </button>
            </div>
          </div>

          <!-- GRID PRINCIPALE -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- COLONNE DE GAUCHE : Description et texte -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Titre + Infos de base -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <button
                  v-if="hasJobImage"
                  type="button"
                  class="group relative block w-full mb-5 rounded-xl overflow-hidden border border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  :aria-label="`Voir l'image de ${job.title} en plein écran`"
                  @click="openImageFullscreen">
                  <img :src="jobImageUrl" :alt="String(job.title ?? 'Offre')"
                    class="w-full h-56 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                  <span
                    class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span
                      class="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded-full p-2.5">
                      <Maximize2 :size="22" />
                    </span>
                  </span>
                </button>
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{{ job.title }}</h1>
                    <p class="text-gray-600 mt-1 flex items-center gap-1">
                      <Building2 :size="14" /> {{ job.company }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">{{
                      job.contract_type ?? job.type }}</span>
                    <span v-if="job.is_urgent ?? job.urgent"
                      class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                      <Zap :size="12" class="fill-current" /> Urgent
                    </span>
                    <span v-if="job.is_remote ?? job.remote"
                      class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Remote</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <MapPin :size="14" class="text-green-500" /> {{ job.location }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Calendar :size="14" /> Publiée le {{ formatDate(job.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Description avec sauts de ligne préservés -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase :size="18" class="text-blue-600" /> Description
                </h2>
                <div class="text-gray-600 text-sm leading-relaxed" v-html="formatText(job.description)"></div>
              </div>

              <!-- Responsabilités avec sauts de ligne et mise en forme -->
              <div v-if="job.responsibilities" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 :size="18" class="text-green-500" /> Responsabilités
                </h2>
                <div class="space-y-3">
                  <!-- Affichage avec mise en forme des listes numérotées et à puces -->
                  <div v-for="(line, index) in splitLines(job.responsibilities)" :key="index"
                    class="text-sm text-gray-600 leading-relaxed" :class="{
                      'font-bold text-gray-800 mt-4': line.match(/^\d+\./),
                      'text-gray-800': line.match(/^[A-Z]/) && !line.match(/^\d+\./)
                    }">
                    <!-- Détection des titres de sections (ex: "1. Recrutement :") -->
                    <span v-if="line.match(/^\d+\./)" class="text-green-600 font-bold mr-2">{{ line.match(/^\d+\./)?.[0]
                      }}</span>

                    <!-- Détection des sous-points (ex: "•", "-") -->
                    <span v-if="line.startsWith('•') || line.startsWith('-')" class="text-green-500 mr-2">•</span>

                    <!-- Détection des sous-points numérotés (ex: "1.", "2.") -->
                    <span v-if="line.match(/^\d+\.\s/) && !line.match(/^\d+\.\s*[A-Z]/)"
                      class="text-green-600 font-bold mr-2">{{ line.match(/^\d+\./)?.[0] }}</span>

                    {{ line.replace(/^[\d\.\s•-]+/, '') }}
                  </div>
                </div>
              </div>

              <!-- Exigences avec sauts de ligne et mise en forme -->
              <div v-if="job.requirements" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award :size="18" class="text-purple-500" /> Exigences
                </h2>
                <div class="space-y-2">
                  <div v-for="(line, index) in splitLines(job.requirements)" :key="index"
                    class="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span class="text-purple-500 mt-1">•</span>
                    {{ line }}
                  </div>
                </div>
              </div>

              <JobApplyForm v-if="canShowApplyForm" :job-id="jobId" :job-title="String(job.title ?? '')" variant="section"
                :applied="applySuccess" @success="applySuccess = true" />

            </div>

            <!-- COLONNE DE DROITE : Salaire, Recruteur, Tags -->
            <div class="space-y-6">

              <!-- Bloc Salaire & Infos avec bouton renforcé -->
              <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
                <div class="bg-gradient-to-r from-blue-50 to-green-50 -mx-6 -mt-6 p-6 rounded-t-2xl mb-4">
                  <p class="text-xs text-gray-500 uppercase font-semibold">Salaire proposé</p>
                  <p class="text-green-600 font-bold text-2xl">{{ job.salary }}</p>
                </div>

                <!-- LIGNES D'INFORMATION -->
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100 w-full">
                    <span class="text-gray-500">Type</span>
                    <span class="font-medium text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-xs">{{
                      job.contract_type ?? job.type }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100 w-full">
                    <span class="text-gray-500">Localisation</span>
                    <span class="font-medium text-gray-800">{{ job.location }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 w-full">
                    <span class="text-gray-500">Publiée</span>
                    <span class="font-medium text-gray-800">{{ formatDate(job.created_at) }}</span>
                  </div>
                </div>

                <JobApplyForm v-if="canShowApplyForm" :job-id="jobId" :job-title="String(job.title ?? '')" variant="sidebar"
                  :applied="applySuccess" @success="applySuccess = true" />
              </div>

              <!-- Bloc Recruteur -->
              <div v-if="recruiter" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 :size="16" class="text-blue-600" /> Recruteur
                </h3>
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                    <Building2 :size="20" />
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">{{ recruiter.organization }}</p>
                    <p class="text-xs text-gray-500">{{ recruiter.name }}</p>
                  </div>
                </div>
                <div class="space-y-2 text-sm">
                  <a v-if="recruiter.email" :href="`mailto:${recruiter.email}`"
                    class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                    <Mail :size="14" /> {{ recruiter.email }}
                  </a>
                  <a v-if="recruiter.phone" :href="`tel:${recruiter.phone}`"
                    class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                    <Phone :size="14" /> {{ recruiter.phone }}
                  </a>
                </div>
              </div>

              <!-- Bloc Tags -->
              <div v-if="job.tags" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag :size="16" class="text-orange-500" /> Mots-clés
                </h3>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tag in splitLines(job.tags)" :key="tag"
                    class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    {{ tag }}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </template>
      </div>
    </main>
    <Footer />

    <!-- Lightbox plein écran -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="imageFullscreenOpen && hasJobImage"
          class="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          :aria-label="`Image de ${job?.title ?? 'offre'}`"
          @click.self="closeImageFullscreen">
          <button
            type="button"
            class="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Fermer"
            @click="closeImageFullscreen">
            <X :size="24" />
          </button>
          <img
            :src="jobImageUrl"
            :alt="String(job?.title ?? 'Offre')"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            @click.stop />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>