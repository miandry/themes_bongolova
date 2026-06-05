<script setup>
import { ref, computed } from 'vue'
import { 
  HelpCircle, Search, X, ChevronDown, ChevronUp, 
  Sparkles, Users, Building2, Star, Clock, 
  MessageCircle, Mail, Phone, Briefcase, 
  User, ShieldCheck, Smartphone
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

// --- Données de la FAQ ---
const faqCategories = ref([
  {
    id: 'candidats',
    title: 'Espace Candidats',
    icon: User,
    color: 'from-blue-500 to-blue-600',
    questions: [
      { q: 'Comment créer mon profil gratuitement ?', r: 'Cliquez sur "Créer un profil" depuis la page de connexion. Remplissez vos informations et téléchargez votre CV. L\'inscription est gratuite et rapide.', tags: ['inscription', 'débutant'] },
      { q: 'Puis-je modifier mes informations après inscription ?', r: 'Oui, vous pouvez gérer, modifier ou supprimer vos informations à tout moment depuis votre espace personnel.', tags: ['profil', 'modification'] },
      { q: 'Comment postuler à une offre d\'emploi ?', r: 'Connectez-vous, cliquez sur "Postuler" sur l\'offre qui vous intéresse. Votre CV sera transmis au recruteur.', tags: ['candidature', 'postuler'] }
    ]
  },
  {
    id: 'recruteurs',
    title: 'Espace Recruteurs',
    icon: Briefcase,
    color: 'from-green-500 to-emerald-600',
    questions: [
      { q: 'Comment publier une offre d\'emploi ?', r: 'Créez votre compte recruteur, accédez à votre tableau de bord et saisissez les informations de votre offre. La publication est instantanée.', tags: ['publication', 'offre'] },
      { q: 'Puis-je consulter l\'annuaire des candidats ?', r: 'Oui, les recruteurs ont accès à l\'annuaire complet avec filtres par métier, compétences et localisation.', tags: ['annuaire', 'recherche'] },
      { q: 'Combien coûte la publication d\'une offre ?', r: 'La publication est gratuite pour les entreprises de la région Bongolava.', tags: ['tarifs', 'gratuit'] }
    ]
  },
  {
    id: 'technique',
    title: 'Technique & Mobile',
    icon: Smartphone,
    color: 'from-orange-500 to-amber-600',
    questions: [
      { q: 'Le site fonctionne-t-il sur mobile ?', r: 'Oui, la plateforme est conçue en "Mobile-First" et optimisée pour les connexions mobiles.', tags: ['mobile', 'responsive'] },
      { q: 'Puis-je télécharger mon CV depuis mon téléphone ?', r: 'Oui, vous pouvez télécharger votre CV au format PDF depuis votre mobile.', tags: ['cv', 'téléchargement'] }
    ]
  },
  {
    id: 'securite',
    title: 'Sécurité & Confidentialité',
    icon: ShieldCheck,
    color: 'from-purple-500 to-purple-600',
    questions: [
      { q: 'Comment mes données sont-elles protégées ?', r: 'Vos données sont cryptées et stockées sur des serveurs sécurisés. Les mots de passe sont hachés.', tags: ['protection', 'cryptage'] },
      { q: 'Puis-je supprimer définitivement mon compte ?', r: 'Oui, vous pouvez supprimer votre compte depuis les paramètres. Vos données seront effacées.', tags: ['suppression', 'compte'] }
    ]
  }
])

// --- Statistiques ---
const stats = [
  { value: '5000+', label: 'Utilisateurs', icon: Users },
  { value: '150+', label: 'Entreprises', icon: Building2 },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '24/7', label: 'Support', icon: Clock }
]

// --- État ---
const searchQuery = ref('')
const activeCategory = ref(null)
const openItems = ref({})

// --- Filtrage ---
const filteredCategories = computed(() => {
  return faqCategories.value.map(category => ({
    ...category,
    questions: category.questions.filter(q => {
      const search = searchQuery.value.toLowerCase()
      return q.q.toLowerCase().includes(search) ||
        q.r.toLowerCase().includes(search) ||
        q.tags.some(tag => tag.toLowerCase().includes(search))
    })
  })).filter(category => category.questions.length > 0)
})

