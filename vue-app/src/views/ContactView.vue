<script setup lang="ts">
import { ref } from 'vue'
import {
  Mail, Phone, MapPin,
  Send, CheckCircle2, Loader2,
  Sparkles, MessageCircle, HelpCircle
} from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useNodeStore } from '@/stores/node/node.store'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast'

const nodeStore = useNodeStore()
const { contactLoading, contactSuccess, contactError } = storeToRefs(nodeStore)
const toast = useToast()

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.message.trim()) {
    toast.error('Veuillez remplir tous les champs obligatoires.', { persistent: true })
    return
  }
  try {
    await nodeStore.submitContact({
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      subject: form.value.subject || 'Message',
      message: form.value.message.trim(),
    })
    toast.success('Message envoyé avec succès. Nous vous répondrons rapidement.')
    form.value = { name: '', email: '', subject: '', message: '' }
  }
  catch {
    toast.error(
      contactError.value ?? "Erreur lors de l'envoi. Veuillez réessayer.",
      { persistent: true },
    )
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <!-- En-tête premium -->
    <section class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 pt-20 pb-16 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <Sparkles :size="14" class="text-yellow-300" />
          <span class="text-white text-[10px] font-bold uppercase tracking-wider">Besoin d'aide ?</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Contactez <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">l'équipe</span>
        </h1>
        <p class="text-white/80 text-lg max-w-2xl mx-auto mt-4">
          Une question, un partenariat ou une suggestion ? Laissez-nous un message.
        </p>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- COLONNE DE GAUCHE : Formulaire (8 colonnes) -->
        <div class="lg:col-span-8">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle :size="20" class="text-blue-600" />
              Envoyez-nous un message
            </h2>
            
            <form @submit="handleSubmit" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Nom -->
                <div>
                  <label class="text-sm font-medium text-gray-700 mb-1.5 block">Votre nom <span class="text-red-500">*</span></label>
                  <input 
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Jean Dupont"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="text-sm font-medium text-gray-700 mb-1.5 block">Votre email <span class="text-red-500">*</span></label>
                  <input 
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>

              <!-- Sujet -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Sujet</label>
                <select 
                  v-model="form.subject"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="info">Demande d'information</option>
                  <option value="partner">Proposition de partenariat</option>
                  <option value="job">Signalement d'offre</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <!-- Message -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Votre message <span class="text-red-500">*</span></label>
                <textarea 
                  v-model="form.message"
                  rows="5"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Écrivez votre message ici..."
                ></textarea>
              </div>

              <!-- Bouton d'envoi -->
              <button 
                type="submit"
                :disabled="contactLoading"
                class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="contactLoading" :size="18" class="animate-spin" />
                <Send v-else :size="18" />
                <span>{{ contactLoading ? 'Envoi...' : 'Envoyer le message' }}</span>
              </button>

              <!-- Message de succès -->
              <div v-if="contactSuccess" class="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                <CheckCircle2 :size="18" class="shrink-0" />
                Votre message a été envoyé avec succès. Nous vous répondrons rapidement.
              </div>
            </form>
          </div>
        </div>

        <!-- COLONNE DE DROITE : Informations (4 colonnes) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Carte "Coordonnées" -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-5">Nos coordonnées</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Phone :size="18" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold">Téléphone</p>
                  <a href="tel:+261344900000" class="text-gray-800 font-medium hover:text-blue-600 transition">+261 34 49 000 00</a>
                </div>
              </div>

              <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition">
                <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                  <Mail :size="18" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold">Email</p>
                  <a href="mailto:hello@bongolavajobs.mg" class="text-gray-800 font-medium hover:text-green-600 transition">hello@bongolavajobs.mg</a>
                </div>
              </div>

              <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition">
                <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <MapPin :size="18" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-bold">Adresse</p>
                  <p class="text-gray-800 font-medium">Tsiroanomandidy, Bongolava</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte "Besoin d'aide ?" -->
          <div class="bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <HelpCircle :size="20" />
              </div>
              <h3 class="text-lg font-bold">Besoin d'aide ?</h3>
            </div>
            <p class="text-white/90 text-sm mb-4">
              Consultez notre FAQ ou écrivez au support pour une assistance personnalisée.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a href="/faq" class="flex-1 px-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-lg text-center text-sm font-medium hover:bg-white/30 transition">
                FAQ
              </a>
              <a href="mailto:hello@bongolavajobs.mg" class="flex-1 px-4 py-2.5 bg-white text-blue-600 rounded-lg text-center text-sm font-medium hover:shadow-lg transition">
                Support
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>