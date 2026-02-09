<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  url?: string
  icon?: string
  color?: string
}>()

// Random Background Logic
const getRandomBg = () => `https://picsum.photos/seed/${Math.random()}/300/300?blur=2` // Changed seed key to Math.random for true randomization on refresh
const bgImage = ref(getRandomBg())

</script>
<template>
  <a :href="url || '#'" target="_blank" 
     class="card-container link-block" 
     :style="{ '--bg-image': `url(${bgImage})` }">
    
    <!-- Background Image Layer -->
    <div class="bg-layer"></div>
    <div class="bg-overlay"></div>

    <div class="content">
        <div class="title-text">{{ title || 'Link' }}</div>
    </div>
    
    <div class="bg-icon">
       <span v-if="icon && !icon.includes('fa-')">{{ icon }}</span>
       <i v-else :class="icon"></i>
    </div>
  </a>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Long+Cang&family=Dancing+Script:wght@700&display=swap');

/* Card Container - Matching SocialCard */
.card-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  text-decoration: none; 
  color: white; 
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}

.link-block { 
  /* Inherited from common or defined here */
  align-items: flex-start;
  justify-content: flex-start;
}
.card-container:hover { 
  transform: translateY(-2px);
}

/* Background Layers */
.bg-layer {
  position: absolute;
  top: 0; left: 0; 
  width: 100%; height: 100%;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  z-index: 0;
}
.bg-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.3); /* Darken for white text legibility */
  z-index: 1;
  transition: background 0.3s;
}
.card-container:hover .bg-layer {
  transform: scale(1.1);
}
.card-container:hover .bg-overlay {
  background: rgba(0,0,0,0.1); /* Lighten on hover */
}

/* Content - Matching SocialCard */
.content {
    z-index: 10;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

/* Icon */
.bg-icon {
  position: absolute;
  right: -10px;
  bottom: -20px;
  font-size: 5rem;
  opacity: 0.3; /* Adjusted for image bg */
  color: rgba(255,255,255,0.8);
  transition: all 0.4s ease;
  transform: rotate(-15deg);
  z-index: 2;
  pointer-events: none;
}
.card-container:hover .bg-icon {
  opacity: 0.5;
  transform: rotate(0deg) scale(1.2);
  right: 10px;
  bottom: -10px;
}

.title-text {
  font-family: 'Dancing Script', cursive;
  font-size: 2.2rem; 
  font-weight: 700;
  text-align: left;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  z-index: 10;
}
</style>
