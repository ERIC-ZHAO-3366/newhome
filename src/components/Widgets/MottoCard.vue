<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNow, useTimeoutFn, useDateFormat } from '@vueuse/core'

const props = defineProps<{
  text?: string
}>()

const now = useNow()
const formattedTime = useDateFormat(now, 'HH:mm')
const formattedSeconds = useDateFormat(now, 'ss')

const isFlipping = ref(false)
const showGreeting = ref(true)

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
const currentText = ref('')

// Initialize with greeting
currentText.value = timeGreeting.value

// Switch to motto after 5 seconds with flip animation
onMounted(() => {
  useTimeoutFn(() => {
     // Start Flip Out
     isFlipping.value = true
     
     // Change text halfway through (300ms)
     setTimeout(() => {
        showGreeting.value = false
        currentText.value = mottoText.value
        // Start Flip In (Remove flipping class)
        isFlipping.value = false
     }, 300)
     
  }, 5000)
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
    gap: 0.25rem;
    height: 100%;
    width: 100%;
}

.time-section {
    flex-shrink: 0;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    align-items: baseline;
    justify-content: center;
    
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
    flex-grow: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
}

.perspective-container {
    perspective: 1000px;
    width: 100%;
}

.flip-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
    transform-style: preserve-3d;
}

.flipped {
    transform: rotateX(90deg);
    opacity: 0.5;
}

.handwritten-text {
  font-family: 'Long Cang', 'Dancing Script', cursive;
  font-size: 2.2rem;
  line-height: 1.2;
  text-align: center;
  color: var(--text-color);
  text-shadow: 0 4px 8px rgba(0,0,0,0.12);
  white-space: nowrap;
}

@media (max-width: 768px) {
    /* Styles are already column and centered by default now, so this media query might be redundant or just confirming behavior */
    .motto-card-wrapper {
        gap: 0.5rem;
    }
    
    .time-main {
        font-size: 2.8rem;
    }

    .handwritten-text {
        font-size: 2rem;
    }
}
</style>
