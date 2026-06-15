<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui/ui.store'

const { isGlobalLoading } = storeToRefs(useUiStore())

// Width of the progress bar (0–100). We animate it in stages so it feels alive.
const width   = ref(0)
const visible = ref(false)
let   timer: ReturnType<typeof setTimeout> | null = null
let   tickInterval: ReturnType<typeof setInterval> | null = null

function clearTimers() {
  if (timer)        { clearTimeout(timer);       timer = null }
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null }
}

watch(isGlobalLoading, (loading) => {
  clearTimers()
  if (loading) {
    visible.value = true
    width.value   = 0
    // Quick start: jump to 30 % immediately, then crawl toward 85 %.
    timer = setTimeout(() => {
      width.value = 30
      tickInterval = setInterval(() => {
        if (width.value < 85) {
          // Slow logarithmic crawl so it never quite reaches the end.
          width.value = Math.min(85, width.value + (85 - width.value) * 0.08)
        }
      }, 200)
    }, 30)
  } else {
    // Request done — sprint to 100 %, then fade out.
    width.value = 100
    timer = setTimeout(() => {
      visible.value = false
      width.value   = 0
    }, 400)
  }
})
</script>

<template>
  <Transition name="bar-fade">
    <div
      v-if="visible"
      class="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        class="h-full bg-gradient-to-r from-green-400 via-blue-500 to-green-400 rounded-r-full shadow-sm"
        :style="{
          width: width + '%',
          transition: width === 100
            ? 'width 0.2s ease-out'
            : 'width 0.6s cubic-bezier(0.1, 0.5, 0.5, 1)',
        }"
      />
      <!-- Glowing tip -->
      <div
        class="absolute top-0 right-0 h-[3px] w-16 bg-gradient-to-r from-transparent to-blue-400 opacity-70 blur-sm"
        :style="{ right: (100 - width) + '%' }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.bar-fade-leave-active { transition: opacity 0.3s ease 0.1s; }
.bar-fade-leave-to     { opacity: 0; }
</style>
