<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import TopProgressBar from '@/components/TopProgressBar.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { setToastRef } from '@/composables/useToast'

const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null)

onMounted(() => {
  if (toastRef.value) {
    setToastRef(toastRef.value)
  }
})
</script>

<template>
  <TopProgressBar />
  <RouterView />
  <ToastNotification ref="toastRef" />
</template>
