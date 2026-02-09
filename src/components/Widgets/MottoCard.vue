<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'

const props = defineProps<{
  text?: string
}>()

const now = useNow()
const formattedTime = useDateFormat(now, 'HH:mm')
const formattedSeconds = useDateFormat(now, 'ss')

const isFlipping = ref(false)
const showMotto = ref(false)

// Permanent motto text
const mottoText = computed(() => props.text || 'Carpe Diem')

// Greeting text based on time
const timeGreeting = computed(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 11) return '一日之计在于晨'
  if (hour >= 11 && hour < 13) return '该吃午饭啦'
  if (hour >= 13 && hour < 17) return '午后时光'
  if (hour >= 17 && hour < 19) return '日落黄昏'
  if (hour >= 19 && hour < 23) return '晚上好'
  return '夜深了，做个好梦'
})

// Current text to display
const currentText = computed(() => showMotto.value ? mottoText.value : timeGreeting.value)

let intervalId: number

onMounted(() => {
  // Set interval to toggle every 5 seconds
  intervalId = window.setInterval(() => {
     // Start Flip Out
     isFlipping.value = true
     
     // Change content halfway through animation (300ms)
     setTimeout(() => {
        showMotto.value = !showMotto.value
        
        // Wait a bit then remove flipped class to animate back in
        setTimeout(() => {
            isFlipping.value = false
        }, 50)
     }, 300) 
     
  }, 5000)
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center p-4 relative overflow-hidden motto-card-wrapper">
     <!-- Top: Time (Static) -->
     <div class="time-section">
        <span class="time-main">{{ formattedTime }}</span>
        <span class="time-sec">.{{ formattedSeconds }}</span>
     </div>

     <!-- Bottom: Motto (Flipping) -->
     <div class="motto-section perspective-container">
        <div class="flip-wrapper" :class="{ 'flipped': isFlipping }">
            <div class="handwritten-text">
                {{ currentText }}
            </div>
        </div>
     </div>
  </div>
</template>

<style scoped lang="scss">
.motto-card-wrapper {
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* Reduced gap */
    gap: 0; 
    height: 100%;
    width: 100%;
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background-clip: padding-box;
    outline: 1px solid transparent;
}

.time-section {
    flex-shrink: 0;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: baseline;
    justify-content: center;
    user-select: none;
    /* Negative margin to pull text closer if line-height is large */
    margin-bottom: -0.5rem; 
    
    .time-main {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -2px;
    }
    
    .time-sec {
        font-size: 1.5rem;
        font-weight: 400;
        opacity: 0.6;
        margin-left: 2px;
    }
}

.motto-section {
    /* Prevent excessive growing */
    flex-grow: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    /* Removed max-height constraint to let it sit naturally */
    margin-top: 0.5rem; 
}

.perspective-container {
    perspective: 1000px;
}

.flip-wrapper {
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s;
    transform-style: preserve-3d;
    opacity: 1;
    
    &.flipped {
        transform: rotateX(90deg);
        opacity: 0;
    }
}

.handwritten-text {
    font-family: 'Long Cang', cursive;
    font-size: 2rem;
    text-align: center;
    line-height: 1.2;
    opacity: 0.9;
    white-space: nowrap;
}
</style>