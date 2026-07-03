<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import { themeAsset } from '@/composables/themeAsset';

const { canAccessProfils } = storeToRefs(useAuthStore())
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="relative bg-gradient-to-b from-white to-gray-50 pt-16 pb-8 overflow-hidden">
    <!-- Ronds décoratifs -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Newsletter CTA -->
      <div class="relative rounded-2xl overflow-hidden mb-12 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
        <div class="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-8 md:p-10">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div class="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white animate-pulse"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                <span class="text-[10px] font-bold text-white uppercase tracking-wider">Newsletter 2026</span>
              </div>
              <h3 class="text-white text-2xl md:text-3xl font-black">Votre carrière commence ici</h3>
              <p class="text-white/80 text-sm mt-2">Recevez les meilleures offres d'emploi de la région.</p>
            </div>
            <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0 md:ml-auto">
              <input
                type="email"
                placeholder="votre.email@professionnel.com"
                class="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm transition-all"
              />
              <button
                type="submit"
                class="px-5 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <!-- <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div> -->
            <div class="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-md bg-white">
              <img :src="themeAsset('/logo.jpg')" alt="Ministère Jeunesse Sports" class="object-cover w-full h-full" />
            </div>
            <div>
             <span class="text-lg md:text-xl tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">DIRECTION RÉGIONALE</span>
             <p class="text-gray-900 font-bold text-sm">DE LA JEUNESSE ET DES SPORTS</p>
            </div>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed">La plateforme emploi n°1 de la région Bongolava.</p>
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
            <span class="text-gray-400 text-xs">Certifié RGPD</span>
          </div>
          <!-- Réseaux sociaux -->
          <div class="flex gap-3 pt-2">
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877f2] hover:text-white transition-all duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor"/></svg>
            </a>
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1da1f2] hover:text-white transition-all duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" fill="currentColor"/></svg>
            </a>
            <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#0077b5] hover:text-white transition-all duration-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="currentColor"/><rect x="2" y="9" width="4" height="12" fill="currentColor"/><circle cx="4" cy="4" r="2" fill="currentColor"/></svg>
            </a>
          </div>
        </div>

        <!-- Plateforme -->
        <div>
          <h4 class="text-gray-900 font-bold mb-4 text-lg">Plateforme</h4>
          <ul class="space-y-3">
            <li><a href="/jobs" class="group text-gray-500 hover:text-green-600 text-sm transition flex items-center gap-1">Offres d'emploi <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition"><polyline points="9 18 15 12 9 6"></polyline></svg></a></li>
            <li v-if="canAccessProfils"><a href="/profils" class="group text-gray-500 hover:text-green-600 text-sm transition flex items-center gap-1">Annuaire talents <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition"><polyline points="9 18 15 12 9 6"></polyline></svg></a></li>
            <li><a href="/evenements" class="group text-gray-500 hover:text-green-600 text-sm transition flex items-center gap-1">Événements <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition"><polyline points="9 18 15 12 9 6"></polyline></svg></a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-gray-900 font-bold mb-4 text-lg">Support</h4>
          <ul class="space-y-3">
            <li><a href="/contact" class="text-gray-500 hover:text-green-600 text-sm transition">Contact</a></li>
            <li><a href="/faq" class="text-gray-500 hover:text-green-600 text-sm transition">FAQ</a></li>
            <li><a href="/mentions-legales" class="text-gray-500 hover:text-green-600 text-sm transition">Mentions légales</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-gray-900 font-bold mb-4 text-lg">Contact</h4>
          <ul class="space-y-3 text-gray-500 text-sm">
            <li class="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 group-hover:scale-110 transition"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <a href="https://maps.google.com/?q=Tsiroanomandidy" target="_blank" rel="noopener noreferrer" class="hover:text-green-600 transition">Tsiroanomandidy</a>
            </li>
            <li class="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 group-hover:scale-110 transition"><polyline points="22 2 15 22 11 13 2 9 22 2"></polyline></svg>
              <a href="tel:+261344900000" class="hover:text-green-600 transition">+261 34 49 000 00</a>
            </li>
            <li class="flex items-center gap-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600 group-hover:scale-110 transition"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <a href="mailto:hello@bongolavajobs.mg" class="hover:text-green-600 transition">hello@bongolavajobs.mg</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
          <span class="text-gray-400 text-xs">© {{ currentYear }} BONGOLAVA JOBS</span>
        </div>
        <div class="flex gap-6 text-xs">
          <a href="/mentions-legales" class="text-gray-400 hover:text-green-600 transition">Mentions légales</a>
          <a href="/privacy" class="text-gray-400 hover:text-green-600 transition">Confidentialité</a>
          <a href="/cookies" class="text-gray-400 hover:text-green-600 transition">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>