const hasResults = computed(() => filteredCategories.value.some(c => c.questions.length > 0))

// --- Actions ---
const toggleItem = (categoryId, index) => {
  const key = `${categoryId}-${index}`
  openItems.value[key] = !openItems.value[key]
}

const resetSearch = () => { searchQuery.value = '' }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- En-tête premium -->
    <section class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 pt-20 pb-16 overflow-hidden">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <HelpCircle :size="14" class="text-white" />
          <span class="text-white text-[10px] font-bold uppercase tracking-wider">Centre d'aide</span>
          <Sparkles :size="12" class="text-yellow-300" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Questions <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Fréquentes</span>
        </h1>
        <p class="text-white/80 text-lg max-w-2xl mx-auto mt-4">
          Tout ce que vous devez savoir sur Bongolava Jobs.
        </p>

        <!-- Barre de recherche -->
        <div class="mt-8 max-w-xl mx-auto">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une question..."
              class="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            />
            <button
              v-if="searchQuery"
              @click="resetSearch"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X :size="18" />
            </button>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="mt-10 flex flex-wrap justify-center gap-6">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="flex items-center justify-center gap-1 text-white">
              <component :is="stat.icon" :size="18" />
              <span class="text-xl font-bold">{{ stat.value }}</span>
            </div>
            <p class="text-white/60 text-[10px] font-bold uppercase tracking-wider">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Navigation par catégories -->
      <div class="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          @click="activeCategory = null"
          :class="`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!activeCategory ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`"
        >
          Toutes
        </button>
        <button
          v-for="cat in faqCategories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          :class="`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`"
        >
          <component :is="cat.icon" :size="14" />
          {{ cat.title.split(' ')[0] }}
        </button>
      </div>

      <!-- Résultats -->
      <div v-if="!hasResults && searchQuery" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search :size="24" class="text-gray-300" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun résultat</h3>
        <p class="text-gray-500 text-sm">Essayez avec d'autres mots-clés.</p>
        <button @click="resetSearch" class="mt-4 text-blue-600 text-sm font-bold hover:underline">Réinitialiser</button>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          v-show="!activeCategory || category.id === activeCategory"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
        >
          <!-- En-tête de catégorie -->
          <div class="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50/50">
            <div :class="`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} text-white flex items-center justify-center shadow-sm`">
              <component :is="category.icon" :size="18" />
            </div>
            <h2 class="text-lg font-bold text-gray-900">{{ category.title }}</h2>
            <span class="px-2 py-0.5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500">
              {{ category.questions.length }}
            </span>
          </div>

          <!-- Questions -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="(item, index) in category.questions"
              :key="index"
              :id="`${category.id}-${index}`"
            >
              <button
                @click="toggleItem(category.id, index)"
                class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span class="text-sm font-semibold text-gray-800 pr-4">{{ item.q }}</span>
                <component
                  :is="openItems[`${category.id}-${index}`] ? ChevronUp : ChevronDown"
                  :size="18"
                  :class="openItems[`${category.id}-${index}`] ? 'text-blue-600' : 'text-gray-400'"
                  class="shrink-0"
                />
              </button>

              <div v-if="openItems[`${category.id}-${index}`]" class="px-5 pb-5">
                <div class="w-10 h-0.5 bg-blue-600 mb-3 rounded-full"></div>
                <p class="text-gray-600 text-sm leading-relaxed">{{ item.r }}</p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span v-for="tag in item.tags" :key="tag" class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[9px] font-medium">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Contact -->
      <div class="mt-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 text-center">
        <div class="inline-flex p-3 bg-white/20 rounded-xl mb-4">
          <MessageCircle :size="24" class="text-white" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
        <p class="text-white/80 text-sm mb-5 max-w-md mx-auto">Notre équipe support est là pour vous aider.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/contact" class="px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-md">Contacter le support</a>
        </div>
        <div class="mt-5 pt-4 border-t border-white/20 flex flex-wrap justify-center gap-4 text-xs text-white/70">
          <span class="flex items-center gap-1"><Mail :size="12" /> support@bongolavajobs.mg</span>
          <span class="flex items-center gap-1"><Phone :size="12" /> +261 34 49 000 00</span>
          <span class="flex items-center gap-1"><Clock :size="12" /> Lun-Ven, 8h-17h</span>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>