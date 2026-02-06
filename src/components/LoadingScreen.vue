<script setup lang="ts">
defineProps<{
  loading: boolean
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="loading" class="loading-screen">
      <div class="loader-content">
        <div class="spinner"></div>
        <div class="text">Loading...</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: #f5f5f7;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-color-scheme: dark) {
  .loading-screen {
    background: #111;
    color: #fff;
  }
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,0,0,0.1);
  border-left-color: #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.text {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  opacity: 0.6;
  letter-spacing: 0.5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>