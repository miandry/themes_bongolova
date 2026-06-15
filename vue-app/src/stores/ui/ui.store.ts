import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const pendingRequests = ref(0)

  const isGlobalLoading = computed(() => pendingRequests.value > 0)

  function startLoading() {
    pendingRequests.value++
  }

  function stopLoading() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  return {
    pendingRequests,
    isGlobalLoading,
    startLoading,
    stopLoading,
  }
})
