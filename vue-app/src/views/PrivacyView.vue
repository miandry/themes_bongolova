<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-20 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-4xl mx-auto">
        <!-- Bouton retour -->
        <button @click="goBack" class="flex items-center gap-2 text-gray-500 hover:text-green-600 transition mb-6 text-sm">
          <ArrowLeft :size="16" />
          Retour
        </button>

        <!-- En-tête -->
        <h1 class="text-3xl md:text-4xl font-black text-gray-900 mb-6">Politique de confidentialité</h1>

        <div class="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Introduction</h2>
            <p>
              La Direction Régionale de la Jeunesse et des Sports de Bongolava s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez la plateforme Bongolava Jobs.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Données collectées</h2>
            <p class="mb-2">Nous collectons les informations suivantes :</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Données d'identification : nom, prénom, email, numéro de téléphone</li>
              <li>Données professionnelles : CV, compétences, expériences, formations</li>
              <li>Données de connexion : adresse IP, type de navigateur, pages visitées</li>
              <li>Données de compte : identifiant, mot de passe (chiffré)</li>
            </ul>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Utilisation des données</h2>
            <p class="mb-2">Vos données sont utilisées pour :</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Vous permettre d'accéder à la plateforme et à ses services</li>
              <li>Gérer les candidatures et les offres d'emploi</li>
              <li>Communiquer avec vous (envoi de notifications, rappels)</li>
              <li>Améliorer l'expérience utilisateur et la performance du site</li>
            </ul>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Base juridique</h2>
            <p>
              Le traitement de vos données repose sur votre consentement explicite, recueilli lors de votre inscription, ainsi que sur l'intérêt légitime de la Direction Régionale à faciliter l'accès à l'emploi dans la région.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Conservation des données</h2>
            <p>
              Vos données personnelles sont conservées pendant toute la durée de votre compte actif. Si vous supprimez votre compte, vos données sont anonymisées ou supprimées dans un délai de 30 jours, sauf obligation légale contraire.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Vos droits</h2>
            <p class="mb-2">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul class="list-disc pl-5 space-y-1">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p>
              Pour exercer vos droits ou poser une question sur votre vie privée, contactez notre délégué à la protection des données à l'adresse : <a href="mailto:hello@bongolavajobs.mg" class="text-green-600 hover:underline">hello@bongolavajobs.mg</a>
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>