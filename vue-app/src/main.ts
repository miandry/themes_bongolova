import { createApp } from 'vue'
import { createPinia } from 'pinia'
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
import { useAuthStore } from '@/stores/auth/auth.store'

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

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresProfils?: boolean
    guestOnly?: boolean
  }
}

const routerBase = window.__BONGOLAVA_ROUTER_BASE ?? ''

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: HomeView },
  { path: '/jobs', component: JobsView },
  { path: '/jobs/:id', component: JobDetailView },
  { path: '/profils', component: ProfilsView, meta: { requiresAuth: true, requiresProfils: true } },
  { path: '/profils/:id', component: ProfilDetailView, meta: { requiresAuth: true, requiresProfils: true } },
  { path: '/evenements', component: EventsView },
  { path: '/evenements/:id', component: EventDetailView },
  { path: '/contact', component: ContactView },
  { path: '/faq', component: FAQView },
  { path: '/mentions-legales', component: MentionsLegalesView },
  { path: '/privacy', component: PrivacyView },
  { path: '/cookies', component: CookiesView },
  { path: '/login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/mon-profil', component: MonProfilView, meta: { requiresAuth: true } },
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
  const auth = useAuthStore()
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth)
  const needsProfils = to.matched.some((record) => record.meta.requiresProfils)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

  if (needsAuth || guestOnly) {
    await auth.ensureAuthChecked()
  }

  if (needsAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (needsProfils && !auth.canAccessProfils) {
    return { path: '/' }
  }

  if (guestOnly && auth.isLoggedIn) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    return redirect || { path: '/' }
  }
})

router.onError((err) => {
  console.error('[bongolava] router error', err)
})

const pinia = createPinia()
const app = createApp(App)
app.config.errorHandler = (err) => {
  console.error('[bongolava] render error', err)
}
app.use(pinia)
app.use(router)

async function bootstrap() {
  const auth = useAuthStore()
  await auth.restoreSession()
  app.mount('#bongolava-app')
}

bootstrap().catch((err) => {
  console.error('[bongolava] bootstrap error', err)
  app.mount('#bongolava-app')
})
