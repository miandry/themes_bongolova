<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  User, Mail, Phone, MapPin, Briefcase, Globe, Github,
  Linkedin, Edit3, Save, X, Upload, FileText, Trash2,
  Building2, CheckCircle2, Award, BookOpen, Languages,
  Camera, Link2, LogOut, ChevronRight, Loader2,
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { isLoggedIn, currentUser, authRole, logout } from '@/composables/useAuth'
import { apiGet, apiPost, apiPostForm, apiPut } from '@/composables/api'

const router = useRouter()

// ── Redirect if not logged in ─────────────────────────────────────────────────
if (!isLoggedIn.value) { router.replace('/login') }

// ── State ─────────────────────────────────────────────────────────────────────
const loading  = ref(true)
const saving   = ref(false)
const error    = ref('')
const saveMsg  = ref('')
const editing  = ref(false)

const profile  = ref<Record<string, unknown> | null>(null)

// ── Edit form ─────────────────────────────────────────────────────────────────
const form = ref<Record<string, unknown>>({})

function startEdit() {
  form.value = { ...profile.value }
  editing.value = true
  saveMsg.value = ''
}
function cancelEdit() { editing.value = false; form.value = {} }

// ── Load profile ──────────────────────────────────────────────────────────────
async function loadProfile() {
  loading.value = true
  error.value   = ''
  try {
    const path = authRole.value === 'recruiter'
      ? 'bongolava_job/my-recruiter-profile'
      : 'bongolava_job/my-candidate-profile'
    profile.value = await apiGet<Record<string, unknown>>(path)
  } catch (e) {
    error.value = (e instanceof Error ? e.message : 'Profil introuvable.') +
      ' — Complétez votre profil via le formulaire ci-dessous.'
    profile.value = {}
  } finally {
    loading.value = false
  }
}

// ── Save profile ──────────────────────────────────────────────────────────────
async function saveProfile() {
  saving.value  = true
  saveMsg.value = ''
  error.value   = ''
  try {
    const path = authRole.value === 'recruiter'
      ? 'bongolava_job/my-recruiter-profile'
      : 'bongolava_job/my-candidate-profile'
    profile.value = await apiPut<Record<string, unknown>>(path, form.value)
    editing.value = false
    saveMsg.value = 'Profil mis à jour avec succès !'
    setTimeout(() => { saveMsg.value = '' }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

// ── Photo upload (candidate) ──────────────────────────────────────────────────
const photoInput = ref<HTMLInputElement | null>(null)
const photoLoading = ref(false)

async function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoLoading.value = true
  try {
    const fd = new FormData(); fd.append('photo', file)
    const res = await apiPostForm<{ photo_path: string }>('bongolava_job/candidate/upload-photo', fd)
    if (profile.value) profile.value = { ...profile.value, photo_path: res.photo_path }
  } catch (e) { error.value = e instanceof Error ? e.message : 'Erreur upload photo.' }
  finally { photoLoading.value = false }
}

// ── CV upload / delete (candidate) ───────────────────────────────────────────
const cvInput = ref<HTMLInputElement | null>(null)
const cvLoading  = ref(false)
const cvDeleting = ref(false)

async function onCvChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  cvLoading.value = true
  try {
    const fd = new FormData(); fd.append('cv', file)
    const res = await apiPostForm<{ cv_path: string }>('bongolava_job/candidate/upload-cv', fd)
    if (profile.value) profile.value = { ...profile.value, cv_path: res.cv_path }
  } catch (e) { error.value = e instanceof Error ? e.message : 'Erreur upload CV.' }
  finally { cvLoading.value = false }
}

async function deleteCV() {
  if (!confirm('Supprimer le CV ?')) return
  cvDeleting.value = true
  try {
    await apiPost('bongolava_job/candidate/delete-cv', {})
    if (profile.value) profile.value = { ...profile.value, cv_path: null }
  } catch (e) { error.value = e instanceof Error ? e.message : 'Erreur suppression CV.' }
  finally { cvDeleting.value = false }
}

// ── Logo upload (recruiter) ───────────────────────────────────────────────────
const logoInput = ref<HTMLInputElement | null>(null)
const logoLoading = ref(false)

async function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  logoLoading.value = true
  try {
    const fd = new FormData(); fd.append('logo', file)
    const res = await apiPostForm<{ logo_path: string }>('bongolava_job/recruiter/upload-logo', fd)
    if (profile.value) profile.value = { ...profile.value, logo_path: res.logo_path }
  } catch (e) { error.value = e instanceof Error ? e.message : 'Erreur upload logo.' }
  finally { logoLoading.value = false }
}

