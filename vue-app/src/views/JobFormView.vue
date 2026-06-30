<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
    Save, X, AlertCircle, CheckCircle2, Loader2,
    ChevronLeft, Calendar, DollarSign, MapPin,
    Briefcase, FileText, Phone, Mail, Globe,
    Clock, Sparkles
} from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useNodeStore } from '@/stores/node/node.store'
import { useTaxonomyStore } from '@/stores/taxonomy/taxonomy.store'
import type { Job } from '@/types/entities'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const nodeStore = useNodeStore()
const taxonomy = useTaxonomyStore()

const { currentUser, authRole } = storeToRefs(auth)
const { jobLoading, jobError } = storeToRefs(nodeStore)
const { loading: taxonomyLoading } = storeToRefs(taxonomy)

// Track if taxonomies are loaded
const taxonomiesReady = ref(false)

// Form data
const form = ref<Partial<Job> & { is_remote?: boolean; is_urgent?: boolean }>({
    title: '',
    description: '',
    location: '',
    company: '',
    salary: '',
    contract_type: '',
    sector: '',
    requirements: '',
    responsibilities: '',
    contact_email: '',
    contact_phone: '',
    expires_at: '',
    is_remote: false,
    is_urgent: false,
})

const isEditing = ref(false)
const jobId = computed(() => {
    const id = route.params.id
    return id && typeof id === 'string' ? Number(id) : null
})

const saving = ref(false)
const formErrors = ref<Record<string, string[]>>({})
const successMessage = ref('')
const errorMessage = ref('')
const showSuccessModal = ref(false)

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)

// Computed properties
const isRecruiterOrAdmin = computed(() => authRole.value === 'recruiter' || authRole.value === 'partenaire' || authRole.value === 'admin')

const pageTitle = computed(() => isEditing.value ? 'Modifier l\'offre d\'emploi' : 'Créer une nouvelle offre d\'emploi')

// Validation functions
function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

function isValidPhone(phone: string): boolean {
    // Allow digits, spaces, hyphens, parentheses
    const re = /^[\d\s\-()+.]{7,}$/
    return re.test(phone)
}

function isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date.getTime())
}

function isValidSalary(salary: string): boolean {
    if (salary === '' || salary === null || salary === undefined) {
        return true // Champ optionnel
    }

    // Nettoyer la chaîne (enlever les espaces)
    const cleaned = salary.replace(/\s/g, '')

    // Vérifier que c'est un nombre valide
    const num = Number(cleaned)
    if (isNaN(num)) {
        return false
    }

    // Vérifier que c'est un nombre positif
    return num >= 0
}

function validateForm(): boolean {
    formErrors.value = {}

    // Titre
    if (!form.value.title?.trim()) {
        formErrors.value.title = ['Le titre est requis.']
    } else if (form.value.title.trim().length < 3) {
        formErrors.value.title = ['Le titre doit contenir au moins 3 caractères.']
    }

    // Description
    if (!form.value.description?.trim()) {
        formErrors.value.description = ['La description est requise.']
    } else if (form.value.description.trim().length < 10) {
        formErrors.value.description = ['La description doit contenir au moins 10 caractères.']
    }

    // Location
    if (!form.value.location?.trim()) {
        formErrors.value.location = ['La localisation est requise.']
    }

    // Salaire - validation stricte
    if (form.value.salary && form.value.salary.trim() !== '') {
        if (!isValidSalary(form.value.salary)) {
            formErrors.value.salary = ['Le salaire doit être un nombre positif.']
        }
    }

    // Email
    if (form.value.contact_email && !isValidEmail(form.value.contact_email)) {
        formErrors.value.contact_email = ['Veuillez entrer une adresse email valide.']
    }

    // Phone
    if (form.value.contact_phone && !isValidPhone(form.value.contact_phone)) {
        formErrors.value.contact_phone = ['Le numéro de téléphone n\'est pas valide.']
    }

    // Expiration date
    if (form.value.expires_at && !isValidDate(form.value.expires_at)) {
        formErrors.value.expires_at = ['La date d\'expiration n\'est pas valide.']
    } else if (form.value.expires_at && new Date(form.value.expires_at) <= new Date()) {
        formErrors.value.expires_at = ['La date d\'expiration doit être dans le futur.']
    }

    // Image (optionnelle)
    if (imageFile.value) {
        const maxBytes = 5 * 1024 * 1024
        if (imageFile.value.size > maxBytes) {
            formErrors.value.image = ['L\'image doit être inférieure à 5 Mo.']
        }
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowed.includes(imageFile.value.type)) {
            formErrors.value.image = ['Format invalide. Formats acceptés: JPG, PNG, WEBP, GIF.']
        }
    }

    return Object.keys(formErrors.value).length === 0
}

