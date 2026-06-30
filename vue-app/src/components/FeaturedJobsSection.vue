<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { MapPin, Briefcase, Heart, Zap, ArrowRight, Building2 } from 'lucide-vue-next'
import { useNodeStore } from '@/stores/node/node.store'
import { themeAsset } from '@/composables/themeAsset'

const nodeStore = useNodeStore()
const { featuredJobs } = storeToRefs(nodeStore)

onMounted(() => {
  nodeStore.fetchFeaturedJobs().catch(() => {})
})

const formatSalary = (job: { salary?: string }) => job.salary
</script>

<template>
  <section id="jobs-section" class="py-16 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full mb-2 backdrop-blur-sm border border-blue-200/30">
            <Briefcase :size="12" class="text-blue-600" />
            <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Dernières opportunités</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900">Offres à la <span class="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">une</span></h2>
          <p class="text-gray-500 text-sm mt-1">Les meilleures offres, sélectionnées pour vous</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="job in featuredJobs" :key="job.id" class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
          <img :src="String(job.image_url ?? themeAsset('/job-placeholder.svg'))" :alt="String(job.title ?? 'Offre')"
            class="w-full h-36 object-cover border-b border-gray-100" />
          <div class="p-5">
            <div class="flex justify-between items-start mb-3">
              <div class="flex gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md text-[10px] font-bold text-blue-700">{{ job.contract_type ?? job.type }}</span>
                <span v-if="job.is_urgent ?? job.urgent" class="px-2 py-0.5 bg-gradient-to-r from-orange-100 to-orange-200 rounded-md text-[10px] font-bold text-orange-700 flex items-center gap-0.5"><Zap :size="10" class="fill-current" /> Urgent</span>
                <span v-if="job.is_remote ?? job.remote" class="px-2 py-0.5 bg-gradient-to-r from-green-100 to-green-200 rounded-md text-[10px] font-bold text-green-700">🌍 Remote</span>
              </div>
              <button class="p-1.5 rounded-full hover:bg-red-50 transition-all duration-200 hidden">
                <Heart :size="16" class="text-gray-300 hover:text-red-400" />
              </button>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition line-clamp-2">{{ job.title }}</h3>
            <p class="text-gray-500 text-xs mb-2 flex items-center gap-1"><Building2 :size="12" class="text-gray-400" />{{ job.company }}</p>
            <div class="flex items-center gap-1.5 text-gray-400 text-xs mb-3"><MapPin :size="12" class="text-green-500" /> {{ job.location }}</div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p class="text-[10px] text-gray-400 mb-0.5">Salaire</p>
                <p class="text-green-600 font-bold text-sm">{{ formatSalary(job) }}</p>
              </div>
              <RouterLink :to="`/jobs/${job.id}`">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-green-500 transition-all duration-300 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 group-hover:text-white"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-10">
        <RouterLink to="/jobs" class="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all inline-flex items-center gap-2 overflow-hidden">
          <span class="relative z-10">Explorer toutes les offres</span>
          <ArrowRight :size="14" class="relative z-10 group-hover:translate-x-1 transition" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
