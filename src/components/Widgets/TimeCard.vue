<script setup lang="ts">
import { useNow, useDateFormat } from '@vueuse/core'

const now = useNow()
const time = useDateFormat(now, 'HH:mm:ss')
const date = useDateFormat(now, 'MMM DD dddd')

</script>

<template>
  <div class="time-card h-full w-full flex-center flex-col p-4 relative overflow-hidden bg-black">
    <!-- Digital Background Elements -->
    <div class="digital-bg-grid"></div>
    
    <div class="content z-10 flex flex-col items-center">
        <div class="time-display">{{ time }}</div>
        <div class="date-display">{{ date }}</div>
    </div>
    
    <div class="scanline"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');

.time-card {
    background-color: #0F0F0F;
    border: 1px solid #333;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

.flex-center { display: flex; justify-content: center; align-items: center; }
.flex-col { flex-direction: column; }
.z-10 { z-index: 10; }

.time-display {
    font-family: 'Orbitron', monospace;
    font-size: 2.2rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4);
    letter-spacing: 2px;
}

.date-display {
    font-family: 'Orbitron', monospace;
    font-size: 0.7rem;
    margin-top: 5px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Decoration */
.digital-bg-grid {
    position: absolute;
    top: 0; left: 0;
    width: 200%; height: 200%;
    background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.5;
    pointer-events: none;
}

.scanline {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.2) 51%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 5;
}
</style>
