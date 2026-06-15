<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft, MapPin, Building2, Briefcase, Calendar,
  Heart, CheckCircle2, Zap, Share2,
  Phone, Mail, Tag, Award
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import JobApplyForm from '../components/JobApplyForm.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { asList } from '@/utils/apiData'

const route = useRoute()
const router = useRouter()
const jobId = route.params.id as string

const nodeStore = useNodeStore()
const { job, jobLoading, jobError } = storeToRefs(nodeStore)

const applySuccess = ref(false)
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

const requirements = computed(() => asList(job.value?.requirements))
const responsibilities = computed(() => asList(job.value?.responsibilities))
const tags = computed(() => asList(job.value?.tags))

async function load() {
  await nodeStore.fetchJobById(jobId)
}

const goBack = () => router.back()
const formatDate = (date?: string) => date
  ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—'

onMounted(load)
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
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{{ job.title }}</h1>
                  <p class="text-gray-600 mt-1 flex items-center gap-1">
                    <Building2 :size="14" /> {{ job.company }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">{{ job.contract_type ?? job.type }}</span>
                  <span v-if="job.is_urgent ?? job.urgent" class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                    <Zap :size="12" class="fill-current" /> Urgent
                  </span>
                  <span v-if="job.is_remote ?? job.remote" class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Remote</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                <span class="flex items-center gap-1"><MapPin :size="14" class="text-green-500" /> {{ job.location }}</span>
                <span class="flex items-center gap-1"><Calendar :size="14" /> Publiée le {{ formatDate(job.created_at) }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase :size="18" class="text-blue-600" /> Description
              </h2>
              <p class="text-gray-600 text-sm leading-relaxed">{{ job.description }}</p>
            </div>

            <!-- Responsabilités -->
            <div v-if="responsibilities.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 :size="18" class="text-green-500" /> Responsabilités
              </h2>
              <ul class="space-y-2">
                <li v-for="item in responsibilities" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 :size="14" class="text-green-500 shrink-0 mt-0.5" />
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Exigences -->
            <div v-if="requirements.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award :size="18" class="text-purple-500" /> Exigences
              </h2>
              <ul class="space-y-2">
                <li v-for="item in requirements" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                  <Award :size="14" class="text-blue-500 shrink-0 mt-0.5" />
                  {{ item }}
                </li>
              </ul>
            </div>

            <JobApplyForm
              :job-id="jobId"
              :job-title="String(job.title ?? '')"
              variant="section"
              :applied="applySuccess"
              @success="applySuccess = true"
            />

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
      <span class="font-medium text-gray-800 bg-gray-50 px-3 py-1 rounded-full text-xs">{{ job.contract_type ?? job.type }}</span>
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

  <JobApplyForm
    :job-id="jobId"
    :job-title="String(job.title ?? '')"
    variant="sidebar"
    :applied="applySuccess"
    @success="applySuccess = true"
  />
</div>

            <!-- Bloc Recruteur -->
            <div v-if="recruiter" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 :size="16" class="text-blue-600" /> Recruteur
              </h3>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                  <Building2 :size="20" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ recruiter.organization }}</p>
                  <p class="text-xs text-gray-500">{{ recruiter.name }}</p>
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <a v-if="recruiter.email" :href="`mailto:${recruiter.email}`" class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                  <Mail :size="14" /> {{ recruiter.email }}
                </a>
                <a v-if="recruiter.phone" :href="`tel:${recruiter.phone}`" class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                  <Phone :size="14" /> {{ recruiter.phone }}
                </a>
              </div>
            </div>

            <!-- Bloc Tags -->
            <div v-if="tags.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Tag :size="16" class="text-orange-500" /> Mots-clés
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="tag in tags" :key="tag" class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
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
  </div>
</template>