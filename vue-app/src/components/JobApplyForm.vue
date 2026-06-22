<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import {
  Send, CheckCircle2, Loader2, FileText,
  User, Mail, Phone, AlertCircle, LogIn,
  Building2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useNodeStore } from '@/stores/node/node.store'

const auth = useAuthStore()
const nodeStore = useNodeStore()
const { isLoggedIn, currentUser, authRole } = storeToRefs(auth)

const props = defineProps<{
  jobId: string | number
  jobTitle?: string
  /** Sidebar: CTA only. section: full form. */
  variant?: 'sidebar' | 'section'
  /** Set by parent when another instance submitted successfully. */
  applied?: boolean
}>()

const emit = defineEmits<{ success: [] }>()

const router = useRouter()
const route = useRoute()
const applying = ref(false)
const applySuccess = ref(false)
const applyError = ref('')
const showForm = ref(props.variant !== 'sidebar')

const form = ref({
  name: '',
  email: '',
  phone: '',
  cover_letter: '',
})
const cvFile = ref<File | null>(null)
const cvFileName = ref('')

// Computed pour vérifier si l'utilisateur peut postuler
const canApply = computed(() => {
  // Seul un candidat connecté peut postuler
  // Les recruteurs et admins ne peuvent pas postuler
  return isLoggedIn.value && authRole.value === 'candidate'
})

const needsLogin = computed(() => !isLoggedIn.value)
const wrongRole = computed(() => isLoggedIn.value && authRole.value !== 'candidate')
const isRecruiter = computed(() => isLoggedIn.value && authRole.value === 'recruiter')
const isAdmin = computed(() => isLoggedIn.value && authRole.value === 'admin')

// Computed pour savoir si on doit afficher le contenu de candidature
const shouldShowApplyContent = computed(() => {
  // Si l'utilisateur est un recruteur ou admin, on cache tout
  if (isRecruiter.value || isAdmin.value) return false
  // Sinon on affiche (candidat ou non connecté)
  return true
})

function prefill() {
  const u = currentUser.value
  if (!u) return
  if (!form.value.name) form.value.name = u.name ?? ''
  if (!form.value.email) form.value.email = u.email ?? ''
  if (!form.value.phone && u.phone) form.value.phone = String(u.phone)
}

watch(currentUser, prefill, { immediate: true })
watch(() => props.applied, (v) => { if (v) applySuccess.value = true }, { immediate: true })

function scrollToForm() {
  document.getElementById('postuler')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  showForm.value = true
}

function onCvChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (file && file.type !== 'application/pdf') {
    applyError.value = 'Le CV doit être au format PDF.'
    input.value = ''
    cvFile.value = null
    cvFileName.value = ''
    return
  }
  cvFile.value = file
  cvFileName.value = file?.name ?? ''
  applyError.value = ''
}

