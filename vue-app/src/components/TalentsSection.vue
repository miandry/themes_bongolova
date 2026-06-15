<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Users2, MapPin, CheckCircle2, ArrowRight } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user/user.store'
import { asList } from '@/utils/apiData'

const userStore = useUserStore()
const { topCandidates, candidatesLoading } = storeToRefs(userStore)

onMounted(() => {
  userStore.fetchCandidates({}).catch(() => {})
})

function getInitials(c: { first_name?: string; last_name?: string }) {
  const f = String(c.first_name ?? '').trim()
  const l = String(c.last_name ?? '').trim()
  return ((f[0] ?? '') + (l[0] ?? '')).toUpperCase() || '??'
}
</script>

<template>
  <section class="py-16 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mb-3 backdrop-blur-sm border border-purple-200/30">
          <Users2 :size="12" class="text-purple-600" />
          <span class="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Talents vérifiés</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-2">Top <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Talents</span> de la région</h2>
        <p class="text-gray-500 text-sm max-w-2xl mx-auto">Des profils qualifiés, prêts à rejoindre votre équipe</p>
      </div>

      <div v-if="candidatesLoading" class="text-center py-12 text-gray-400">Chargement…</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="candidate in topCandidates" :key="candidate.id" class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
          <div class="p-5 text-center">
            <div class="relative inline-block mb-3">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden mx-auto">
                <span>{{ getInitials(candidate) }}</span>
              </div>
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle2 :size="10" class="text-white" />
              </div>
            </div>
            <h3 class="text-base font-bold text-gray-900 group-hover:text-purple-600 transition">{{ candidate.first_name }} {{ candidate.last_name }}</h3>
            <p class="text-purple-600 text-xs font-medium mt-0.5 line-clamp-1">{{ candidate.job_target }}</p>
            <div class="flex items-center justify-center gap-1 text-gray-500 text-xs mt-2">
              <MapPin :size="10" class="text-purple-500" /> {{ candidate.location }}
            </div>
            <div class="flex flex-wrap justify-center gap-1 mt-3 mb-4">
              <span v-for="skill in asList(candidate.skills).slice(0, 3)" :key="skill" class="px-2 py-0.5 bg-gray-100 rounded-full text-[9px] text-gray-600">{{ skill }}</span>
            </div>
            <a :href="`/profils/${candidate.id}`">
              <button class="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1 group/btn">
                Voir le profil <ArrowRight :size="12" class="group-hover/btn:translate-x-0.5 transition" />
              </button>
            </a>
          </div>
        </div>
      </div>

      <div class="text-center mt-10">
        <a href="/profils">
          <button class="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all inline-flex items-center gap-2 overflow-hidden">
            <span class="relative z-10">Explorer tous les talents</span>
            <ArrowRight :size="14" class="relative z-10 group-hover:translate-x-1 transition" />
          </button>
        </a>
      </div>
    </div>
  </section>
</template>
