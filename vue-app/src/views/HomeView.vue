<script setup>
import { canAccessProfils } from '@/composables/useAuth'
import Header from '../components/Header.vue'
import HeroSection from '../components/HeroSection.vue'
import CategoriesSection from '../components/CategoriesSection.vue'
import FeaturedJobsSection from '../components/FeaturedJobsSection.vue'
import EventsSection from '../components/EventsSection.vue'
import TalentsSection from '../components/TalentsSection.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow pt-16">
      <HeroSection />
      <CategoriesSection />
      <FeaturedJobsSection />
      <EventsSection />
      <TalentsSection v-if="canAccessProfils" />
    </main>
    <Footer />
  </div>
</template>