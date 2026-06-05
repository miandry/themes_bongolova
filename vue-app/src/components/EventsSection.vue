<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, MapPin, ArrowRight } from 'lucide-vue-next'
import { apiGet } from '@/composables/api'

const events = ref([])
onMounted(async () => {
  try {
    const data = await apiGet('bongolava_job/events')
    events.value = Array.isArray(data) ? data.slice(0, 3) : []
  } catch { events.value = [] }
})

const parseDate = (event) => new Date(event.date + 'T' + (event.time ?? '00:00'))
const getMonth = (event) => parseDate(event).toLocaleString('fr', { month: 'short' })
const getDay = (event) => parseDate(event).getDate()
</script>

<template>
  <section class="py-16 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
    <div class="absolute top-0 left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full mb-3 backdrop-blur-sm border border-orange-200/30">
          <Calendar :size="12" class="text-orange-600" />
          <span class="text-[10px] font-bold text-orange-700 uppercase tracking-wider">À ne pas manquer</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-2">Événements à <span class="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">venir</span></h2>
        <p class="text-gray-500 text-sm max-w-2xl mx-auto">Formations, salons, ateliers – Tout près de chez vous</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="event in events" :key="event.id" class="group relative bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
          <div class="p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                <span class="text-xl font-bold">{{ getDay(event) }}</span>
                <span class="text-[9px] font-bold uppercase">{{ getMonth(event) }}</span>
              </div>
              <div>
                <span class="inline-block text-[10px] font-bold text-orange-700 uppercase bg-orange-50 px-2 py-0.5 rounded-full">{{ event.type }}</span>
                <h3 class="font-bold text-gray-900 line-clamp-1 mt-1 group-hover:text-orange-600 transition text-base">{{ event.title }}</h3>
              </div>
            </div>
            <p class="text-gray-500 text-xs mb-2 flex items-center gap-1"><MapPin :size="12" class="text-orange-500" /> {{ event.location }}</p>
            <p class="text-gray-600 text-xs line-clamp-2 mb-3 leading-relaxed">{{ event.description }}</p>
            <a :href="`/evenements/${event.id}`">
              <button class="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1 group/btn">
                S'inscrire
                <ArrowRight :size="12" class="group-hover/btn:translate-x-0.5 transition" />
              </button>
            </a>
          </div>
        </div>
      </div>

      <div class="text-center mt-10">
        <a href="/evenements">
          <button class="group relative px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all inline-flex items-center gap-2 overflow-hidden">
            <span class="relative z-10">Découvrir tous les événements</span>
            <ArrowRight :size="14" class="relative z-10 group-hover:translate-x-1 transition" />
          </button>
        </a>
      </div>
    </div>
  </section>
</template>