function onImageChange(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    if (!file) {
        imageFile.value = null
        if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = null
        delete formErrors.value.image
        return
    }

    if (input.files && input.files.length > 1) {
        input.value = ''
        imageFile.value = null
        if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = null
        formErrors.value.image = ['Veuillez sélectionner une seule image.']
        return
    }

    imageFile.value = file
    if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = URL.createObjectURL(file)
    validateForm()
}

// Fonction pour valider le salaire en temps réel
function validateSalaryInput(event: Event) {
    const input = event.target as HTMLInputElement
    let value = input.value

    // Si le champ est vide, pas d'erreur
    if (value === '') {
        delete formErrors.value.salary
        form.value.salary = ''
        return
    }

    // Autoriser uniquement les chiffres, les espaces et le point décimal
    // Filtrer en temps réel
    let cleaned = value.replace(/[^\d\s.]/g, '')

    // Ne pas autoriser plusieurs points
    const parts = cleaned.split('.')
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
    }

    // Mettre à jour la valeur si elle a été modifiée
    if (cleaned !== value) {
        input.value = cleaned
        form.value.salary = cleaned
    }

    // Valider
    if (cleaned.trim() !== '') {
        const num = Number(cleaned.replace(/\s/g, ''))
        if (isNaN(num) || num < 0) {
            formErrors.value.salary = ['Le salaire doit être un nombre positif.']
        } else {
            delete formErrors.value.salary
        }
    } else {
        delete formErrors.value.salary
    }
}

// Fonction pour formater le salaire avec espaces
function formatSalary(value: string): string {
    if (!value) return ''
    const num = Number(value.replace(/\s/g, ''))
    if (isNaN(num)) return value
    return num.toLocaleString('fr-FR')
}

// Fonction appelée quand l'input perd le focus pour formater
function formatSalaryOnBlur(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.value && input.value.trim() !== '') {
        const cleaned = input.value.replace(/\s/g, '')
        const num = Number(cleaned)
        if (!isNaN(num) && num >= 0) {
            input.value = num.toLocaleString('fr-FR')
            form.value.salary = input.value
        }
    }
}

// Fonction appelée quand l'input reçoit le focus pour enlever les espaces
function cleanSalaryOnFocus(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.value) {
        const cleaned = input.value.replace(/\s/g, '')
        if (cleaned !== input.value) {
            input.value = cleaned
            form.value.salary = cleaned
        }
    }
}

// Load job data if editing
async function loadJobData() {
    if (!jobId.value) return

    isEditing.value = true
    try {
        const job = await nodeStore.fetchJobById(jobId.value, false)
        if (!job) {
            errorMessage.value = 'L\'offre n\'existe pas.'
            return
        }

        // Check if current user is the owner (recruiter) or admin
        if (authRole.value === 'recruiter' && job.recruiter_id !== currentUser.value?.id) {
            errorMessage.value = 'Vous n\'êtes pas autorisé à modifier cette offre.'
            return
        }

        // Populate form
        form.value = {
            title: job.title ?? '',
            description: job.description ?? '',
            location: job.location ?? '',
            company: job.company ?? '',
            salary: job.salary ? String(job.salary) : '',
            contract_type: job.contract_type ?? '',
            sector: job.sector ?? '',
            requirements: job.requirements ?? '',
            responsibilities: job.responsibilities ?? '',
            contact_email: job.contact_email ?? '',
            contact_phone: job.contact_phone ?? '',
            expires_at: job.expires_at ?? '',
            is_remote: job.is_remote || job.remote || false,
            is_urgent: job.is_urgent || job.urgent || false,
        }
    } catch (err) {
        console.error('Error loading job:', err)
        errorMessage.value = 'Erreur lors du chargement de l\'offre.'
    }
}

// Prefill email from current user
function prefillEmail() {
    if (!form.value.contact_email && currentUser.value?.email) {
        form.value.contact_email = currentUser.value.email
    }
}