async function submit() {
  if (!canApply.value && !needsLogin.value) return
  if (needsLogin.value || !isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!canApply.value) {
    applyError.value = 'Connectez-vous avec un compte candidat pour postuler.'
    return
  }

  applyError.value = ''
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.phone.trim()) {
    applyError.value = 'Nom, email et téléphone sont requis.'
    return
  }

  applying.value = true
  const fd = new FormData()
  fd.append('name', form.value.name.trim())
  fd.append('email', form.value.email.trim())
  fd.append('phone', form.value.phone.trim())
  if (form.value.cover_letter.trim()) {
    fd.append('cover_letter', form.value.cover_letter.trim())
  }
  if (cvFile.value) {
    fd.append('cv', cvFile.value)
  }

  try {
    await nodeStore.applyToJob(props.jobId, fd)
    applySuccess.value = true
    emit('success')
  } catch (e) {
    applyError.value = e instanceof Error ? e.message : 'Erreur lors de la candidature.'
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <!-- Sidebar CTA - Caché pour les recruteurs et admins -->
  <div v-if="variant === 'sidebar' && shouldShowApplyContent" class="mt-6 pt-4 border-t border-gray-100">
    <div v-if="applySuccess"
      class="w-full py-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center flex items-center justify-center gap-2 text-sm">
      <CheckCircle2 :size="18" /> Candidature envoyée !
    </div>
    <template v-else>
      <button type="button"
        class="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
        @click="scrollToForm">
        <Send :size="20" /> Postuler
      </button>
      <p v-if="needsLogin" class="text-center text-xs text-gray-400 mt-2">
        <RouterLink to="/login" class="text-blue-600 hover:underline">Connectez-vous</RouterLink>
        pour postuler
      </p>
      <p v-else-if="wrongRole" class="text-center text-xs text-amber-600 mt-2">
        Compte recruteur — utilisez un compte candidat
      </p>
      <p v-else class="text-center text-xs text-gray-400 mt-2">Remplissez le formulaire ci-dessous</p>
    </template>
  </div>

  <!-- Full application form - Caché pour les recruteurs et admins -->
  <section v-else-if="variant !== 'sidebar' && shouldShowApplyContent" id="postuler"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 scroll-mt-28">
    <h2 class="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
      <Send :size="22" class="text-purple-600" />
      Postuler à cette offre
    </h2>
    <p v-if="jobTitle" class="text-gray-500 text-sm mb-6">{{ jobTitle }}</p>

    <div v-if="applySuccess" class="py-8 text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 :size="32" class="text-green-600" />
      </div>
      <p class="text-green-700 font-semibold text-lg">Candidature envoyée avec succès !</p>
      <p class="text-gray-500 text-sm mt-2">Le recruteur examinera votre dossier sous peu.</p>
      <RouterLink to="/mon-profil"
        class="inline-block mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
        Voir mes candidatures
      </RouterLink>
    </div>

    <div v-else-if="needsLogin" class="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <LogIn :size="36" class="text-gray-300 mx-auto mb-3" />
      <p class="text-gray-700 font-medium mb-2">Connectez-vous pour postuler</p>
      <p class="text-gray-500 text-sm mb-4">Créez un compte candidat ou connectez-vous pour envoyer votre candidature.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <RouterLink :to="{ path: '/login', query: { redirect: route.fullPath } }"
          class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          Se connecter
        </RouterLink>
        <RouterLink to="/register"
          class="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-white transition">
          Créer un compte
        </RouterLink>
      </div>
    </div>

    <div v-else-if="wrongRole" class="py-6 px-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
      <AlertCircle :size="20" class="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p class="text-amber-800 font-medium text-sm">Compte recruteur détecté</p>
        <p class="text-amber-700 text-xs mt-1">Seuls les comptes <strong>candidat</strong> peuvent postuler.
          Déconnectez-vous et reconnectez-vous avec un compte candidat.</p>
      </div>
    </div>

    <form v-else class="space-y-5" @submit.prevent="submit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="apply-name">
            Nom complet <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <User :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="apply-name" v-model="form.name" type="text" required placeholder="Jean Rakoto"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="apply-email">
            Email <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="apply-email" v-model="form.email" type="email" required placeholder="vous@example.mg"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400" />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="apply-phone">
          Téléphone <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <Phone :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input id="apply-phone" v-model="form.phone" type="tel" required placeholder="+261 34 00 000 00"
            class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="apply-letter">
          Lettre de motivation
        </label>
        <textarea id="apply-letter" v-model="form.cover_letter" rows="5"
          placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste…"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-y focus:ring-2 focus:ring-purple-300 focus:border-purple-400" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="apply-cv">
          CV (PDF, optionnel)
        </label>
        <label
          class="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition">
          <FileText :size="20" class="text-purple-500 shrink-0" />
          <span class="text-sm text-gray-600 truncate">
            {{ cvFileName || 'Choisir un fichier PDF…' }}
          </span>
          <input id="apply-cv" type="file" accept="application/pdf,.pdf" class="sr-only" @change="onCvChange" />
        </label>
      </div>

      <p v-if="applyError" class="text-sm text-red-500 flex items-center gap-1.5">
        <AlertCircle :size="16" /> {{ applyError }}
      </p>

      <button type="submit" :disabled="applying"
        class="w-full sm:w-auto min-w-[200px] py-3.5 px-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <Loader2 v-if="applying" :size="18" class="animate-spin" />
        <Send v-else :size="18" />
        {{ applying ? 'Envoi en cours…' : 'Envoyer ma candidature' }}
      </button>
    </form>
  </section>
</template>