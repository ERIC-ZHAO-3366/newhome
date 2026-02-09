<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import BentoGrid from './layout/BentoGrid.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import Footer from './components/Footer.vue'
import LoadingScreen from './components/LoadingScreen.vue'

const isLoading = ref(true)

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})

// Set default theme based on client local time (dark from 19:00 to 06:00)
try {
  const hour = new Date().getHours()
  const defaultDark = hour >= 19 || hour < 6
  // Apply default immediately; user can still toggle later
  isDark.value = defaultDark
} catch (e) {
  // ignore in non-browser environments
}
const toggleDark = useToggle(isDark)

// Page background image API (changed to specific ACG API). Keep block/background-for-cards APIs unchanged.
const getRandomBg = () => `https://app.zichen.zone/api/acg/api.php?rand=${Date.now()}`
const bgUrl = ref(getRandomBg())

const refreshKey = ref(0)
const refreshBg = () => {
  refreshKey.value++
  bgUrl.value = getRandomBg()
}

provide('bgRefreshSignal', refreshKey)

onMounted(() => {
  // Adaptive loading: if resources load quickly, show a very short loader.
  const start = performance.now()
  const QUICK_THRESHOLD = 500 // ms — consider load "fast" if under this
  const MIN_NORMAL = 300 // ms minimal visible time for normal loads
  const MIN_FAST = 60 // ms minimal visible time for very fast loads

  const windowLoad = new Promise(resolve => {
    if (document.readyState === 'complete') resolve(true)
    else window.addEventListener('load', () => resolve(true))
  })

  // Preload BG with timeout; record when it finishes
  const bgLoad = new Promise(resolve => {
    const img = new Image()
    img.src = bgUrl.value
    const markAndResolve = () => resolve(performance.now())
    img.onload = markAndResolve
    img.onerror = markAndResolve
    // Safety timeout
    setTimeout(() => resolve(performance.now()), 3000)
  })

  // Wait for essential resources, then decide how long to keep the loader
  Promise.all([windowLoad, bgLoad]).then(() => {
    const elapsed = performance.now() - start
    const minTime = elapsed < QUICK_THRESHOLD ? MIN_FAST : MIN_NORMAL
    const remaining = Math.max(0, minTime - elapsed)
    setTimeout(() => {
      isLoading.value = false
    }, remaining)
  })

    // Security Restictions
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault()
        }
    })
})
</script>

<template>
  <main>
    <LoadingScreen :loading="isLoading" />
    <div class="background-layer" :style="{ backgroundImage: `url(${bgUrl})` }"></div>
    <div class="background-overlay" :class="{ 'dark-bg': isDark }"></div>
    
    <SettingsPanel 
       :dark="isDark" 
       @toggleDark="toggleDark()" 
       @refreshBg="refreshBg" 
    />
    
    <!-- Key change removed to prevent full re-render -->
    <BentoGrid />

    <Footer />
  </main>
</template>

<style scoped>
.background-layer {
  position: fixed;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -2;
  transition: all 0.5s ease;
}

.background-overlay {
  position: fixed;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  z-index: -1;
  transition: background 0.5s;
}

.dark-bg {
  background: rgba(0, 0, 0, 0.28);
}
</style>