// Handle form submission
async function submitForm() {
    successMessage.value = ''
    errorMessage.value = ''

    if (!validateForm()) {
        errorMessage.value = 'Veuillez corriger les erreurs du formulaire.'
        // Scroll to first error
        const firstError = document.querySelector('[class*="text-red-600"]')
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return
    }

    saving.value = true
    try {
        // Nettoyer le salaire avant l'envoi
        let salaryValue = form.value.salary
        if (salaryValue) {
            salaryValue = salaryValue.replace(/\s/g, '')
        }

        const payload: Partial<Job> = {
            title: form.value.title?.trim(),
            description: form.value.description?.trim(),
            location: form.value.location?.trim(),
            company: form.value.company?.trim(),
            salary: salaryValue, // Garder comme string mais nettoyé
            contract_type: form.value.contract_type?.trim(),
            sector: form.value.sector?.trim(),
            requirements: form.value.requirements?.trim(),
            responsibilities: form.value.responsibilities?.trim(),
            contact_email: form.value.contact_email?.trim(),
            contact_phone: form.value.contact_phone?.trim(),
            expires_at: form.value.expires_at?.trim(),
            is_remote: form.value.is_remote || false,
            is_urgent: form.value.is_urgent || false,
        }

        if (isEditing.value && jobId.value) {
            await nodeStore.updateJob(jobId.value, payload)
            successMessage.value = 'Offre d\'emploi mise à jour avec succès !'
            // Rediriger après modification
            setTimeout(() => {
                router.push('/my-jobs')
            }, 1500)
        } else {
            if (imageFile.value) {
                const fd = new FormData()
                for (const [k, v] of Object.entries(payload)) {
                    if (v === undefined || v === null) continue
                    fd.append(k, String(v))
                }
                fd.append('image', imageFile.value)
                await nodeStore.createJobForm(fd)
            } else {
                await nodeStore.createJob(payload)
            }
            successMessage.value = 'Offre d\'emploi créée avec succès !'
            // Afficher le modal de succès au lieu de rediriger automatiquement
            showSuccessModal.value = true
        }
    } catch (err) {
        console.error('Error saving job:', err)
        errorMessage.value = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'offre.'
    } finally {
        saving.value = false
    }
}

function resetForm() {
    form.value = {
        title: '',
        description: '',
        location: '',
        company: '',
        salary: '',
        contract_type: '',
        sector: '',
        requirements: '',
        responsibilities: '',
        contact_email: '',
        contact_phone: '',
        expires_at: '',
        is_remote: false,
        is_urgent: false,
    }
    formErrors.value = {}
    successMessage.value = ''
    errorMessage.value = ''
    imageFile.value = null
    if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
}

function goToMyJobs() {
    showSuccessModal.value = false
    router.push('/my-jobs')
}

