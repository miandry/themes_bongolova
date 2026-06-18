<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink, useRouter } from "vue-router";
import {
    Search,
    MapPin,
    Building2,
    Heart,
    Zap,
    ChevronDown,
    LayoutGrid,
    List,
    Eye,
    Loader2,
    AlertCircle,
    Edit3,
    Trash2,
    RefreshCw,
    X,
    Calendar,
    Clock,
    Briefcase,
    DollarSign,
    Mail,
    Phone,
    User,
    Tag,
    AlertTriangle,
} from "lucide-vue-next";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { useNodeStore } from "@/stores/node/node.store";
import { useTaxonomyStore } from "@/stores/taxonomy/taxonomy.store";
import { useAuthStore } from "@/stores/auth/auth.store";

const router = useRouter();
const nodeStore = useNodeStore();
const taxonomyStore = useTaxonomyStore();
const authStore = useAuthStore();
const { jobs, jobsLoading, jobsError } = storeToRefs(nodeStore);
const { sectors, contractTypes, locations } = storeToRefs(taxonomyStore);
const { currentUser, authRole } = storeToRefs(authStore);

// Check permissions - only recruiters and admins
onMounted(() => {
    if (authRole.value !== "recruiter" && authRole.value !== "admin") {
        router.push("/");
    }
});

// --- Filtres ---
const searchQuery = ref("");
const selectedSector = ref("");
const selectedType = ref("");
const selectedLocation = ref("");
const selectedStatus = ref("");
const viewMode = ref("grid");
const deleteConfirmId = ref<number | null>(null);
const republishConfirmId = ref<number | null>(null);
const newExpirationDate = ref<string>("");
const expirationError = ref<string>("");
const isSubmitting = ref(false);

async function loadMyJobs() {
    try {
        const response = await fetch(
            "/bongolava_job/my-jobs?" +
            new URLSearchParams({
                ...(searchQuery.value && { keyword: searchQuery.value }),
                ...(selectedSector.value && { sector: selectedSector.value }),
                ...(selectedType.value && { contract_type: selectedType.value }),
                ...(selectedLocation.value && { location: selectedLocation.value }),
                ...(selectedStatus.value && { offer_status: selectedStatus.value }),
            }).toString(),
            {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "include",
            },
        );

        if (!response.ok) throw new Error("Failed to load jobs");

        const data = await response.json();
        nodeStore.jobs = Array.isArray(data) ? data : data.data || [];
        nodeStore.jobsError = null;
    } catch (err) {
        nodeStore.jobsError = (err as Error).message;
        nodeStore.jobs = [];
    } finally {
        nodeStore.jobsLoading = false;
    }
}

onMounted(async () => {
    nodeStore.jobsLoading = true;

    // Load taxonomies from API if not already cached
    try {
        await taxonomyStore.loadMultiple(["sector", "contract_type", "location"]);
    } catch (err) {
        console.error("Error loading taxonomies:", err);
    }

    // Load recruiter's jobs
    await loadMyJobs();
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(
    [searchQuery, selectedSector, selectedType, selectedLocation, selectedStatus],
    () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            nodeStore.jobsLoading = true;
            loadMyJobs();
        }, 350);
    },
);

// Fonction de formatage du salaire
const formatSalary = (job: { salary?: string | number }) => {
    if (!job.salary) return "";

    // Convertir en string si c'est un nombre
    const salaryStr = String(job.salary);

    // Nettoyer la chaîne (enlever les espaces)
    const cleaned = salaryStr.replace(/\s/g, "");

    // Vérifier si c'est un nombre valide
    const num = Number(cleaned);
    if (isNaN(num)) return salaryStr;

    // Formater avec des espaces tous les 3 chiffres
    return num.toLocaleString("fr-FR");
};

// Fonctions de traduction des statuts
const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
        pending: "En attente de validation",
        published: "Publiée",
        rejected: "Rejetée",
        expired: "Expirée",
    };
    return statusMap[status] || status || "Inconnu";
};

