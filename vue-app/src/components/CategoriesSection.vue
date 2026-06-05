<script setup>
import { Leaf, Globe, Building2, GraduationCap, Cpu, Sun, Paintbrush, Truck, Briefcase } from 'lucide-vue-next'

const categories = [
  { name: "Agriculture & Élevage", icon: Leaf, count: 3, color: "from-green-500 to-emerald-600" },
  { name: "Tourisme & Hôtellerie", icon: Globe, count: 2, color: "from-cyan-500 to-blue-500" },
  { name: "Industrie & BTP", icon: Building2, count: 1, color: "from-orange-500 to-amber-600" },
  { name: "Éducation & Santé", icon: GraduationCap, count: 0, color: "from-red-500 to-pink-500" },
  { name: "Informatique & Commerce", icon: Cpu, count: 4, color: "from-blue-500 to-indigo-600" },
  { name: "Environnement & Énergie", icon: Sun, count: 0, color: "from-yellow-500 to-amber-600" },
  { name: "Artisanat & Création", icon: Paintbrush, count: 0, color: "from-purple-500 to-pink-500" },
  { name: "Transports & Logistique", icon: Truck, count: 2, color: "from-slate-500 to-gray-600" },
  { name: "Services & Administration", icon: Briefcase, count: 0, color: "from-teal-500 to-cyan-500" },
]
</script>

<template>
  <section class="py-16 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden -mt-6">
    <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    <div class="max-w-7xl mx-auto relative z-10">
      <div class="text-center mb-14">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full mb-5 backdrop-blur-sm border border-blue-200/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span class="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Explorer par secteur</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Secteurs qui <span class="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">recrutent</span>
        </h2>
        <p class="text-gray-500 max-w-2xl mx-auto text-lg">
          Trouvez votre futur métier dans les domaines les plus dynamiques de Madagascar
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="cat in categories" :key="cat.name" class="group relative cursor-pointer">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div class="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div class="relative inline-block mb-5">
              <div :class="`absolute inset-0 bg-gradient-to-r ${cat.color} rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300`" style="transform: scale(1.2);"></div>
              <div :class="`w-16 h-16 mx-auto bg-gradient-to-r ${cat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative z-10`">
                <component :is="cat.icon" :size="28" class="text-white" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{{ cat.name }}</h3>
            <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span v-if="cat.count > 0"><span class="font-semibold text-gray-700">{{ cat.count }}</span><span class="text-gray-500 text-xs"> offre{{ cat.count !== 1 ? 's' : '' }}</span></span>
              <span v-else class="text-gray-500 text-xs">Bientôt disponible</span>
            </div>
            <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-blue-500"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>