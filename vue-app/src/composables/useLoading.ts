import { ref, computed } from 'vue'

// Global counter of in-flight API requests.
const _pending = ref(0)

export const isGlobalLoading = computed(() => _pending.value > 0)

export function startLoading() { _pending.value++ }
export function stopLoading()  { _pending.value = Math.max(0, _pending.value - 1) }
