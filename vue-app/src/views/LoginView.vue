<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-vue-next'
import { login } from '@/composables/useAuth'

const router = useRouter()
const route  = useRoute()

const email    = ref('')
const password = ref('')
const showPwd  = ref(false)
const loading  = ref(false)
const error    = ref('')

const goBack = () => router.back()

async function onSubmit() {
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }
  loading.value = true
  try {
    const result = await login(email.value.trim(), password.value)
    if (!result.ok) {
      error.value = result.message
      return
    }
    // Redirect: honour ?redirect= param, or go to homepage
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } catch {
    error.value = 'Erreur réseau. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Full-page gradient background -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">

    <!-- Minimal top bar -->
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

    <!-- Centered card -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10">

        <!-- Badge -->
        <div class="flex justify-center mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles :size="12" />
            Accès sécurisé
          </span>
        </div>

        <!-- Heading -->
        <h1 class="text-3xl font-black text-gray-900 text-center mb-1">Bienvenue</h1>
        <p class="text-gray-500 text-sm text-center mb-8">
          Connectez-vous à votre espace (candidat ou recruteur)
        </p>

        <form @submit.prevent="onSubmit" class="space-y-5">

          <!-- Email -->
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
                placeholder="admin@bongolavajobs.mg"
                class="w-full pl-11 pr-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Mot de passe
              </label>
              <a href="/user/password" class="text-xs font-semibold text-blue-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <div class="relative">
              <Lock :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••••••••"
                class="w-full pl-11 pr-12 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                :aria-label="showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <EyeOff v-if="showPwd" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- Error -->
          <p v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <span>{{ loading ? 'Connexion en cours…' : '→  Se connecter' }}</span>
          </button>
        </form>

        <!-- Register link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400 mb-1">Nouveau sur Bongolava Jobs ?</p>
          <a href="/register" class="text-sm font-bold text-blue-600 hover:underline">
            Créer un compte gratuitement →
          </a>
        </div>

        <!-- Divider + footer links -->
        <div class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-400">
          <a href="/mentions-legales" class="hover:text-gray-600 transition">Mentions légales</a>
          <span>•</span>
          <a href="/cookies" class="hover:text-gray-600 transition">Cookies</a>
          <span>•</span>
          <a href="/privacy" class="hover:text-gray-600 transition">Confidentialité</a>
        </div>

      </div>
    </div>
  </div>
</template>
