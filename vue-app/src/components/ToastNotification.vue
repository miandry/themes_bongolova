<script setup lang="ts">
import { ref, computed } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  persistent?: boolean
}

const toasts = ref<Toast[]>([])
let toastId = 0

function addToast(message: string, type: 'success' | 'error' | 'info' = 'info', options?: { duration?: number; persistent?: boolean }) {
  const id = ++toastId
  const toast: Toast = {
    id,
    message,
    type,
    duration: options?.duration ?? 5000,
    persistent: options?.persistent ?? false,
  }
  toasts.value.push(toast)
  
  if (!toast.persistent && toast.duration) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }
  
  return id
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function success(message: string, options?: { duration?: number; persistent?: boolean }) {
  return addToast(message, 'success', options)
}

function error(message: string, options?: { duration?: number; persistent?: boolean }) {
  return addToast(message, 'error', options)
}

function info(message: string, options?: { duration?: number; persistent?: boolean }) {
  return addToast(message, 'info', options)
}

defineExpose({
  success,
  error,
  info,
  removeToast,
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[320px] max-w-md',
            toast.type === 'success' ? 'bg-green-500 text-white' : '',
            toast.type === 'error' ? 'bg-red-500 text-white' : '',
            toast.type === 'info' ? 'bg-blue-500 text-white' : '',
          ]"
        >
          <div class="flex-1 text-sm font-medium">{{ toast.message }}</div>
          <button
            @click="removeToast(toast.id)"
            class="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
