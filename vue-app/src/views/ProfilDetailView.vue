<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowLeft, MapPin, Briefcase,
  Phone, Mail, Heart, Share2, Award,
  GraduationCap, Globe, Home, Calendar,
  ShieldCheck, Code2, Loader2
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { apiGet } from '@/composables/api'
import {
  asList,
  asEducationList,
  personInitials,
  displayText,
} from '@/utils/apiData'

const route = useRoute()
const router = useRouter()
const candidateId = route.params.id as string

const candidate = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const error = ref('')

const certifications = computed(() => asList(candidate.value?.certifications))
const languages = computed(() => asList(candidate.value?.languages))
const skills = computed(() => asList(candidate.value?.skills))
const education = computed(() =>
  asEducationList(candidate.value?.educations ?? candidate.value?.education),
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

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiGet<Record<string, unknown>>(`bongolava_job/candidates/${candidateId}`)
    if (!data || typeof data !== 'object' || !data.id) {
      error.value = 'Profil introuvable.'
      candidate.value = null
    } else {
      candidate.value = data
    }
  } catch {
    error.value = 'Profil introuvable.'
    candidate.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)

const goBack = () => router.back()
const isSaved = ref(false)
const toggleSave = () => { isSaved.value = !isSaved.value }
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <Header />

    <div v-if="loading" class="flex justify-center items-center py-32 pt-40">
      <Loader2 :size="36" class="animate-spin text-purple-500" />
    </div>
    <div v-else-if="error" class="text-center py-24 pt-32">
      <p class="text-red-500 font-semibold text-lg">{{ error }}</p>
      <button @click="load" class="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition">Réessayer</button>
    </div>
    <template v-else-if="candidate">

    <nav class="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button @click="goBack" class="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <div class="p-2 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition">
            <ArrowLeft :size="18" />
          </div>
          <span class="hidden sm:inline">Retour</span>
        </button>
        <div class="flex gap-2">
          <button @click="toggleSave" :class="`p-2.5 rounded-xl border transition ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'}`">
            <Heart :size="18" :fill="isSaved ? 'currentColor' : 'none'" />
          </button>
          <button class="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 transition">
            <Share2 :size="18" />
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-pink-500" />
            <div class="p-6 text-center">
              <div class="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4">
                <span>{{ initials }}</span>
              </div>
              <h1 class="text-xl font-bold text-gray-900 mb-1">{{ candidate.first_name }} {{ candidate.last_name }}</h1>
              <p class="text-purple-600 font-bold text-sm mb-3">{{ displayText(candidate.job_target) }}</p>
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-bold border border-green-100 mb-4">
                <ShieldCheck :size="12" /> Profil vérifié
              </div>
              <div class="space-y-3 text-left pt-4 border-t border-gray-100">
                <div v-if="candidate.location" class="flex items-center gap-3 text-gray-600">
                  <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center"><MapPin :size="14" class="text-gray-400" /></div>
                  <span class="font-medium text-sm">{{ candidate.location }}</span>
                </div>
                <div v-if="candidate.address" class="flex items-center gap-3 text-gray-600">
                  <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center"><Home :size="14" class="text-gray-400" /></div>
                  <span class="font-medium text-sm">{{ candidate.address }}</span>
                </div>
                <div v-if="candidate.age" class="flex items-center gap-3 text-gray-600">
                  <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center"><Calendar :size="14" class="text-gray-400" /></div>
                  <span class="font-medium text-sm">{{ candidate.age }} ans</span>
                </div>
                <div class="flex items-center gap-3 text-gray-600">
                  <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center"><Briefcase :size="14" class="text-gray-400" /></div>
                  <span class="font-medium text-sm">{{ experienceLabel }} d'expérience</span>
                </div>
                <div v-if="candidate.phone" class="flex items-center gap-3 text-gray-600">
                  <div class="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center"><Phone :size="14" class="text-gray-400" /></div>
                  <span class="font-medium text-sm">{{ candidate.phone }}</span>
                </div>
              </div>
            </div>
            <div v-if="candidate.email" class="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
              <a :href="`mailto:${candidate.email}`" class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-[10px] uppercase hover:opacity-90 transition shadow-md">
                <Mail :size="14" /> Contacter par email
              </a>
            </div>
          </div>

          <div v-if="certifications.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <Award :size="18" class="text-purple-600" />
              <h3 class="font-bold text-gray-900">Certifications</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="cert in certifications" :key="cert" class="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">{{ cert }}</span>
            </div>
          </div>

          <div v-if="languages.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <Globe :size="18" class="text-purple-600" />
              <h3 class="font-bold text-gray-900">Langues</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="lang in languages" :key="lang" class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">{{ lang }}</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 space-y-6">
          <div v-if="skills.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                <Code2 :size="18" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Compétences</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in skills" :key="skill" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">{{ skill }}</span>
            </div>
          </div>

          <div v-if="candidate.bio" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 class="text-lg font-bold text-gray-900 mb-3">À propos</h2>
            <p class="text-gray-600 text-sm leading-relaxed">{{ candidate.bio }}</p>
          </div>

          <div v-if="education.length" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                <GraduationCap :size="18" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Formation</h2>
            </div>
            <div class="space-y-4">
              <div v-for="(edu, index) in education" :key="index" class="p-4 bg-gray-50 rounded-xl border-l-4 border-purple-500">
                <p class="font-semibold text-gray-900">{{ edu.degree }}</p>
                <p v-if="edu.school || edu.year" class="text-gray-600 text-sm">{{ edu.school }}<template v-if="edu.school && edu.year"> • </template>{{ edu.year }}</p>
              </div>
            </div>
          </div>

          <div class="pt-4">
            <RouterLink to="/login" class="block w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all">
              Contacter ce talent
            </RouterLink>
            <p class="text-center text-xs text-gray-400 mt-2">Connectez-vous ou créez un compte pour contacter</p>
          </div>
        </div>
      </div>
    </main>

    </template>
    <Footer />
  </div>
</template>
