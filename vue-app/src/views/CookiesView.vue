<script setup>
import { ref } from 'vue'
import { ArrowLeft, Cookie, CheckCircle2, XCircle } from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

// --- État des préférences cookies ---
const preferences = ref({
  necessary: true,
  analytics: false,
  marketing: false
})

const showSuccess = ref(false)

const savePreferences = () => {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-4xl mx-auto">
        <!-- Bouton retour -->
        <button @click="goBack" class="flex items-center gap-2 text-gray-500 hover:text-green-600 transition mb-6 text-sm">
          <ArrowLeft :size="16" />
          Retour
        </button>

        <!-- En-tête -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Cookie :size="24" class="text-white" />
          </div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">Gestion des cookies</h1>
        </div>

        <div class="space-y-6">
          <!-- Introduction -->
          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <p class="text-gray-600 text-sm leading-relaxed">
              Bongolava Jobs utilise des cookies pour améliorer votre expérience sur notre plateforme, analyser les visites et personnaliser nos contenus. Vous pouvez choisir à tout moment de modifier vos préférences ci-dessous.
            </p>
          </section>

          <!-- Préférences -->
          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Vos préférences</h2>
            
            <div class="space-y-4">
              <!-- Cookies nécessaires -->
              <div class="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">Cookies essentiels</h3>
                  <p class="text-xs text-gray-500">Ces cookies sont nécessaires au bon fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Toujours actifs</span>
              </div>

              <!-- Cookies analytics -->
              <div class="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">Cookies analytiques</h3>
                  <p class="text-xs text-gray-500">Ces cookies nous permettent de comprendre comment les visiteurs interagissent avec le site pour améliorer son performance.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="preferences.analytics" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <!-- Cookies marketing -->
              <div class="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">Cookies marketing</h3>
                  <p class="text-xs text-gray-500">Ces cookies nous aident à diffuser des publicités pertinentes sur d'autres sites.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="preferences.marketing" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            <button 
              @click="savePreferences"
              class="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-bold hover:shadow-lg transition"
            >
              Enregistrer mes préférences
            </button>

            <!-- Message de succès -->
            <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle2 :size="16" />
              Vos préférences ont été enregistrées avec succès.
            </div>
          </section>

          <!-- Liste détaillée des cookies (optionnelle) -->
          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Liste des cookies utilisés</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th class="px-4 py-2">Nom</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Durée</th>
                    <th class="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr>
                    <td class="px-4 py-2">bongolava_auth</td>
                    <td class="px-4 py-2 text-green-600">Essentiel</td>
                    <td class="px-4 py-2">30 jours</td>
                    <td class="px-4 py-2 text-gray-500">Session d'authentification sécurisée (httpOnly, Secure, SameSite Strict)</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2">analytics_id</td>
                    <td class="px-4 py-2 text-blue-600">Analytique</td>
                    <td class="px-4 py-2">1 an</td>
                    <td class="px-4 py-2 text-gray-500">Suivi des visites et performances</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2">marketing_opt</td>
                    <td class="px-4 py-2 text-orange-600">Marketing</td>
                    <td class="px-4 py-2">6 mois</td>
                    <td class="px-4 py-2 text-gray-500">Personnalisation des publicités</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>