<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  Menu, X, Search, Globe,
  Briefcase, Users, Calendar, LayoutDashboard,
  ChevronDown, Moon, Sun, LogOut, UserCircle2,
  FilePlus, FileText,
} from 'lucide-vue-next'
import { themeAsset } from '@/composables/themeAsset'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'

const auth = useAuthStore()
const { isLoggedIn, currentUser, authRole, canAccessProfils } = storeToRefs(auth)

const router = useRouter()

// ── UI state ──────────────────────────────────────────────────────────────────
const isOpen = ref(false)
const scrolled = ref(false)
const isDarkMode = ref(false)
const userMenuOpen = ref(false)

// ── Computed: check if user can access recruiter features ──────────────────
const canAccessRecruiterMenus = computed(() => {
  return authRole.value === 'recruiter' || authRole.value === 'admin'
})

// ── Computed: partner can create jobs and see their offers ─────────────────
const isPartner = computed(() => authRole.value === 'partenaire')

const canPublishJobs = computed(() => {
  return canAccessRecruiterMenus.value || isPartner.value
})

// ── Computed: check if user is candidate ──────────────────────────────────
const isCandidate = computed(() => {
  return authRole.value === 'candidate'
})

// ── Simple events link (guest, candidate, partner) ─────────────────────────
const showSimpleEventsLink = computed(() => {
  return !isLoggedIn.value || isCandidate.value || isPartner.value
})

