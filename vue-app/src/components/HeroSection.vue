<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Search, MapPin, ChevronDown } from 'lucide-vue-next'
import { themeAsset } from '@/composables/themeAsset'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'

const router = useRouter()
const taxonomyStore = useTaxonomyStore()
const { locations } = storeToRefs(taxonomyStore)

const searchKeyword = ref('')
const selectedLocation = ref('')

const heroImages = [
  themeAsset('/DSC_0577.png'),
  themeAsset('/DSC_0614.png'),
  themeAsset('/DSC_0633.png'),
]

const currentHeroImage = ref(0)
let intervalId = null

const startCarousel = () => {
  intervalId = setInterval(() => {
    currentHeroImage.value = (currentHeroImage.value + 1) % heroImages.length
  }, 6000)
}

function buildJobsQuery(keyword = '', location = '') {
  const query = {}
  const kw = keyword.trim()
  if (kw) query.keyword = kw
  if (location) query.location = location
  return query
}

function searchJobs(keyword = searchKeyword.value, location = selectedLocation.value) {
  router.push({ path: '/jobs', query: buildJobsQuery(keyword, location) })
}

function searchByKeyword(keyword) {
  searchKeyword.value = keyword
  searchJobs(keyword, selectedLocation.value)
}

onMounted(() => {
  startCarousel()
  taxonomyStore.ensureVocabularyLoaded('location').catch(() => {})
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <section class="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <div v-for="(img, index) in heroImages" :key="index" class="absolute inset-0 transition-opacity duration-1000" :class="index === currentHeroImage ? 'opacity-100' : 'opacity-0'">
        <img :src="img" :alt="'Bongolava background ' + (index + 1)" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-800/50 to-green-900/60 z-10"></div>
      </div>
    </div>

    <div class="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float z-0"></div>
    <div class="absolute bottom-20 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animation-delay-2000 z-0"></div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center py-12">
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
        Trouver un emploi local <br />
        <span class="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">devient simple</span>
      </h1>
      <p class="text-base md:text-lg text-white/90 max-w-2xl mx-auto mt-4 drop-shadow">
        BongolavaJobs connecte les talents locaux aux ambitions de demain.
      </p>

      <div class="max-w-3xl mx-auto mt-8">
        <form class="bg-white/20 backdrop-blur-md rounded-xl shadow-xl p-1.5 border border-white/30" @submit.prevent="searchJobs()">
          <div class="flex flex-col sm:flex-row gap-1.5">
            <div class="flex-1 flex items-center px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg">
              <Search :size="16" class="text-blue-600 mr-2 shrink-0" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="Ex: maçon, électricien..."
                class="bg-transparent outline-none w-full text-gray-800 placeholder:text-gray-500 text-sm"
              />
            </div>
            <div class="flex-1 relative flex items-center px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg">
              <MapPin :size="16" class="text-green-500 mr-2 shrink-0" />
              <select
                v-model="selectedLocation"
                class="bg-transparent outline-none w-full text-gray-800 text-sm appearance-none cursor-pointer pr-6"
              >
                <option value="">Toutes les villes</option>
                <option v-for="l in locations" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
              <ChevronDown :size="14" class="absolute right-3 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              class="bg-gradient-to-r from-blue-600 to-green-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all hover:shadow-md flex items-center justify-center gap-1"
            >
              <Search :size="14" /> Rechercher
            </button>
          </div>
        </form>
      </div>

      <div class="flex flex-wrap justify-center gap-2 mt-6 hidden">
        <button
          v-for="keyword in ['Maçon', 'Informaticien', 'Électricien', 'Commercial', 'Comptable']"
          :key="keyword"
          type="button"
          class="px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-white/40 rounded-full text-xs text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-500 hover:text-white hover:border-transparent transition-all shadow-sm"
          @click="searchByKeyword(keyword)"
        >
          {{ keyword }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