function createAnotherJob() {
    showSuccessModal.value = false
    resetForm()
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Lifecycle
onMounted(async () => {
    // Load taxonomies from API if not already cached
    try {
        await taxonomy.loadMultiple(['sector', 'contract_type', 'location'])
    } catch (err) {
        console.error('Error loading taxonomies:', err)
    } finally {
        taxonomiesReady.value = true
    }

    prefillEmail()
    if (route.params.id) {
        await loadJobData()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <Header />

        <main class="pt-20 pb-16">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">

                <!-- Permission check -->
                <div v-if="!isRecruiterOrAdmin" class="text-center py-12">
                    <AlertCircle :size="48" class="mx-auto text-red-500 mb-4" />
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
                    <p class="text-gray-600 mb-6">Seuls les recruteurs et administrateurs peuvent créer ou modifier des
                        offres d'emploi.</p>
                    <RouterLink to="/jobs"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
                        <ChevronLeft :size="18" /> Retour aux offres
                    </RouterLink>
                </div>

                <!-- Form -->
                <template v-else>
                    <!-- Page title -->
                    <h1 class="text-3xl font-black text-gray-900 mb-8">{{ pageTitle }}</h1>

                    <!-- Loading state -->
                    <div v-if="jobLoading" class="flex justify-center items-center py-12">
                        <Loader2 :size="32" class="animate-spin text-green-500" />
                    </div>

                    <!-- Taxonomies loading state -->
                    <div v-if="!taxonomiesReady" class="flex justify-center items-center py-12">
                        <Loader2 :size="32" class="animate-spin text-green-500" />
                        <span class="ml-3 text-gray-600">Chargement des données...</span>
                    </div>

                    <!-- Error message from loading -->
                    <div v-if="errorMessage && isEditing"
                        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle :size="20" class="text-red-600 flex-shrink-0 mt-0.5" />
                        <p class="text-red-800">{{ errorMessage }}</p>
                    </div>

                    <!-- Form card -->
                    <div v-if="!jobLoading && taxonomiesReady"
                        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

                        <!-- Success message (for updates) -->
                        <div v-if="successMessage && !showSuccessModal"
                            class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle2 :size="20" class="text-green-600 flex-shrink-0 mt-0.5" />
                            <p class="text-green-800">{{ successMessage }}</p>
                        </div>

                        <!-- Error message -->
                        <div v-if="errorMessage && !isEditing"
                            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle :size="20" class="text-red-600 flex-shrink-0 mt-0.5" />
                            <p class="text-red-800">{{ errorMessage }}</p>
                        </div>

                        <form @submit.prevent="submitForm" class="space-y-6">

                            <!-- Title -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Titre <span class="text-red-500">*</span>
                                </label>
                                <input v-model="form.title" type="text" placeholder="Ex: Développeur Senior Vue.js"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.title" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.title[0] }}</p>
                                </div>
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Description <span class="text-red-500">*</span>
                                </label>
                                <textarea v-model="form.description"
                                    placeholder="Décrivez le poste, les responsabilités, les conditions..." rows="6"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.description" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.description[0] }}</p>
                                </div>
                            </div>

                            <!-- Two column layout -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                <!-- Company -->
                                <div>
                                    <label
                                        class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Briefcase :size="16" /> Entreprise
                                    </label>
                                    <input v-model="form.company" type="text" placeholder="Nom de l'entreprise"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                </div>

                                <!-- Location -->
                                <div>
                                    <label
                                        class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin :size="16" /> Localisation <span class="text-red-500">*</span>
                                    </label>
                                    <select v-model="form.location"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <option value="">Sélectionner une localisation</option>
                                        <option v-for="loc in taxonomy.locations" :key="loc.value" :value="loc.value">
                                            {{ loc.label }}
                                        </option>
                                    </select>
                                    <div v-if="formErrors.location" class="mt-1 flex items-start gap-2">
                                        <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                        <p class="text-sm text-red-600">{{ formErrors.location[0] }}</p>
                                    </div>
                                </div>

                                <!-- Salary -->
                                <div>
                                    <label
                                        class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <DollarSign :size="16" /> Salaire
                                    </label>
                                    <input :value="form.salary" type="text" inputmode="decimal"
                                        placeholder="Ex: 1 500 000"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        @input="validateSalaryInput" @focus="cleanSalaryOnFocus"
                                        @blur="formatSalaryOnBlur" />
                                    <div v-if="formErrors.salary" class="mt-1 flex items-start gap-2">
                                        <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                        <p class="text-sm text-red-600">{{ formErrors.salary[0] }}</p>
                                    </div>
                                    <p class="mt-1 text-xs text-gray-500">Entrez un nombre positif (ex: 1500000 ou 1 500
                                        000)</p>
                                </div>

                                <!-- Contract type -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Type de
                                        contrat</label>
                                    <select v-model="form.contract_type"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <option value="">Sélectionner un type</option>
                                        <option v-for="ct in taxonomy.contractTypes" :key="ct.value" :value="ct.value">
                                            {{ ct.label }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Sector -->
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Secteur
                                        d'activité</label>
                                    <select v-model="form.sector"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        <option value="">Sélectionner un secteur</option>
                                        <option v-for="sector in taxonomy.sectors" :key="sector.value"
                                            :value="sector.value">
                                            {{ sector.label }}
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <!-- Image -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Image de l'offre
                                </label>
                                <input type="file" accept="image/*" @change="onImageChange"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.image" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.image[0] }}</p>
                                </div>
                                <div v-if="imagePreviewUrl" class="mt-3">
                                    <p class="text-xs text-gray-500 mb-2">Aperçu</p>
                                    <img :src="imagePreviewUrl" alt="Aperçu image"
                                        class="w-full max-w-md rounded-xl border border-gray-200 object-cover" />
                                </div>
                                <p class="mt-1 text-xs text-gray-500">Formats: JPG, PNG, WEBP, GIF. Taille max: 5 Mo.</p>
                            </div>

                            <!-- Requirements -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText :size="16" /> Compétences et prérequis
                                </label>
                                <textarea v-model="form.requirements"
                                    placeholder="Listez les compétences requises, l'expérience, les diplômes..."
                                    rows="4"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            </div>

                            <!-- Responsibilities -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Briefcase :size="16" /> Missions et responsabilités
                                </label>
                                <textarea v-model="form.responsibilities"
                                    placeholder="Décrivez les missions principales et les responsabilités du poste..."
                                    rows="4"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                            </div>

                            <!-- Contact Email -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail :size="16" /> Email de contact
                                </label>
                                <input v-model="form.contact_email" type="email" placeholder="email@exemple.com"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.contact_email" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.contact_email[0] }}</p>
                                </div>
                            </div>

                            <!-- Contact Phone -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Phone :size="16" /> Téléphone de contact
                                </label>
                                <input v-model="form.contact_phone" type="tel" placeholder="+261 XX XXX XXXX"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.contact_phone" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.contact_phone[0] }}</p>
                                </div>
                            </div>

                            <!-- Expiration date -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar :size="16" /> Date d'expiration
                                </label>
                                <input v-model="form.expires_at" type="date"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <div v-if="formErrors.expires_at" class="mt-1 flex items-start gap-2">
                                    <AlertCircle :size="16" class="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p class="text-sm text-red-600">{{ formErrors.expires_at[0] }}</p>
                                </div>
                            </div>

                            <!-- Checkboxes -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <input v-model="form.is_remote" type="checkbox"
                                        class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500" />
                                    <span class="flex items-center gap-2 text-gray-700">
                                        <Globe :size="16" /> Télé-travail possible
                                    </span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer">
                                    <input v-model="form.is_urgent" type="checkbox"
                                        class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500" />
                                    <span class="flex items-center gap-2 text-gray-700">
                                        <AlertCircle :size="16" /> Urgent
                                    </span>
                                </label>
                            </div>

                            <!-- Form actions -->
                            <div
                                class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button type="button" @click="resetForm"
                                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                                    <X :size="18" /> Réinitialiser
                                </button>
                                <button type="submit" :disabled="saving"
                                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                                    <Loader2 v-if="saving" :size="18" class="animate-spin" />
                                    <Save v-else :size="18" />
                                    {{ isEditing ? 'Mettre à jour' : 'Créer l\'offre' }}
                                </button>
                            </div>

                        </form>

                    </div>

                </template>

            </div>
        </main>

        <Footer />

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="fixed inset-0 flex items-center justify-center p-4" style="z-index: 999;">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSuccessModal = false"></div>

            <!-- Modal -->
            <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-[fadeIn_0.3s_ease-out]">
                <!-- Decorative icon -->
                <div class="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div
                        class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl">
                        <Sparkles :size="32" class="text-white" />
                    </div>
                </div>

                <div class="mt-4 text-center">
                    <!-- Success icon -->
                    <div class="flex justify-center mb-4">
                        <div class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 :size="48" class="text-green-500" />
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-900 mb-2">
                        Offre créée avec succès ! 🎉
                    </h2>

                    <p class="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                        Votre offre d'emploi a été soumise avec succès. Elle est actuellement en attente de validation
                        par un
                        administrateur.
                    </p>

                    <div
                        class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-left">
                        <Clock :size="20" class="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p class="text-sm font-semibold text-amber-800">En attente de validation</p>
                            <p class="text-xs text-amber-700 mt-0.5">
                                Votre offre sera visible sur la plateforme une fois approuvée par un administrateur.
                                Vous recevrez une notification dès que ce sera fait.
                            </p>
                        </div>
                    </div>

                    <div class="mt-6 flex flex-col sm:flex-row gap-3">
                        <button @click="createAnotherJob"
                            class="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                            <span class="flex items-center justify-center gap-2">
                                <Plus :size="18" /> Créer une autre offre
                            </span>
                        </button>
                        <button @click="goToMyJobs"
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg">
                            <span class="flex items-center justify-center gap-2">
                                <Briefcase :size="18" /> Voir mes offres
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Close button -->
                <button @click="showSuccessModal = false"
                    class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors hidden">
                    <X :size="20" class="text-gray-400 hover:text-gray-600" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.animate-in {
    animation: fadeIn 0.3s ease-out;
}
</style>