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
        <h1 class="text-3xl md:text-4xl font-black text-gray-900 mb-6">Mentions légales</h1>

        <div class="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Éditeur de la plateforme</h2>
            <p>
              La plateforme <strong>Bongolava Jobs</strong> est éditée par la Direction Régionale de la Jeunesse et des Sports de la région Bongolava.
            </p>
            <ul class="mt-2 space-y-1">
              <li><strong>Adresse :</strong> Tsiroanomandidy, Bongolava, Madagascar</li>
              <li><strong>Email :</strong> <a href="mailto:hello@bongolavajobs.mg" class="text-green-600 hover:underline">hello@bongolavajobs.mg</a></li>
              <li><strong>Téléphone :</strong> <a href="tel:+261344900000" class="text-green-600 hover:underline">+261 34 49 000 00</a></li>
            </ul>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Directeur de la publication</h2>
            <p>
              Le directeur de la publication est Monsieur le Directeur Régional de la Jeunesse et des Sports de Bongolava.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Hébergement</h2>
            <p>
              La plateforme est hébergée par Google Cloud Platform (Firebase). Les données sont stockées sur des serveurs sécurisés conformément aux normes en vigueur.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de la plateforme (textes, images, logos, design) est la propriété exclusive de la Direction Régionale de la Jeunesse et des Sports de Bongolava, sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est strictement interdite.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Protection des données personnelles</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité des données vous concernant. Pour exercer ces droits, contactez-nous à l'adresse suivante : <a href="mailto:hello@bongolavajobs.mg" class="text-green-600 hover:underline">hello@bongolavajobs.mg</a>.
            </p>
          </section>

          <section class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-3">Modification des conditions</h2>
            <p>
              La Direction Régionale se réserve le droit de modifier les présentes mentions légales à tout moment. Les utilisateurs seront informés de toute modification par une notification sur la plateforme.
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>