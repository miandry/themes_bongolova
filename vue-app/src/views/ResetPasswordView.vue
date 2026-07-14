<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ArrowLeft, Lock, Eye, EyeOff, Sparkles, Loader2, KeyRound } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { loading } = storeToRefs(auth)
const toast = useToast()

const token = ref('')
const password = ref('')
const confirm = ref('')
const showPwd = ref(false)
const showCfm = ref(false)
const error = ref('')
const tokenState = ref<'checking' | 'valid' | 'invalid'>('checking')
const done = ref(false)

const goBack = () => router.back()

onMounted(async () => {
  token.value = typeof route.query.token === 'string' ? route.query.token.trim() : ''
  if (!token.value) {
    tokenState.value = 'invalid'
    error.value = 'Lien invalide : jeton manquant.'
    toast.error(error.value, { persistent: true })
    return
  }
  const check = await auth.validateResetToken(token.value)
  if (!check.ok) {
    tokenState.value = 'invalid'
    error.value = check.message ?? 'Lien invalide ou expiré.'
    toast.error(error.value, { persistent: true })
    return
  }
  tokenState.value = 'valid'
})

async function onSubmit() {
  error.value = ''
  if (!password.value || !confirm.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  const result = await auth.resetPassword(token.value, password.value, confirm.value)
  if (!result.ok) {
    error.value = result.message ?? 'Impossible de réinitialiser le mot de passe.'
    toast.error(error.value, { persistent: true })
    return
  }
  done.value = true
  toast.success('Mot de passe mis à jour. Vous pouvez vous connecter.', { persistent: true })
  await router.push('/login')
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
            <KeyRound :size="12" />
            Nouveau mot de passe
          </span>
        </div>

        <h1 class="text-3xl font-black text-gray-900 text-center mb-1">Nouveau mot de passe</h1>
        <p class="text-gray-500 text-sm text-center mb-8">
          Choisissez un mot de passe sécurisé (8 caractères minimum).
        </p>

        <div v-if="tokenState === 'checking'" class="flex flex-col items-center gap-4 py-8">
          <Loader2 :size="28" class="animate-spin text-blue-600" />
          <p class="text-sm text-gray-500">Vérification du lien…</p>
        </div>

        <div v-else-if="tokenState === 'invalid'" class="space-y-5 text-center">
          <p class="text-sm text-red-600">{{ error || 'Lien invalide ou expiré.' }}</p>
          <RouterLink to="/forgot-password" class="text-sm font-bold text-blue-600 hover:underline">
            Demander un nouveau lien
          </RouterLink>
        </div>

        <form v-else-if="!done" @submit.prevent="onSubmit" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Nouveau mot de passe
            </label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full pl-11 pr-12 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                @click="showPwd = !showPwd"
              >
                <EyeOff v-if="showPwd" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Confirmer
            </label>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="confirm"
                :type="showCfm ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full pl-11 pr-12 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                @click="showCfm = !showCfm"
              >
                <EyeOff v-if="showCfm" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <p v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span>{{ loading ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