const getStatusClass = (status: string) => {
    if (status === "published") {
        return "bg-green-50 text-green-700";
    } else if (status === "pending") {
        return "bg-yellow-50 text-yellow-700";
    } else if (status === "rejected") {
        return "bg-red-50 text-red-700";
    } else if (status === "expired") {
        return "bg-gray-50 text-gray-600";
    } else {
        return "bg-gray-50 text-gray-700";
    }
};

async function deleteJob(jobId: number) {
    try {
        const response = await fetch(`/bongolava_job/jobs/${jobId}`, {
            method: "DELETE",
            headers: { Accept: "application/json" },
            credentials: "include",
        });

        if (response.ok) {
            nodeStore.jobs = nodeStore.jobs.filter((j) => j.id !== jobId);
            deleteConfirmId.value = null;
        }
    } catch (err) {
        console.error("Error deleting job:", err);
    }
}

// Fonction pour ouvrir le modal de republication
const openRepublishModal = (jobId: number) => {
    console.log("Ouverture du modal pour l'offre:", jobId);
    const job = getJobDetails(jobId);
    // Réinitialiser les erreurs
    expirationError.value = "";
    isSubmitting.value = false;

    // Définir la date d'expiration actuelle ou une date par défaut (30 jours)
    if (job?.expires_at) {
        // Extraire uniquement la partie date (YYYY-MM-DD)
        const datePart = job.expires_at.split('T')[0];
        // Vérifier si la date est valide
        const date = new Date(datePart);
        if (!isNaN(date.getTime())) {
            newExpirationDate.value = datePart;
        } else {
            // Si la date est invalide, définir une date par défaut (30 jours)
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 30);
            newExpirationDate.value = defaultDate.toISOString().split('T')[0];
        }
    } else {
        // Si pas de date d'expiration, définir une date par défaut (30 jours)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        newExpirationDate.value = defaultDate.toISOString().split('T')[0];
    }

    republishConfirmId.value = jobId;
};

// Fonction pour fermer le modal de republication
const closeRepublishModal = () => {
    republishConfirmId.value = null;
    expirationError.value = "";
    isSubmitting.value = false;
};

// Fonction de republication avec validation
const republishJob = async (jobId: number) => {
    // Valider la date
    const selectedDate = new Date(newExpirationDate.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        expirationError.value = "La date d'expiration doit être postérieure à aujourd'hui";
        // Scroll vers l'input
        await nextTick();
        const inputElement = document.getElementById('expiration-date-input');
        if (inputElement) {
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();
        }
        return;
    }

    expirationError.value = "";
    isSubmitting.value = true;

    try {
        // TODO: Implémenter l'appel API pour republier l'offre avec la nouvelle date
        console.log("Republication de l'offre:", jobId, "avec date d'expiration:", newExpirationDate.value);

        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Fermer le modal après succès
        closeRepublishModal();
        // Recharger la liste des offres
        await loadMyJobs();
    } catch (err) {
        console.error("Erreur lors de la republication:", err);
        expirationError.value = "Une erreur est survenue lors de la republication";
    } finally {
        isSubmitting.value = false;
    }
};

// Récupérer les détails d'une offre pour le modal
const getJobDetails = (jobId: number) => {
    return jobs.value.find(j => j.id === jobId);
};

// Fonction pour tronquer le texte
const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Formater une date pour l'affichage
const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Non définie';
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return 'Non définie';
    }
};
</script>

