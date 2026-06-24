<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'
import {
  Search,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useUserStore } from '@/stores/user/user.store'

const router = useRouter()
const auth = useAuthStore()
const userStore = useUserStore()

const { authRole } = storeToRefs(auth)
const {
  recruiterApplications,
  recruiterApplicationsLoading,
  recruiterApplicationsTotal,
  recruiterApplicationsCurrentPage,
  recruiterApplicationsLastPage,
  recruiterApplicationsPerPage,
} = storeToRefs(userStore)

const keyword = ref('')
const status = ref('')
const jobTitle = ref('')
const updatingId = ref<number | null>(null)
const errorMessage = ref('')

function canAccess() {
  return authRole.value === 'recruiter' || authRole.value === 'admin'
}

async function load(page?: number) {
  errorMessage.value = ''
  try {
    await userStore.fetchRecruiterApplications({
      keyword: keyword.value || undefined,
      status: status.value || undefined,
      job_title: jobTitle.value || undefined,
      page: page ?? recruiterApplicationsCurrentPage.value,
      per_page: recruiterApplicationsPerPage.value,
    })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Erreur chargement des candidatures.'
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([keyword, status, jobTitle], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => load(1), 350)
})

async function changeStatus(appId: number, newStatus: string) {
  updatingId.value = appId
  try {
    await userStore.updateRecruiterApplicationStatus(appId, newStatus)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Erreur mise à jour statut.'
  } finally {
    updatingId.value = null
  }
}

function onStatusChange(appId: number, e: Event) {
  const target = e.target as HTMLSelectElement | null
  const value = target?.value ?? 'pending'
  void changeStatus(appId, value)
}

function formatDate(dt?: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()] ?? ''
  return `${day} ${month} ${d.getFullYear()}`
}

onMounted(async () => {
  if (!canAccess()) {
    router.push('/')
    return
  }
  await load(1)
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Header />

    <main class="flex-grow pt-20 pb-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <RouterLink to="/my-jobs"
          class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition">
          <ChevronLeft :size="16" />
          Retour à mes offres
        </RouterLink>

        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Mes <span class="text-orange-600">candidatures</span>
          </h1>
          <p class="text-gray-500 text-lg mt-1">
            {{ recruiterApplicationsTotal }} candidature{{ recruiterApplicationsTotal > 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div class="flex flex-col lg:flex-row gap-3">
            <div class="flex-1 relative">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
              <input v-model="keyword" type="text" placeholder="Rechercher (nom, email, téléphone, lettre...)"
                class="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 placeholder:text-gray-400" />
            </div>
            <div class="flex flex-wrap gap-2">
              <input v-model="jobTitle" type="text" placeholder="Filtrer par titre de l'offre"
                class="min-w-[160px] px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-gray-800 placeholder:text-gray-400" />
              <select v-model="status"
                class="min-w-[180px] pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                <option value="">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="reviewed">En cours</option>
                <option value="accepted">Acceptée</option>
                <option value="rejected">Refusée</option>
              </select>
              <button type="button" @click="load(1)"
                class="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-md transition flex items-center gap-2">
                <RefreshCw :size="16" />
                Rafraîchir
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="recruiterApplicationsLoading" class="flex justify-center items-center py-20">
          <Loader2 :size="36" class="animate-spin text-orange-500" />
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex gap-3">
          <AlertCircle class="text-red-500 shrink-0 mt-1" :size="20" />
          <div>
            <p class="font-bold text-red-900">Erreur</p>
            <p class="text-red-700 text-sm mt-1">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="recruiterApplications.length === 0"
          class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search :size="32" class="text-gray-300" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-1">Aucune candidature</h3>
          <p class="text-gray-500">Les candidatures liées à vos offres apparaîtront ici.</p>
        </div>

        <!-- List -->
        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr class="text-left text-gray-600">
                  <th class="px-5 py-3 font-semibold">Candidat</th>
                  <th class="px-5 py-3 font-semibold">Offre</th>
                  <th class="px-5 py-3 font-semibold">Date</th>
                  <th class="px-5 py-3 font-semibold">Statut</th>
                  <th class="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in recruiterApplications" :key="a.id" class="border-b border-gray-100 hover:bg-gray-50/40">
                  <td class="px-5 py-4">
                    <div class="font-bold text-gray-900">{{ a.name || '—' }}</div>
                    <div class="text-xs text-gray-500">{{ a.email || '—' }}<span v-if="a.phone"> • {{ a.phone }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="font-semibold text-gray-800">{{ a.job_title || `Job #${a.job_id}` }}</div>
                    <div class="text-xs text-gray-500">{{ a.job_location || '—' }}</div>
                  </td>
                  <td class="px-5 py-4 text-gray-700">{{ formatDate(a.created_at) }}</td>
                  <td class="px-5 py-4">
                    <select :disabled="updatingId === a.id"
                      class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-gray-700 text-sm font-semibold"
                      :value="a.status || 'pending'" @change="onStatusChange(a.id, $event)">
                      <option value="pending">En attente</option>
                      <option value="reviewed">En cours</option>
                      <option value="accepted">Acceptée</option>
                      <option value="rejected">Refusée</option>
                    </select>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <RouterLink v-if="a.profil_candidat_id" :to="`/profils/${a.profil_candidat_id}`"
                      class="inline-flex items-center gap-1 px-2 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                      <Eye :size="16" class="mr-1" />
                      Voir profil
                    </RouterLink>
                    <span v-else class="text-xs text-gray-400">Profil indisponible</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="recruiterApplicationsLastPage > 1" class="flex items-center justify-between mt-6">
          <p class="text-xs text-gray-500">
            Page {{ recruiterApplicationsCurrentPage }} / {{ recruiterApplicationsLastPage }}
          </p>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              :disabled="recruiterApplicationsCurrentPage <= 1 || recruiterApplicationsLoading"
              @click="load(recruiterApplicationsCurrentPage - 1)">
              Précédent
            </button>
            <button
              class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              :disabled="recruiterApplicationsCurrentPage >= recruiterApplicationsLastPage || recruiterApplicationsLoading"
              @click="load(recruiterApplicationsCurrentPage + 1)">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
