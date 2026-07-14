<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Mail, Sparkles, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const { loading } = storeToRefs(auth)
const toast = useToast()

const email = ref('')
const error = ref('')
const sent = ref(false)

const goBack = () => router.back()

async function onSubmit() {
  error.value = ''
  if (!email.value.trim()) {
    error.value = 'Veuillez saisir votre adresse email.'
    return
  }
  const result = await auth.forgotPassword(email.value.trim())
  if (!result.ok) {
    error.value = result.message ?? 'Erreur lors de l’envoi.'
    return
  }
  sent.value = true
  toast.success(
    'Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé. Vérifiez votre boîte mail.',
    { persistent: true },
  )
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
    <div class="flex items-center justify-between px-6 py-4">
      <button
        type="button"
        @click="goBack"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
      >
        <ArrowLeft :size="14" />
        RETOUR
      </button>
      <RouterLink
        to="/login"
        class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
      >
        <Sparkles :size="14" />
        CONNEXION
      </RouterLink>
    </div>

    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10">
        <div class="flex justify-center mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Mail :size="12" />
            Mot de passe oublié
          </span>
        </div>

        <h1 class="text-3xl font-black text-gray-900 text-center mb-1">Réinitialiser</h1>
        <p class="text-gray-500 text-sm text-center mb-8">
          Entrez votre email : nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>

        <div v-if="sent" class="space-y-5 text-center">
          <p class="text-sm text-gray-600">
            Un email a été envoyé si un compte correspond à
            <strong>{{ email }}</strong>.
          </p>
          <RouterLink
            to="/login"
            class="inline-flex w-full items-center justify-center py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
          >
            Retour à la connexion
          </RouterLink>
        </div>

        <form v-else @submit.prevent="onSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div class="relative">
              <Mail :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="vous@exemple.com"
                class="w-full pl-11 pr-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <p v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span>{{ loading ? 'Envoi…' : 'Envoyer le lien' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <RouterLink to="/login" class="text-sm font-bold text-blue-600 hover:underline">
            ← Retour à la connexion
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
