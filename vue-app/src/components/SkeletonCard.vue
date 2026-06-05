<script setup lang="ts">
defineProps<{ lines?: number; avatar?: boolean }>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div v-if="avatar" class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
      <div class="flex-1 space-y-1.5">
        <div class="h-3.5 bg-gray-200 rounded-full w-2/3" />
        <div class="h-2.5 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
    <div class="space-y-2.5">
      <div class="h-4 bg-gray-200 rounded-full w-3/4" />
      <div v-for="n in (lines ?? 2)" :key="n" :class="['h-3 bg-gray-100 rounded-full', n % 3 === 0 ? 'w-1/2' : 'w-full']" />
    </div>
    <div class="mt-4 flex gap-2">
      <div class="h-6 w-16 bg-gray-100 rounded-full" />
      <div class="h-6 w-20 bg-gray-100 rounded-full" />
    </div>
    <div class="mt-4 h-9 bg-gray-100 rounded-xl" />
  </div>
</template>
