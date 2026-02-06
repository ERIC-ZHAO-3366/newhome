<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  dark?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleDark'): void
  (e: 'refreshBg'): void
}>()

const isOpen = ref(false)
const target = ref(null)

onClickOutside(target, () => isOpen.value = false)

const toggle = () => isOpen.value = !isOpen.value

</script>

<template>
  <div class="settings-container" ref="target">
    <button class="settings-btn glass" @click.stop="toggle">
      <i class="fa-solid fa-gear" :class="{ 'fa-spin': isOpen }"></i>
    </button>
    
    <transition name="fade">
      <div v-if="isOpen" class="settings-panel glass">
         <div class="option-item" @click="$emit('toggleDark')">
            <i class="fa-solid" :class="dark ? 'fa-sun' : 'fa-moon'"></i>
            <span>{{ dark ? 'Light Mode' : 'Dark Mode' }}</span>
         </div>
         <div class="option-item" @click="$emit('refreshBg')">
            <i class="fa-solid fa-image"></i>
            <span>Refresh Images</span>
         </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.settings-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}
.settings-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: var(--text-color);
  transition: transform 0.3s;
}
.settings-btn:hover {
  transform: rotate(45deg);
}
.settings-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 180px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.option-item {
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
  color: var(--text-color);
}
.option-item:hover {
  background: rgba(0,0,0,0.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
