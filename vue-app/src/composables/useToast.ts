import { ref } from 'vue'

interface ToastInstance {
  success: (message: string, options?: { duration?: number; persistent?: boolean }) => number
  error: (message: string, options?: { duration?: number; persistent?: boolean }) => number
  info: (message: string, options?: { duration?: number; persistent?: boolean }) => number
  removeToast: (id: number) => void
}

const toastRef = ref<ToastInstance | null>(null)

export function setToastRef(ref: ToastInstance) {
  toastRef.value = ref
}

export function useToast() {
  return {
    success: (message: string, options?: { duration?: number; persistent?: boolean }) => {
      toastRef.value?.success(message, options)
    },
    error: (message: string, options?: { duration?: number; persistent?: boolean }) => {
      toastRef.value?.error(message, options)
    },
    info: (message: string, options?: { duration?: number; persistent?: boolean }) => {
      toastRef.value?.info(message, options)
    },
    removeToast: (id: number) => {
      toastRef.value?.removeToast(id)
    },
  }
}
