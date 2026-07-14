<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Loader2, MailCheck, Sparkles } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { loading } = storeToRefs(auth)
const toast = useToast()

const status = ref<'pending' | 'success' | 'error'>('pending')
const message = ref('Vérification de votre adresse email…')

const goBack = () => router.back()

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token.trim() : ''
  if (!token) {
    status.value = 'error'
    message.value = 'Lien de vérification invalide : jeton manquant.'
    toast.error(message.value, { persistent: true })
    return
  }

  const result = await auth.verifyEmail(token)
  if (!result.ok) {
    status.value = 'error'
    message.value = result.message ?? 'Lien de vérification invalide ou expiré.'
    toast.error(message.value, { persistent: true })
    return
  }

  status.value = 'success'
  if (result.code === 'awaiting_admin_validation' || result.role === 'recruiter') {
    message.value = 'Email vérifié. Votre compte recruteur est maintenant en attente de validation par un administrateur.'
    toast.success(message.value, { persistent: true })
  }
  else {
    message.value = 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.'
    toast.success(message.value, { persistent: true })
  }
})
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
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10 text-center">
        <div class="flex justify-center mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
            <MailCheck :size="12" />
            Vérification email
          </span>
        </div>

        <div v-if="status === 'pending' || loading" class="flex flex-col items-center gap-4 py-6">
          <Loader2 :size="32" class="animate-spin text-blue-600" />
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>

        <template v-else>
          <h1 class="text-2xl font-black text-gray-900 mb-3">
            {{ status === 'success' ? 'Email confirmé' : 'Échec de la vérification' }}
          </h1>
          <p class="text-sm text-gray-600 mb-8">{{ message }}</p>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:opacity-95 transition-all"
          >
            Aller à la connexion
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>