<template>
    <div class="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main class="flex-grow pt-20 pb-16">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">
                <!-- Permission Check -->
                <div v-if="authRole !== 'recruiter' && authRole !== 'admin'"
                    class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-start gap-3">
                    <AlertCircle class="text-red-500 shrink-0 mt-1" :size="20" />
                    <div>
                        <h3 class="font-bold text-red-900">Accès refusé</h3>
                        <p class="text-red-700 text-sm mt-1">
                            Seuls les recruteurs peuvent accéder à cette page.
                        </p>
                    </div>
                </div>

                <!-- EN-TÊTE -->
                <div class="mb-10">
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Mes <span class="text-blue-600">offres d'emploi</span>
                    </h1>
                    <p class="text-gray-500 text-lg mt-1 flex items-center gap-2">
                        {{ jobs.length }} offre{{ jobs.length > 1 ? "s" : "" }}
                    </p>
                </div>

                <!-- BARRE DE RECHERCHE + FILTRES -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-10">
                    <div class="flex flex-col lg:flex-row gap-3">
                        <div class="flex-1 relative">
                            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
                            <input v-model="searchQuery" type="text" placeholder="Rechercher par titre, entreprise..."
                                class="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 placeholder:text-gray-400" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <div class="relative min-w-[140px]">
                                <select v-model="selectedSector"
                                    class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                                    <option value="">Tous secteurs</option>
                                    <option v-for="s in sectors" :key="s.value" :value="s.value">
                                        {{ s.label }}
                                    </option>
                                </select>
                                <ChevronDown
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    :size="18" />
                            </div>
                            <div class="relative min-w-[120px]">
                                <select v-model="selectedType"
                                    class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                                    <option value="">Tous types</option>
                                    <option v-for="t in contractTypes" :key="t.value" :value="t.value">
                                        {{ t.label }}
                                    </option>
                                </select>
                                <ChevronDown
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    :size="18" />
                            </div>
                            <div class="relative min-w-[140px]">
                                <select v-model="selectedLocation"
                                    class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                                    <option value="">Toutes villes</option>
                                    <option v-for="l in locations" :key="l.value" :value="l.value">
                                        {{ l.label }}
                                    </option>
                                </select>
                                <ChevronDown
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    :size="18" />
                            </div>
                            <div class="relative min-w-[160px]">
                                <select v-model="selectedStatus"
                                    class="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 text-sm font-medium cursor-pointer transition-all">
                                    <option value="">Tous statuts</option>
                                    <option value="pending">En attente de validation</option>
                                    <option value="published">Publiée</option>
                                    <option value="rejected">Rejetée</option>
                                    <option value="expired">Expirée</option>
                                </select>
                                <ChevronDown
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    :size="18" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TOGGLE GRID / LISTE -->
                <div class="flex justify-between items-center mb-6">
                    <RouterLink to="/jobs/new"
                        class="px-5 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-sm font-bold hover:shadow-md transition-all hover:translate-y-[-1px]">
                        + Créer une offre
                    </RouterLink>
                    <div class="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <button @click="viewMode = 'grid'"
                            :class="`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`">
                            <LayoutGrid :size="18" />
                        </button>
                        <button @click="viewMode = 'list'"
                            :class="`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`">
                            <List :size="18" />
                        </button>
                    </div>
                </div>

                <!-- RÉSULTATS -->
                <!-- Loading -->
                <div v-if="jobsLoading" class="flex justify-center items-center py-24">
                    <Loader2 :size="36" class="animate-spin text-blue-500" />
                </div>

                <!-- Error -->
                <div v-else-if="jobsError"
                    class="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
                    <p class="text-red-500 font-semibold">{{ jobsError }}</p>
                    <button @click="loadMyJobs()"
                        class="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Réessayer
                    </button>
                </div>

                <!-- Empty -->
                <div v-else-if="jobs.length === 0"
                    class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search :size="32" class="text-gray-300" />
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-1">
                        Aucune offre d'emploi
                    </h3>
                    <p class="text-gray-500">
                        Créez votre première offre d'emploi pour commencer.
                    </p>
                    <RouterLink to="/jobs/new"
                        class="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                        Créer une offre</RouterLink>
                </div>

                <!-- MODE GRILLE -->
                <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="job in jobs" :key="job.id"
                        class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div class="p-5 flex flex-col flex-grow">
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <div class="flex gap-1.5 flex-wrap">
                                    <span
                                        class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide">{{
                                            job.contract_type ?? job.type }}</span>
                                    <span v-if="job.is_urgent ?? job.urgent"
                                        class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                                        <Zap :size="12" class="fill-current" /> Urgent
                                    </span>
                                    <span v-if="job.is_remote ?? job.remote"
                                        class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide">À
                                        distance</span>
                                    <span
                                        :class="`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusClass(job.status)}`">
                                        {{ getStatusLabel(job.status) }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <RouterLink :to="`/jobs/${job.id}`" class="block">
                                    <h3
                                        class="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {{ job.title }}
                                    </h3>
                                </RouterLink>
                                <p class="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                    <Building2 :size="14" class="text-gray-400 shrink-0" />
                                    <span class="truncate">{{ job.company }}</span>
                                </p>
                            </div>
                            <div class="flex items-center justify-between border-t border-gray-100/60 pt-3 mt-3">
                                <div class="flex items-center gap-1.5 text-gray-500 text-xs">
                                    <MapPin :size="14" class="text-green-500 shrink-0" />
                                    <span class="truncate">{{ job.location }}</span>
                                </div>
                                <div class="text-green-600 font-bold text-sm shrink-0 ml-2">
                                    {{ formatSalary(job) }} Ar
                                </div>
                            </div>
                            <div class="mt-4 pt-2 flex gap-2">
                                <!-- Bouton Voir détail - toujours visible -->
                                <RouterLink :to="`/jobs/${job.id}`"
                                    class="flex-1 flex items-center justify-center py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all hover:translate-y-[-2px]">
                                    <Eye :size="16" class="mr-1" /> Voir détail
                                </RouterLink>
                                <!-- Bouton Republier - visible uniquement si expired -->
                                <button v-if="job.status === 'expired'" @click="openRepublishModal(job.id)"
                                    class="flex-1 flex items-center justify-center py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                                    <RefreshCw :size="16" class="mr-1" /> Republier
                                </button>
                                <!-- Boutons Éditer et Supprimer - cachés avec la classe hidden -->
                                <template v-else>
                                    <RouterLink :to="`/jobs/${job.id}/edit`"
                                        class="hidden flex-1 flex items-center justify-center py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all">
                                        <Edit3 :size="16" class="mr-1" /> Éditer
                                    </RouterLink>
                                    <button @click="deleteConfirmId = job.id"
                                        class="hidden flex-1 flex items-center justify-center py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-all">
                                        <Trash2 :size="16" class="mr-1" /> Supprimer
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MODE LISTE -->
                <div v-else class="space-y-4">
                    <div v-for="job in jobs" :key="job.id"
                        class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-4">
                        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Building2 :size="24" class="text-gray-400" />
                                </div>
                            </div>
                            <div class="flex-grow min-w-0">
                                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div>
                                        <RouterLink :to="`/jobs/${job.id}`">
                                            <h3
                                                class="text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-1">
                                                {{ job.title }}
                                            </h3>
                                        </RouterLink>
                                        <p class="text-gray-500 text-sm">{{ job.company }}</p>
                                    </div>
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span
                                            class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide">{{
                                                job.contract_type ?? job.type }}</span>
                                        <span v-if="job.is_urgent ?? job.urgent"
                                            class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                                            <Zap :size="10" class="fill-current" /> Urgent
                                        </span>
                                        <span v-if="job.is_remote ?? job.remote"
                                            class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold tracking-wide">À
                                            distance</span>
                                        <span
                                            :class="`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusClass(job.status)}`">
                                            {{ getStatusLabel(job.status) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-500 text-xs">
                                    <span class="flex items-center gap-1">
                                        <MapPin :size="12" class="text-green-500" />
                                        {{ job.location }}
                                    </span>
                                    <span class="font-bold text-green-600">
                                        {{ formatSalary(job) }} Ar
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <!-- Bouton Voir détail - toujours visible -->
                                <RouterLink :to="`/jobs/${job.id}`"
                                    class="px-3 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all hover:translate-y-[-2px] whitespace-nowrap">
                                    <Eye :size="16" class="inline mr-1" /> Voir détail
                                </RouterLink>
                                <!-- Bouton Republier - visible uniquement si expired -->
                                <button v-if="job.status === 'expired'" @click="openRepublishModal(job.id)"
                                    class="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white transition shadow-sm hover:shadow-md">
                                    <RefreshCw :size="18" />
                                </button>
                                <!-- Boutons Éditer et Supprimer - cachés avec la classe hidden -->
                                <template v-else>
                                    <RouterLink :to="`/jobs/${job.id}/edit`"
                                        class="hidden p-2 rounded-lg hover:bg-blue-100 transition text-blue-600 hover:text-blue-700">
                                        <Edit3 :size="18" />
                                    </RouterLink>
                                    <button @click="deleteConfirmId = job.id"
                                        class="hidden p-2 rounded-lg hover:bg-red-100 transition text-red-600 hover:text-red-700">
                                        <Trash2 :size="18" />
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Delete Confirmation Dialog -->
                <div v-if="deleteConfirmId" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    @click.self="deleteConfirmId = null">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in" @click.stop>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">
                            Supprimer cette offre ?
                        </h3>
                        <p class="text-gray-600 text-sm mb-6">
                            Cette action ne peut pas être annulée. L'offre sera définitivement
                            supprimée.
                        </p>
                        <div class="flex gap-3">
                            <button @click="deleteConfirmId = null"
                                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                                Annuler
                            </button>
                            <button @click="deleteJob(deleteConfirmId)"
                                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Republish Confirmation Modal -->
                <div v-if="republishConfirmId"
                    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    style="z-index: 999;"
                    @click.self="closeRepublishModal">
                    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in"
                        @click.stop>
                        <!-- En-tête -->
                        <div
                            class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div class="flex items-center gap-3">
                                <div class="p-2 bg-blue-50 rounded-xl">
                                    <RefreshCw :size="20" class="text-blue-600" />
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-gray-900">Republication de l'offre</h3>
                                    <p class="text-sm text-gray-500">Vérifiez les détails avant de republier</p>
                                </div>
                            </div>
                            <button @click="closeRepublishModal"
                                class="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
                                <X :size="20" />
                            </button>
                        </div>

                        <!-- Contenu -->
                        <div v-if="republishConfirmId" class="px-6 py-6">
                            <div class="space-y-5">
                                <!-- Titre et entreprise -->
                                <div
                                    class="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl p-4 border border-blue-100">
                                    <h4 class="text-xl font-bold text-gray-900">{{
                                        getJobDetails(republishConfirmId)?.title || 'Titre non disponible' }}</h4>
                                    <p class="text-gray-600 mt-1 flex items-center gap-2 text-sm">
                                        <Building2 :size="14" class="text-blue-500" />
                                        {{ getJobDetails(republishConfirmId)?.company || 'Entreprise non disponible' }}
                                    </p>
                                </div>

                                <!-- Détails - grille 3 colonnes -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                            Secteur</p>
                                        <p class="text-sm font-semibold text-gray-800 truncate">{{
                                            getJobDetails(republishConfirmId)?.sector || 'N/A' }}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Type
                                            de contrat</p>
                                        <p class="text-sm font-semibold text-gray-800 truncate">{{
                                            (getJobDetails(republishConfirmId)?.contract_type ??
                                                getJobDetails(republishConfirmId)?.type) || 'N/A' }}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                            Localisation</p>
                                        <p class="text-sm font-semibold text-gray-800 truncate">{{
                                            getJobDetails(republishConfirmId)?.location || 'N/A' }}</p>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                            Salaire</p>
                                        <p class="text-sm font-semibold text-green-600">{{
                                            formatSalary(getJobDetails(republishConfirmId) || {}) }} Ar</p>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Statut
                                        </p>
                                        <span
                                            :class="`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusClass(getJobDetails(republishConfirmId)?.status || '')}`">
                                            {{ getStatusLabel(getJobDetails(republishConfirmId)?.status || '') }}
                                        </span>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Vues
                                        </p>
                                        <p class="text-sm font-semibold text-gray-800">{{
                                            getJobDetails(republishConfirmId)?.views_count
                                            || 0 }}</p>
                                    </div>
                                </div>

                                <!-- Date d'expiration actuelle -->
                                <div class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                                    <Clock :size="14" class="text-amber-500" />
                                    <div>
                                        <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Date
                                            d'expiration
                                            actuelle</p>
                                        <p class="text-sm font-semibold text-gray-800">{{
                                            formatDate(getJobDetails(republishConfirmId)?.expires_at) }}</p>
                                    </div>
                                </div>

                                <!-- Tags -->
                                <div v-if="getJobDetails(republishConfirmId)?.is_urgent || getJobDetails(republishConfirmId)?.is_remote"
                                    class="flex flex-wrap gap-2">
                                    <span v-if="getJobDetails(republishConfirmId)?.is_urgent"
                                        class="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                                        <Zap :size="12" class="fill-current" /> Urgent
                                    </span>
                                    <span v-if="getJobDetails(republishConfirmId)?.is_remote"
                                        class="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">
                                        À distance
                                    </span>
                                </div>

                                <!-- Contact -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div v-if="getJobDetails(republishConfirmId)?.contact_email"
                                        class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                                        <Mail :size="14" class="text-blue-500" />
                                        <div>
                                            <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                Email</p>
                                            <p class="text-sm text-gray-700 truncate">{{
                                                getJobDetails(republishConfirmId)?.contact_email }}</p>
                                        </div>
                                    </div>
                                    <div v-if="getJobDetails(republishConfirmId)?.contact_phone"
                                        class="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                                        <Phone :size="14" class="text-green-500" />
                                        <div>
                                            <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                Téléphone</p>
                                            <p class="text-sm text-gray-700">{{
                                                getJobDetails(republishConfirmId)?.contact_phone }}</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description -->
                                <div v-if="getJobDetails(republishConfirmId)?.description"
                                    class="bg-gray-50 rounded-lg p-3">
                                    <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                                        Description</p>
                                    <p class="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{{
                                        getJobDetails(republishConfirmId)?.description }}</p>
                                </div>

                                <!-- Requirements -->
                                <div v-if="getJobDetails(republishConfirmId)?.requirements"
                                    class="bg-gray-50 rounded-lg p-3">
                                    <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                                        Profil recherché</p>
                                    <p class="text-sm text-gray-700 line-clamp-3"
                                        v-html="getJobDetails(republishConfirmId)?.requirements"></p>
                                </div>

                                <!-- Responsibilities -->
                                <div v-if="getJobDetails(republishConfirmId)?.responsibilities"
                                    class="bg-gray-50 rounded-lg p-3">
                                    <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                                        Missions</p>
                                    <p class="text-sm text-gray-700 line-clamp-3"
                                        v-html="getJobDetails(republishConfirmId)?.responsibilities"></p>
                                </div>

                                <!-- Nouvelle date d'expiration -->
                                <div class="border-t border-gray-200 pt-4">
                                    <label for="expiration-date-input"
                                        class="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar :size="16" class="inline mr-2 text-blue-500" />
                                        Nouvelle date d'expiration
                                    </label>
                                    <input id="expiration-date-input" v-model="newExpirationDate" type="date" :class="[
                                        'w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 cursor-pointer',
                                        expirationError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                                    ]" :min="new Date().toISOString().split('T')[0]" />
                                    <!-- Message d'erreur -->
                                    <div v-if="expirationError"
                                        class="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                        <AlertTriangle :size="16" class="shrink-0 mt-0.5" />
                                        <span>{{ expirationError }}</span>
                                    </div>
                                    <p class="mt-1 text-xs text-gray-500">La date doit être postérieure à aujourd'hui
                                    </p>
                                </div>

                                <!-- Actions -->
                                <div class="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
                                    <button @click="closeRepublishModal"
                                        class="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
                                        Annuler
                                    </button>
                                    <button @click="republishJob(republishConfirmId)" :disabled="isSubmitting"
                                        class="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                        <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
                                        <RefreshCw v-else :size="16" />
                                        {{ isSubmitting ? 'Republication en cours...' : 'Republier l\'offre' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <Footer />
    </div>
</template>