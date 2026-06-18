<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  lastPage: number
  total: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const pages = computed(() => {
  const total = Math.max(1, props.lastPage)
  const current = props.currentPage
  const range: number[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
    return range
  }

  range.push(1)
  if (current > 3) range.push(-1)

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) range.push(i)

  if (current < total - 2) range.push(-1)
  range.push(total)
  return range
})

function goTo(page: number) {
  if (page < 1 || page > props.lastPage || page === props.currentPage) return
  emit('update:currentPage', page)
}
</script>

<template>
  <div v-if="lastPage > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10">
    <p class="text-sm text-gray-500">
      Page {{ currentPage }} sur {{ lastPage }} — {{ total }} résultat{{ total > 1 ? 's' : '' }}
    </p>
    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        type="button"
        :disabled="currentPage <= 1"
        class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        @click="goTo(currentPage - 1)"
      >
        <ChevronLeft :size="18" />
      </button>
      <template v-for="(page, idx) in pages" :key="`${page}-${idx}`">
        <span v-if="page === -1" class="px-2 text-gray-400">…</span>
        <button
          v-else
          type="button"
          :class="[
            'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition',
            page === currentPage
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
          ]"
          @click="goTo(page)"
        >
          {{ page }}
        </button>
      </template>
      <button
        type="button"
        :disabled="currentPage >= lastPage"
        class="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        @click="goTo(currentPage + 1)"
      >
        <ChevronRight :size="18" />
      </button>
    </nav>
  </div>
</template>
