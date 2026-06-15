# Architecture Pinia — Bongolava Vue App

## Vue d'ensemble

L'application Vue 3 utilise **Pinia** (Setup Stores + Composition API) comme unique solution de gestion d'état partagé. Les appels API passent par une couche **services** centralisée qui communique avec l'API REST custom Drupal `bongolava_job`.

```
src/
├── services/           # Couche HTTP et appels API
│   ├── http.service.ts # Axios, apiFetch, gestion erreurs
│   ├── api.service.ts  # GET/POST/PUT/DELETE + tracking loading
│   └── api-urls.ts     # Routes API centralisées
├── stores/
│   ├── auth/           # Session, login, register
│   ├── user/           # Profils, candidats, candidatures
│   ├── node/           # Jobs, événements, contact
│   ├── taxonomy/       # Secteurs, types contrat, lieux, types événement
│   └── ui/             # Barre de progression globale
├── types/
│   └── entities.ts     # Types TypeScript des entités
└── views/ + components/ # Consomment les stores via storeToRefs()
```

## Entités identifiées (module `bongolava_job`)

| Entité API        | Table Drupal                  | Store responsable |
|-------------------|-------------------------------|-------------------|
| Job               | `bongolava_job_offer`         | `useNodeStore`    |
| Event             | `bongolava_job_event`         | `useNodeStore`    |
| Candidate         | `bongolava_job_candidate_profile` | `useUserStore` |
| Recruiter         | `bongolava_job_recruiter_profile` | `useUserStore` |
| Application       | `bongolava_job_application`   | `useUserStore`    |
| Saved job         | `bongolava_job_saved_job`       | `useUserStore`    |
| Contact           | `bongolava_job_contact`       | `useNodeStore`    |
| Auth / User meta  | `bongolava_job_user_meta`     | `useAuthStore`    |

## Vocabulaires de taxonomie

Ces listes étaient codées en dur dans les vues ; elles sont centralisées dans `useTaxonomyStore` :

- **sector** — agriculture, tourisme, industrie, education, informatique, transport, services
- **contract_type** — CDI, CDD, Stage, Freelance
- **location** — Tsiroanomandidy, Maintirano, Bongolava, Télé-travail
- **event_type** — Salon, Atelier, Conférence, Formation

## Stores

### `useAuthStore`
- État : `user`, `checked`, `loading`, `error`, `success`
- Getters : `isLoggedIn`, `authReady`, `currentUser`, `authRole`, `canAccessProfils`
- Actions : `login`, `logout`, `restoreSession`, `registerCandidate`, `registerRecruiter`

### `useUserStore`
- Profil connecté (candidat/recruteur), annuaire candidats, candidatures, uploads fichiers
- Cache 60s sur listes et détails candidats

### `useNodeStore`
- Jobs et événements (CRUD + recherche + candidature + inscription événement)
- Formulaire contact
- Cache 60s sur listes et détails

### `useTaxonomyStore`
- Termes et libellés pour filtres UI (lecture seule)

### `useUiStore`
- Compteur de requêtes en cours → `isGlobalLoading` (TopProgressBar)

## Conventions composants

```ts
import { storeToRefs } from 'pinia'
import { useNodeStore } from '@/stores/node/node.store'

const nodeStore = useNodeStore()
const { jobs, jobsLoading, jobsError } = storeToRefs(nodeStore)

// Actions : appeler directement sur le store (non déstructurées)
await nodeStore.fetchJobs({ keyword: '...' })
```

- **storeToRefs** pour l'état réactif consommé dans le template
- **Actions** appelées via `store.action()` pour préserver le contexte
- État UI local (formulaires, modales) reste en `ref()` dans le composant

## Bootstrap (`main.ts`)

1. `createPinia()` + `app.use(pinia)`
2. `useAuthStore().restoreSession()` avant `app.mount()`
3. Guards router utilisent `useAuthStore()` dans `beforeEach`

## Note API

Le backend expose une **API REST custom** (`/bongolava_job/*`), pas JSON:API Drupal. La couche `services/` est conçue pour être étendue vers JSON:API si nécessaire en adaptant `api.service.ts` et `api-urls.ts`.
