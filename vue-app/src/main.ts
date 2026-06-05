import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from './views/HomeView.vue'
import JobsView from './views/JobsView.vue'
import JobDetailView from './views/JobDetailView.vue'
import ProfilsView from './views/ProfilsView.vue'
import ProfilDetailView from './views/ProfilDetailView.vue'
import EventsView from './views/EventsView.vue'
import EventDetailView from './views/EventDetailView.vue'
import ContactView from './views/ContactView.vue'
import FAQView from './views/FAQView.vue'
import MentionsLegalesView from './views/MentionsLegalesView.vue'
import PrivacyView from './views/PrivacyView.vue'
import CookiesView from './views/CookiesView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import MonProfilView from './views/MonProfilView.vue'
import {
  restoreSession,
  ensureAuthChecked,
  isLoggedIn,
  canAccessProfils,
} from './composables/useAuth'

declare global {
  interface Window {
    __drupalBasePath?: string
    __BONGOLAVA_ROUTER_BASE?: string
    __bongolavaDistUrl?: string
    drupalSettings?: {
      bongolava?: {
        basePath?: string
        currentUser?: { uid: number; name: string; roles: string[] }
        bongolavaJobs?: unknown[]
        bongolavaEvents?: unknown[]
        bongolavaProfiles?: unknown[]
      }
    }
  }
}

// Vue routes are /jobs, /profils, … — NOT prefixed with Drupal base_path.
const routerBase = window.__BONGOLAVA_ROUTER_BASE ?? ''

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: HomeView },
  { path: '/jobs', component: JobsView },
  { path: '/jobs/:id', component: JobDetailView },
  { path: '/profils', component: ProfilsView },
  { path: '/profils/:id', component: ProfilDetailView },
  { path: '/evenements', component: EventsView },
  { path: '/evenements/:id', component: EventDetailView },
  { path: '/contact', component: ContactView },
  { path: '/faq', component: FAQView },
  { path: '/mentions-legales', component: MentionsLegalesView },
  { path: '/privacy', component: PrivacyView },
  { path: '/cookies', component: CookiesView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/mon-profil', component: MonProfilView },
]

const router = createRouter({
  history: createWebHistory(routerBase),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.path === '/profils' || to.path.startsWith('/profils/')) {
    await ensureAuthChecked()
    if (!isLoggedIn.value) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (!canAccessProfils.value) {
      return { path: '/' }
    }
  }
})

router.onError((err) => {
  console.error('[bongolava] router error', err)
})

const app = createApp(App)
app.config.errorHandler = (err) => {
  console.error('[bongolava] render error', err)
}
app.use(router)

// Mount immediately (mga2p2Form pattern). Delaying mount until isReady() left /jobs blank.
app.mount('#bongolava-app')
restoreSession().catch(() => {})