// ── Scroll detection ──────────────────────────────────────────────────────────
function onScroll() { scrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// ── Nav helpers ───────────────────────────────────────────────────────────────
const toggleMenu = () => { isOpen.value = !isOpen.value }
const closeNav = () => {
  isOpen.value = false
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
const initials = () => {
  const name = currentUser.value?.name ?? ''
  return name.split(/[\s@]/)[0].slice(0, 2).toUpperCase() || 'U'
}

const roleLabel = () => {
  if (authRole.value === 'recruiter') return 'Recruteur'
  if (authRole.value === 'partenaire') return 'Partenaire'
  if (authRole.value === 'admin') return 'Admin'
  return 'Candidat'
}

async function handleLogout() {
  userMenuOpen.value = false
  isOpen.value = false
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <!-- ── Desktop header ──────────────────────────────────────────────────── -->
  <header :class="[
    'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
    scrolled
      ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100/50 py-2'
      : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100 py-3',
  ]">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6">
      <nav class="flex justify-between items-center gap-4">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3 md:gap-4 shrink-0 group">
          <div class="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-md bg-white">
            <img :src="themeAsset('/logo.jpg')" alt="Ministère Jeunesse Sports" class="object-cover w-full h-full" />
          </div>
          <div class="hidden lg:block">
            <div class="font-black text-gray-900 uppercase leading-tight">
              <span
                class="text-lg md:text-xl tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">DIRECTION
                RÉGIONALE</span>
              <span class="text-gray-800 font-bold text-sm ml-2">DE LA JEUNESSE ET DES SPORTS</span>
            </div>
            <div class="text-[9px] font-semibold text-gray-500 flex items-center gap-2 mt-0.5">
              <Globe :size="10" class="text-green-500" />
              <span>🇲🇬 Plateforme d'emploi officielle - Région Bongolava</span>
              <span class="text-green-600 font-bold">| #1 2026</span>
            </div>
          </div>
          <div class="block md:hidden">
            <div class="font-black text-gray-900 uppercase leading-tight">
              <span
                class="text-[10px] tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">DIRECTION
                RÉGIONALE</span>
            </div>
            <div class="text-[7px] font-bold text-gray-600">de la Jeunesse & Sports</div>
            <div class="text-[5px] text-gray-400 mt-0.5 font-semibold">#1 Bongolava</div>
          </div>
        </RouterLink>

        <!-- Desktop nav links -->
        <div class="hidden lg:flex items-center gap-1">
          <RouterLink to="/"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path === '/' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Accueil
          </RouterLink>
          <RouterLink to="/jobs"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path === '/jobs' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Jobs
          </RouterLink>

          <RouterLink v-if="canPublishJobs" to="/jobs/new"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path === '/jobs/new' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Créer une offre
          </RouterLink>

          <RouterLink v-if="canAccessProfils" to="/profils"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path.startsWith('/profils') ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Profils
          </RouterLink>

          <!-- 👇 Menu Événements corrigé -->
          <!-- Cas 1: Aucun utilisateur connecté OU Candidat : lien simple -->
          <RouterLink v-if="showSimpleEventsLink" to="/evenements"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path.startsWith('/evenements') ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Événements
          </RouterLink>

          <!-- Cas 2: Recruteur/Admin : menu déroulant au hover -->
          <div v-else-if="canAccessRecruiterMenus" class="relative group">
            <button type="button"
              class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-1"
              :class="$route.path.startsWith('/evenements') ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
              Événements
              <ChevronDown :size="14" class="transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <!-- Dropdown menu - avec meilleure gestion du hover -->
            <div
              class="absolute left-0 top-full pt-0 w-56 opacity-0 group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[200] pointer-events-none group-hover:pointer-events-auto">
              <div class="bg-white rounded-xl shadow-xl border border-gray-100 py-2 mt-1">
                <RouterLink to="/evenements"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <Calendar :size="15" class="text-green-500" />
                  Tous les événements
                </RouterLink>

                <RouterLink to="/mes-evenements"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <Calendar :size="15" class="text-blue-500" />
                  Mes événements
                </RouterLink>

                <RouterLink to="/evenements/nouveau"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <FilePlus :size="15" class="text-purple-500" />
                  Ajouter un événement
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- 👇 Contact : affiché quand non connecté OU candidat -->
          <RouterLink v-if="!isLoggedIn || isCandidate" to="/contact"
            class="relative px-3 py-1.5 text-sm font-semibold tracking-wide transition-all duration-200"
            active-class="text-green-600"
            :class="$route.path === '/contact' ? 'text-green-600' : 'text-gray-700 hover:text-green-500'">
            Contact
          </RouterLink>
        </div>

        <!-- Desktop right actions -->
        <div class="flex items-center gap-2">
          <button @click="toggleDarkMode"
            class="hidden md:flex p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-full transition">
            <Moon v-if="!isDarkMode" :size="18" />
            <Sun v-else :size="18" />
          </button>

          <!-- Logged-out -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/login"
              class="hidden sm:block text-sm font-semibold text-gray-600 hover:text-green-600 px-2 py-1 transition">
              Connexion
            </RouterLink>
            <RouterLink to="/register">
              <button
                class="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-1.5 rounded-full font-semibold text-xs shadow-md hover:shadow-lg transition">
                Inscription
              </button>
            </RouterLink>
          </template>

          <!-- Logged-in: avatar + dropdown -->
          <div v-else class="relative">
            <button type="button"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-green-400 hover:shadow-sm transition-all"
              @click="userMenuOpen = !userMenuOpen">
              <span
                class="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                {{ initials() }}
              </span>
              <span class="hidden sm:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                {{ currentUser?.name }}
              </span>
              <ChevronDown :size="14" class="text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': userMenuOpen }" />
            </button>

            <!-- Dropdown card -->
            <Transition name="dropdown">
              <div v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[200]"
                @click.stop>
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-xs font-bold text-gray-900 truncate">{{ currentUser?.name }}</p>
                  <p class="text-[10px] text-gray-400 truncate mt-0.5">{{ currentUser?.email }}</p>
                  <span
                    class="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                    {{ roleLabel() }}
                  </span>
                </div>

                <RouterLink v-if="canPublishJobs" to="/my-jobs"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <FileText :size="15" class="text-blue-500" />
                  Mes offres d'emploi
                </RouterLink>

                <RouterLink v-if="canAccessRecruiterMenus" to="/mes-candidatures"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <FileText :size="15" class="text-orange-500" />
                  Candidatures
                </RouterLink>

                <RouterLink v-if="!isPartner" to="/mon-profil"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  @click="userMenuOpen = false">
                  <UserCircle2 :size="15" class="text-blue-500" />
                  Mon profil
                </RouterLink>
                <button type="button"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  @click="handleLogout">
                  <LogOut :size="15" />
                  Déconnexion
                </button>
              </div>
            </Transition>

            <!-- Click-outside close -->
            <div v-if="userMenuOpen" class="fixed inset-0 z-[199]" @click="userMenuOpen = false" />
          </div>

          <!-- Mobile burger -->
          <button @click="toggleMenu"
            class="lg:hidden relative w-9 h-9 rounded-full bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
            <Menu v-if="!isOpen" :size="18" />
            <X v-else :size="18" />
            <span v-if="!isOpen"
              class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-md" />
          </button>
        </div>
      </nav>
    </div>
  </header>

  <!-- ── Mobile overlay ──────────────────────────────────────────────────── -->
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[105] lg:hidden" @click="closeNav" />
  </Transition>

  <!-- ── Mobile sidebar ──────────────────────────────────────────────────── -->
  <Transition name="slide">
    <div v-if="isOpen"
      class="fixed top-0 right-0 h-full w-[85%] max-w-[360px] bg-white/95 backdrop-blur-xl shadow-2xl z-[110] lg:hidden overflow-y-auto">
      <div class="flex flex-col h-full pt-6 pb-6 px-5">

        <!-- Sidebar header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-white">
              <img :src="themeAsset('/logo.jpg')" alt="Ministère" class="object-cover w-full h-full" />
            </div>
            <div>
              <span class="font-black text-gray-900 text-xs block leading-tight">
                <span class="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">BONGOLAVA</span>
              </span>
              <span class="text-[8px] font-bold text-gray-500 block">Jeunesse & Sports</span>
            </div>
          </div>
          <button @click="closeNav" class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <X :size="16" />
          </button>
        </div>

        <!-- Nav links -->
        <nav class="space-y-1 flex-1">
          <RouterLink to="/" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path === '/' ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <LayoutDashboard :size="18" />
            Accueil
          </RouterLink>
          <RouterLink to="/jobs" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path.startsWith('/jobs') ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <Briefcase :size="18" />
            Jobs
          </RouterLink>

          <RouterLink v-if="canPublishJobs" to="/jobs/new" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path === '/jobs/new' ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <FilePlus :size="18" />
            Créer une offre
          </RouterLink>

          <RouterLink v-if="canAccessProfils" to="/profils" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path.startsWith('/profils') ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <Users :size="18" />
            Profils
          </RouterLink>

          <!-- Mobile : Événements (lien simple pour tous) -->
          <RouterLink to="/evenements" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path.startsWith('/evenements') ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <Calendar :size="18" />
            Événements
          </RouterLink>

          <!-- Mobile : Sous-menus pour recruteur/admin (affichés en plus) -->
          <template v-if="canAccessRecruiterMenus">
            <RouterLink to="/mes-evenements" @click="closeNav"
              class="flex items-center gap-3 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              :class="$route.path === '/mes-evenements' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-100'">
              <Calendar :size="15" />
              Mes événements
            </RouterLink>
            <RouterLink to="/evenements/nouveau" @click="closeNav"
              class="flex items-center gap-3 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              :class="$route.path === '/evenements/nouveau' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-100'">
              <FilePlus :size="15" />
              Ajouter un événement
            </RouterLink>
          </template>

          <!-- Mobile : Contact (visible pour tous) -->
          <RouterLink to="/contact" @click="closeNav"
            class="flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all duration-200"
            :class="$route.path === '/contact' ? 'bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'">
            <Globe :size="18" />
            Contact
          </RouterLink>
        </nav>

        <!-- ── Mobile auth footer ─────────────────────────────────────────── -->

        <!-- Logged-out -->
        <div v-if="!isLoggedIn" class="pt-6 space-y-2 border-t border-gray-200 mt-4">
          <RouterLink to="/login" @click="closeNav" class="block">
            <button
              class="w-full py-2.5 border border-green-600 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-50 transition">
              Connexion
            </button>
          </RouterLink>
          <RouterLink to="/register" @click="closeNav" class="block">
            <button
              class="w-full py-2.5 bg-gradient-to-r from-green-600 to-blue-500 text-white rounded-xl font-semibold text-sm shadow-md">
              S'inscrire gratuitement
            </button>
          </RouterLink>
        </div>

        <!-- Logged-in -->
        <div v-else class="pt-4 space-y-2 border-t border-gray-200 mt-4">
          <!-- User card -->
          <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl mb-1">
            <span
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0">
              {{ initials() }}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ currentUser?.name }}</p>
              <p class="text-[10px] text-gray-400 truncate">{{ currentUser?.email }}</p>
              <span
                class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                {{ roleLabel() }}
              </span>
            </div>
          </div>

          <RouterLink v-if="canPublishJobs" to="/my-jobs" @click="closeNav"
            class="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition">
            <FileText :size="16" class="text-blue-500" />
            Mes offres d'emploi
          </RouterLink>

          <RouterLink v-if="canAccessRecruiterMenus" to="/mes-candidatures" @click="closeNav"
            class="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition">
            <FileText :size="16" class="text-orange-500" />
            Candidatures
          </RouterLink>

          <RouterLink v-if="!isPartner" to="/mon-profil" @click="closeNav"
            class="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition">
            <UserCircle2 :size="16" class="text-blue-500" />
            Mon profil
          </RouterLink>
          <button type="button"
            class="flex items-center gap-3 w-full p-3 rounded-xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition"
            @click="handleLogout">
            <LogOut :size="16" />
            Déconnexion
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Mobile overlay fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile sidebar slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>