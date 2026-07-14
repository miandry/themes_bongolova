<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, User, Building2, CircleCheck, Loader2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useToast } from '@/composables/useToast'

const router  = useRouter()
const auth = useAuthStore()
const { loading } = storeToRefs(auth)
const toast = useToast()
const goBack  = () => router.back()

const role         = ref('candidat')   // 'candidat' | 'recruteur'
const firstName    = ref('')
const lastName     = ref('')
const organization = ref('')
const nifNumber    = ref('')
const cinNumber    = ref('')
const email        = ref('')
const password     = ref('')
const confirm      = ref('')
const showPwd      = ref(false)
const showCfm      = ref(false)
const accepted     = ref(false)
const error        = ref('')

async function onSubmit() {
  error.value = ''
  if (!email.value.trim() || !password.value || !confirm.value) {
    error.value = 'Veuillez remplir tous les champs.'
    return
  }
  if (role.value === 'candidat' && (!firstName.value.trim() || !lastName.value.trim())) {
    error.value = 'Prénom et nom sont requis pour un compte candidat.'
    return
  }
  if (role.value === 'recruteur' && !organization.value.trim()) {
    error.value = "Le nom de l'organisation est requis."
    return
  }
  if (role.value === 'recruteur' && !nifNumber.value.trim() && !cinNumber.value.trim()) {
    error.value = 'Au moins un des numéros NIF ou CIN est requis.'
    return
  }
  if (role.value === 'recruteur' && nifNumber.value.trim() && !/^\d{10}$/.test(nifNumber.value.trim())) {
    error.value = 'Le NIF doit contenir exactement 10 chiffres.'
    return
  }
  if (role.value === 'recruteur' && cinNumber.value.trim() && !/^\d{12}$/.test(cinNumber.value.trim())) {
    error.value = 'Le CIN doit contenir exactement 12 chiffres.'
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
  if (!accepted.value) {
    error.value = 'Veuillez accepter les conditions générales.'
    return
  }
  try {
    const result = role.value === 'recruteur'
      ? await auth.registerRecruiter({
          email: email.value.trim(),
          password: password.value,
          organization: organization.value.trim(),
          nif_number: nifNumber.value.trim(),
          cin_number: cinNumber.value.trim(),
          phone: '',
        })
      : await auth.registerCandidate({
          email: email.value.trim(),
          password: password.value,
          first_name: firstName.value.trim(),
          last_name: lastName.value.trim(),
          phone: '',
        })

    if (!result.ok) {
      error.value = result.message ?? "Erreur lors de l'inscription."
      return
    }

    if (role.value === 'recruteur') {
      toast.success(
        'Compte créé ! Vérifiez votre email pour confirmer votre adresse. Ensuite, un administrateur devra valider votre compte recruteur.',
        { persistent: true },
      )
    }
    else {
      toast.success(
        'Compte créé ! Vérifiez votre email et cliquez sur le lien de confirmation avant de vous connecter.',
        { persistent: true },
      )
    }
    await router.push('/login')
  } catch {
    error.value = 'Erreur de connexion. Veuillez réessayer.'
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

      <a
        href="/register"
        class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
      >
        <Sparkles :size="14" />
        INSCRIPTION
      </a>
    </div>

    <!-- Centered card -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10">

        <!-- Badge -->
        <div class="flex justify-center mb-5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Sparkles :size="12" />
            Inscription rapide
          </span>
        </div>

        <!-- Heading -->
        <h1 class="text-3xl font-black text-gray-900 text-center mb-1">Créer un compte</h1>
        <p class="text-gray-400 text-sm text-center mb-7">Inscription en 30 secondes</p>

        <!-- Role toggle -->
        <div class="flex rounded-xl border border-gray-200 overflow-hidden mb-6">
          <button
            type="button"
            @click="role = 'candidat'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all',
              role === 'candidat'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-inner'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            ]"
          >
            <User :size="15" />
            CANDIDAT
          </button>
          <button
            type="button"
            @click="role = 'recruteur'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all',
              role === 'recruteur'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-inner'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            ]"
          >
            <Building2 :size="15" />
            RECRUTEUR
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-5">

          <!-- Candidat: prénom + nom -->
          <div v-if="role === 'candidat'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Prénom</label>
              <input
                v-model="firstName"
                type="text"
                autocomplete="given-name"
                placeholder="Marie"
                class="w-full px-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nom</label>
              <input
                v-model="lastName"
                type="text"
                autocomplete="family-name"
                placeholder="Rakoto"
                class="w-full px-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Recruteur: organisation -->
          <div v-if="role === 'recruteur'">
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Organisation</label>
            <input
              v-model="organization"
              type="text"
              autocomplete="organization"
              placeholder="Société Agricole de Madagascar"
              class="w-full px-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          <!-- Recruteur: NIF et CIN -->
          <div v-if="role === 'recruteur'" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Numéro NIF</label>
              <input
                v-model="nifNumber"
                type="text"
                placeholder="1234567890"
                maxlength="10"
                class="w-full px-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Numéro CIN</label>
              <input
                v-model="cinNumber"
                type="text"
                placeholder="101234567890"
                maxlength="12"
                class="w-full px-4 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
            <div class="relative">
              <Mail :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Mot de passe</label>
            <div class="relative">
              <Lock :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••••••••"
                class="w-full pl-11 pr-12 py-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              <button type="button" @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                <EyeOff v-if="showPwd" :size="15" />
                <Eye v-else :size="15" />
              </button>
            </div>
          </div>

          <!-- Confirm password -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirmer mot de passe</label>
            <div class="relative">
              <Lock :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                v-model="confirm"
                :type="showCfm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
              <button type="button" @click="showCfm = !showCfm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                <EyeOff v-if="showCfm" :size="15" />
                <Eye v-else :size="15" />
              </button>
            </div>
          </div>

          <!-- Terms checkbox -->
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              v-model="accepted"
              type="checkbox"
              class="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 cursor-pointer flex-shrink-0"
            />
            <span class="text-sm text-gray-600 leading-relaxed">
              J'accepte les
              <a href="/mentions-legales" class="text-blue-600 font-semibold hover:underline">conditions générales</a>
              et la
              <a href="/privacy" class="text-blue-600 font-semibold hover:underline">politique de confidentialité</a>
            </span>
          </label>

          <!-- Error -->
          <p v-if="error" class="text-xs text-red-500 font-medium">{{ error }}</p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" :size="16" class="animate-spin" />
            <CircleCheck v-else :size="16" />
            <span>{{ loading ? 'Création en cours…' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <!-- Login link -->
        <div class="mt-5 text-center text-sm">
          <span class="text-gray-400 uppercase font-semibold tracking-wide text-xs">Déjà inscrit ?</span>
          <a href="/login" class="ml-2 text-blue-600 font-bold text-xs uppercase tracking-wide hover:underline">
            Se connecter
          </a>
        </div>

        <!-- Info note -->
        <div class="mt-5 p-4 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
          <p class="text-xs text-blue-600 leading-relaxed">
            🔒 Après inscription, vous devrez compléter votre profil pour postuler ou publier des offres.
          </p>
        </div>

        <!-- Divider + footer links -->
        <div class="mt-7 pt-5 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-400">
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