// ── Applications (candidate) ──────────────────────────────────────────────────
const applications = ref<Record<string, unknown>[]>([])
const appsLoading  = ref(false)

async function loadApplications() {
  if (authRole.value !== 'candidate') return
  appsLoading.value = true
  try {
    applications.value = await apiGet<Record<string, unknown>[]>('bongolava_job/candidate/applications')
  } catch { applications.value = [] }
  finally { appsLoading.value = false }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials() {
  const name = currentUser.value?.name ?? ''
  return name.split(/[\s@]/)[0].slice(0, 2).toUpperCase() || 'U'
}

function roleLabel() {
  if (authRole.value === 'recruiter') return 'Recruteur'
  if (authRole.value === 'admin')     return 'Admin'
  return 'Candidat'
}

function roleColor() {
  if (authRole.value === 'recruiter') return 'bg-blue-100 text-blue-700'
  if (authRole.value === 'admin')     return 'bg-purple-100 text-purple-700'
  return 'bg-green-100 text-green-700'
}

function statusColor(status: unknown) {
  if (status === 'accepted') return 'bg-green-100 text-green-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'reviewed') return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}

function statusLabel(status: unknown) {
  if (status === 'accepted') return 'Acceptée'
  if (status === 'rejected') return 'Refusée'
  if (status === 'reviewed') return 'En cours'
  return 'En attente'
}

function skillsArray(skills: unknown): string[] {
  if (Array.isArray(skills)) return skills
  if (typeof skills === 'string' && skills) return skills.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

async function handleLogout() {
  await logout()
  router.push('/')
}

onMounted(() => { loadProfile(); loadApplications() })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="pt-20 pb-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-32">
          <Loader2 :size="32" class="animate-spin text-green-500" />
        </div>

        <template v-else>

          <!-- ── Profile hero card ──────────────────────────────────────── -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

            <!-- Cover gradient -->
            <div class="h-24 bg-gradient-to-r from-green-500 via-teal-500 to-blue-600" />

            <div class="px-6 pb-6">
              <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">

                <!-- Avatar / photo -->
                <div class="relative w-24 h-24 flex-shrink-0">
                  <div class="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <span v-if="!profile?.photo_path" class="text-white text-3xl font-black">{{ initials() }}</span>
                    <img v-else :src="String(profile.photo_path)" alt="Photo" class="w-full h-full object-cover" />
                  </div>
                  <!-- Photo upload button (candidate) -->
                  <button
                    v-if="authRole === 'candidate'"
                    type="button"
                    class="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition"
                    :disabled="photoLoading"
                    @click="photoInput?.click()"
                    title="Changer la photo"
                  >
                    <Loader2 v-if="photoLoading" :size="12" class="animate-spin text-gray-500" />
                    <Camera v-else :size="12" class="text-gray-600" />
                  </button>
                  <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onPhotoChange" />
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 sm:mb-1">
                  <button
                    v-if="!editing"
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
                    @click="startEdit"
                  >
                    <Edit3 :size="14" /> Modifier
                  </button>
                  <template v-else>
                    <button
                      type="button"
                      :disabled="saving"
                      class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                      @click="saveProfile"
                    >
                      <Loader2 v-if="saving" :size="14" class="animate-spin" />
                      <Save v-else :size="14" />
                      Enregistrer
                    </button>
                    <button type="button" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition" @click="cancelEdit">
                      <X :size="14" /> Annuler
                    </button>
                  </template>
                  <button type="button" class="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition" @click="handleLogout">
                    <LogOut :size="14" />
                  </button>
                </div>
              </div>

              <!-- Name & role -->
              <div class="flex flex-wrap items-center gap-3">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">
                    {{ authRole === 'recruiter' ? String(profile?.organization ?? currentUser?.name) : `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || currentUser?.name }}
                  </h1>
                  <p class="text-gray-500 text-sm mt-0.5">{{ currentUser?.email }}</p>
                </div>
                <span :class="['text-xs font-bold uppercase px-3 py-1 rounded-full', roleColor()]">
                  {{ roleLabel() }}
                </span>
                <span v-if="authRole === 'candidate' && profile?.job_target" class="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {{ String(profile.job_target) }}
                </span>
              </div>

              <!-- Success / error banners -->
              <div v-if="saveMsg" class="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 :size="14" /> {{ saveMsg }}
              </div>
              <div v-if="error" class="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{{ error }}</div>
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════ -->
          <!-- CANDIDATE PROFILE                                            -->
          <!-- ════════════════════════════════════════════════════════════ -->
          <template v-if="authRole !== 'recruiter'">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <!-- Left column -->
              <div class="lg:col-span-1 space-y-6">

                <!-- Contact card -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact</h2>
                  <div class="space-y-3">
                    <!-- Phone -->
                    <div class="flex items-center gap-3">
                      <Phone :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.phone" type="tel" placeholder="+261 34 00 00 00" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <span v-else class="text-sm text-gray-700">{{ profile?.phone ?? '—' }}</span>
                    </div>
                    <!-- Email -->
                    <div class="flex items-center gap-3">
                      <Mail :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.email" type="email" placeholder="email@example.com" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <span v-else class="text-sm text-gray-700">{{ profile?.email ?? currentUser?.email }}</span>
                    </div>
                    <!-- Location -->
                    <div class="flex items-center gap-3">
                      <MapPin :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.location" type="text" placeholder="Tsiroanomandidy" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <span v-else class="text-sm text-gray-700">{{ profile?.location ?? '—' }}</span>
                    </div>
                    <!-- Portfolio -->
                    <div class="flex items-center gap-3">
                      <Link2 :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.portfolio" type="url" placeholder="https://…" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <a v-else-if="profile?.portfolio" :href="String(profile.portfolio)" target="_blank" class="text-sm text-blue-600 hover:underline truncate">{{ String(profile.portfolio) }}</a>
                      <span v-else class="text-sm text-gray-400">—</span>
                    </div>
                    <!-- LinkedIn -->
                    <div class="flex items-center gap-3">
                      <Linkedin :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.linkedin" type="url" placeholder="https://linkedin.com/in/…" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <a v-else-if="profile?.linkedin" :href="String(profile.linkedin)" target="_blank" class="text-sm text-blue-600 hover:underline truncate">LinkedIn</a>
                      <span v-else class="text-sm text-gray-400">—</span>
                    </div>
                    <!-- GitHub -->
                    <div class="flex items-center gap-3">
                      <Github :size="14" class="text-gray-400 flex-shrink-0" />
                      <template v-if="editing">
                        <input v-model="form.github" type="url" placeholder="https://github.com/…" class="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400" />
                      </template>
                      <a v-else-if="profile?.github" :href="String(profile.github)" target="_blank" class="text-sm text-blue-600 hover:underline truncate">GitHub</a>
                      <span v-else class="text-sm text-gray-400">—</span>
                    </div>
                  </div>
                </div>

                <!-- Skills -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Compétences</h2>
                  <template v-if="editing">
                    <input v-model="form.skills" type="text" placeholder="Agriculture, Gestion, Excel…" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400" />
                    <p class="text-[10px] text-gray-400 mt-1">Séparées par des virgules</p>
                  </template>
                  <div v-else class="flex flex-wrap gap-2">
                    <span v-for="sk in skillsArray(profile?.skills)" :key="sk" class="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                      {{ sk }}
                    </span>
                    <span v-if="!skillsArray(profile?.skills).length" class="text-sm text-gray-400">—</span>
                  </div>
                </div>

                <!-- Languages -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Languages :size="13" /> Langues
                  </h2>
                  <template v-if="editing">
                    <input v-model="form.languages" type="text" placeholder="Français, Malagasy, Anglais" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400" />
                  </template>
                  <div v-else class="flex flex-wrap gap-2">
                    <span v-for="lang in skillsArray(profile?.languages)" :key="lang" class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">{{ lang }}</span>
                    <span v-if="!skillsArray(profile?.languages).length" class="text-sm text-gray-400">—</span>
                  </div>
                </div>

                <!-- CV card -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <FileText :size="13" /> CV
                  </h2>
                  <div v-if="profile?.cv_path" class="flex items-center gap-3 mb-3">
                    <FileText :size="20" class="text-green-600 flex-shrink-0" />
                    <span class="text-sm text-gray-700 truncate flex-1">CV uploadé</span>
                    <button type="button" :disabled="cvDeleting" class="text-red-400 hover:text-red-600 transition" @click="deleteCV">
                      <Loader2 v-if="cvDeleting" :size="14" class="animate-spin" />
                      <Trash2 v-else :size="14" />
                    </button>
                  </div>
                  <button
                    type="button"
                    :disabled="cvLoading"
                    class="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition"
                    @click="cvInput?.click()"
                  >
                    <Loader2 v-if="cvLoading" :size="14" class="animate-spin" />
                    <Upload v-else :size="14" />
                    {{ profile?.cv_path ? 'Remplacer le CV' : 'Uploader un CV (PDF)' }}
                  </button>
                  <input ref="cvInput" type="file" accept="application/pdf" class="hidden" @change="onCvChange" />
                </div>
              </div>

              <!-- Right column -->
              <div class="lg:col-span-2 space-y-6">

                <!-- Bio / Poste recherché -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Briefcase :size="13" /> Informations générales
                  </h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Prénom</span>
                      <input v-if="editing" v-model="form.first_name" type="text" class="inp" placeholder="Jean" />
                      <span v-else class="text-sm text-gray-800">{{ profile?.first_name ?? '—' }}</span>
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Nom</span>
                      <input v-if="editing" v-model="form.last_name" type="text" class="inp" placeholder="Rakoto" />
                      <span v-else class="text-sm text-gray-800">{{ profile?.last_name ?? '—' }}</span>
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Poste recherché</span>
                      <input v-if="editing" v-model="form.job_target" type="text" class="inp" placeholder="Ingénieur agronome" />
                      <span v-else class="text-sm text-gray-800">{{ profile?.job_target ?? '—' }}</span>
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Expérience</span>
                      <input v-if="editing" v-model="form.experience_level" type="text" class="inp" placeholder="5 ans" />
                      <span v-else class="text-sm text-gray-800">{{ profile?.experience_level ?? '—' }}</span>
                    </label>
                    <label class="col-span-full flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Présentation</span>
                      <textarea v-if="editing" v-model="form.experiences" rows="3" class="inp resize-none" placeholder="Décrivez votre parcours…" />
                      <p v-else class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ profile?.experiences ?? '—' }}</p>
                    </label>
                  </div>
                </div>

                <!-- Education -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <BookOpen :size="13" /> Formation
                  </h2>
                  <template v-if="editing">
                    <textarea v-model="form.educations" rows="3" class="inp w-full resize-none" placeholder="Ex: Master Agronomie — Université d'Antananarivo (2020)" />
                    <p class="text-[10px] text-gray-400 mt-1">Une formation par ligne</p>
                  </template>
                  <p v-else class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ profile?.educations ?? '—' }}</p>
                </div>

                <!-- Certifications -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Award :size="13" /> Certifications
                  </h2>
                  <template v-if="editing">
                    <textarea v-model="form.certifications" rows="2" class="inp w-full resize-none" placeholder="Ex: Agriculture Durable (2022)" />
                  </template>
                  <p v-else class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ profile?.certifications ?? '—' }}</p>
                </div>

                <!-- My applications -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Briefcase :size="13" /> Mes candidatures
                  </h2>
                  <div v-if="appsLoading" class="text-center py-6 text-gray-400">
                    <Loader2 :size="20" class="animate-spin mx-auto" />
                  </div>
                  <div v-else-if="!applications.length" class="text-sm text-gray-400 text-center py-6">
                    Aucune candidature pour l'instant.
                    <RouterLink to="/jobs" class="block mt-2 text-green-600 font-semibold hover:underline">Voir les offres →</RouterLink>
                  </div>
                  <div v-else class="divide-y divide-gray-100">
                    <div v-for="app in applications" :key="String(app.id)" class="flex items-center justify-between py-3 gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">{{ String(app.job_title ?? '—') }}</p>
                        <p class="text-xs text-gray-400">{{ String(app.company_name ?? '') }} · {{ String(app.applied_at ?? '').slice(0, 10) }}</p>
                      </div>
                      <span :class="['flex-shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full', statusColor(app.status)]">
                        {{ statusLabel(app.status) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ════════════════════════════════════════════════════════════ -->
          <!-- RECRUITER PROFILE                                            -->
          <!-- ════════════════════════════════════════════════════════════ -->
          <template v-else>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <!-- Left: logo + contact -->
              <div class="space-y-6">
                <!-- Logo -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <div class="relative w-20 h-20 mx-auto mb-3">
                    <div class="w-20 h-20 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                      <img v-if="profile?.logo_path" :src="String(profile.logo_path)" alt="Logo" class="w-full h-full object-cover" />
                      <Building2 v-else :size="28" class="text-gray-300" />
                    </div>
                    <button
                      type="button"
                      :disabled="logoLoading"
                      class="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition"
                      @click="logoInput?.click()"
                    >
                      <Loader2 v-if="logoLoading" :size="12" class="animate-spin text-gray-500" />
                      <Camera v-else :size="12" class="text-gray-600" />
                    </button>
                    <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onLogoChange" />
                  </div>
                  <p class="text-xs text-gray-400">Logo de l'organisation</p>
                </div>

                <!-- Contact card -->
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact</h2>
                  <div class="space-y-3">
                    <div class="flex items-center gap-3">
                      <Phone :size="14" class="text-gray-400 flex-shrink-0" />
                      <input v-if="editing" v-model="form.phone" type="tel" class="inp flex-1" placeholder="+261 34 00 00 00" />
                      <span v-else class="text-sm text-gray-700">{{ profile?.phone ?? '—' }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <MapPin :size="14" class="text-gray-400 flex-shrink-0" />
                      <input v-if="editing" v-model="form.address" type="text" class="inp flex-1" placeholder="Tsiroanomandidy" />
                      <span v-else class="text-sm text-gray-700">{{ profile?.address ?? '—' }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <Globe :size="14" class="text-gray-400 flex-shrink-0" />
                      <input v-if="editing" v-model="form.website" type="url" class="inp flex-1" placeholder="https://…" />
                      <a v-else-if="profile?.website" :href="String(profile.website)" target="_blank" class="text-sm text-blue-600 hover:underline truncate">{{ String(profile.website) }}</a>
                      <span v-else class="text-sm text-gray-400">—</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: org info -->
              <div class="lg:col-span-2 space-y-6">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Building2 :size="13" /> Organisation
                  </h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label class="col-span-full flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Nom de l'organisation</span>
                      <input v-if="editing" v-model="form.organization" type="text" class="inp" placeholder="Ferme de Bongolava" />
                      <span v-else class="text-sm text-gray-800 font-semibold">{{ profile?.organization ?? '—' }}</span>
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-xs font-semibold text-gray-500">Secteur</span>
                      <input v-if="editing" v-model="form.sector" type="text" class="inp" placeholder="Agriculture" />
                      <span v-else class="text-sm text-gray-800">{{ profile?.sector ?? '—' }}</span>
                    </label>
                  </div>
                </div>

                <!-- Post a job CTA -->
                <RouterLink
                  to="/jobs"
                  class="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl group hover:shadow-sm transition"
                >
                  <div>
                    <p class="font-bold text-gray-900 text-sm">Publier une offre d'emploi</p>
                    <p class="text-xs text-gray-500 mt-0.5">Trouvez les meilleurs talents de la région</p>
                  </div>
                  <ChevronRight :size="20" class="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </RouterLink>
              </div>
            </div>
          </template>

        </template>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.inp {
  width: 100%;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  color: #1f2937;
  transition: all 0.15s;
}
.inp:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px #4ade80;
}
</style>
