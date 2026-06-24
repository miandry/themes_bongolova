import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from './views/HomeView.vue'
import JobsView from './views/JobsView.vue'
import JobDetailView from './views/JobDetailView.vue'
import JobFormView from './views/JobFormView.vue'
import MyJobsView from './views/MyJobsView.vue'
import MyRecruiterApplicationsView from './views/MyRecruiterApplicationsView.vue'
import ProfilsView from './views/ProfilsView.vue'
import ProfilDetailView from './views/ProfilDetailView.vue'
import EventsView from './views/EventsView.vue'
import MyEventsView from './views/MyEventsView.vue'
import EventDetailView from './views/EventDetailView.vue'
import EventFormView from './views/EventFormView.vue'
import ContactView from './views/ContactView.vue'
import FAQView from './views/FAQView.vue'
import MentionsLegalesView from './views/MentionsLegalesView.vue'
import PrivacyView from './views/PrivacyView.vue'
import CookiesView from './views/CookiesView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import MonProfilView from './views/MonProfilView.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'

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
    requiresRecruiter?: boolean
    guestOnly?: boolean
  }
}

const routerBase = window.__BONGOLAVA_ROUTER_BASE ?? ''

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: HomeView },
  { path: '/jobs', component: JobsView },
  { path: '/jobs/new', component: JobFormView, meta: { requiresAuth: true, requiresRecruiter: true } },
  { path: '/jobs/:id', component: JobDetailView },
  { path: '/jobs/:id/edit', component: JobFormView, meta: { requiresAuth: true, requiresRecruiter: true } },
  { path: '/my-jobs', component: MyJobsView, meta: { requiresAuth: true, requiresRecruiter: true } },
  { path: '/mes-candidatures', component: MyRecruiterApplicationsView, meta: { requiresAuth: true, requiresRecruiter: true } },
  { path: '/profils', component: ProfilsView, meta: { requiresAuth: true, requiresProfils: true } },
  { path: '/profils/:id', component: ProfilDetailView, meta: { requiresAuth: true, requiresProfils: true } },
  { path: '/evenements', component: EventsView },
  { path: '/mes-evenements', component: MyEventsView, meta: { requiresAuth: true, requiresRecruiter: true }  },
  { path: '/evenements/nouveau', component: EventFormView, meta: { requiresAuth: true, requiresRecruiter: true } },
  { path: '/evenements/:id/edit', component: EventFormView, meta: { requiresAuth: true, requiresRecruiter: true } },
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
  const needsRecruiter = to.matched.some((record) => record.meta.requiresRecruiter)
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

  if (needsRecruiter && (auth.authRole !== 'recruiter' && auth.authRole !== 'admin')) {
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
  const taxonomy = useTaxonomyStore()
  
  await auth.restoreSession()
  
  // Preload all taxonomies in the background (no need to await)
  taxonomy.preloadAll().catch((err) => {
    console.error('[bootstrap] Failed to preload taxonomies:', err)
  })
  
  app.mount('#bongolava-app')
}

bootstrap().catch((err) => {
  console.error('[bongolava] bootstrap error', err)
  app.mount('#bongolava-app')
})
