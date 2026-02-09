<script setup lang="ts">
import { ref } from 'vue'
import socialLinks from '../../config/social.json'

const props = defineProps<{
  title?: string
  icon?: string
  color?: string
}>()

// Random Background Logic
const getRandomBg = () => `https://picsum.photos/seed/${Math.random()}/300/300?blur=2` 
const bgImage = ref(getRandomBg())

const showModal = ref(false)

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

</script>
<template>
  <div class="card-container link-block" 
     :style="{ '--bg-image': `url(${bgImage})` }"
     @click="openModal">
    
    <!-- Background Image Layer -->
    <div class="bg-layer"></div>
    <div class="bg-overlay"></div>

    <div class="content">
        <div class="title-text">{{ title || 'Socials' }}</div>
    </div>
    
    <div class="bg-icon">
       <span v-if="icon && !icon.includes('fa-')">{{ icon }}</span>
       <i v-else :class="icon || 'fa-solid fa-share-nodes'"></i>
    </div>

    <!-- Modal Inside Root -->
    <Teleport to="body">
        <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal-box">
                <h2 class="modal-title">Social Media</h2>
                <div class="social-grid">
                    <a v-for="item in socialLinks" :key="item.id" 
                        :href="item.url" target="_blank"
                        class="social-item link-block-style"
                        :style="{ backgroundColor: (item.color || '#333') }">
                        
                        <!-- LinkBlock Style Content -->
                         <div class="content">
                            <div class="title-text">{{ item.title }}</div>
                        </div>
                        
                        <div class="bg-icon">
                            <i :class="item.icon"></i>
                        </div>
                    </a>
                </div>
                <button class="close-btn" @click="closeModal">
                    Close
                </button>
            </div>
        </div>
        </Transition>
    </Teleport>
  </div>
</template>
<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Long+Cang&family=Dancing+Script:wght@700&display=swap'); moved to index.html */

/* Card Container */
.card-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none; 
  color: white; 
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
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
  background: rgba(0,0,0,0.3); 
  z-index: 1;
  transition: background 0.3s;
}
.card-container:hover .bg-layer {
  transform: scale(1.1);
}
.card-container:hover .bg-overlay {
  background: rgba(0,0,0,0.1); 
}

/* Content */
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
  opacity: 0.3; 
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

/* Also apply hover effect for nested items */
.link-block-style:hover .bg-icon {
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; 
    left: 0;
    right: 0; 
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.modal-box {
    background-color: rgba(17, 24, 39, 0.9);
    padding: 1.5rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 42rem; /* Wider for better grid */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
    color: white;
}

.social-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

@media (min-width: 640px) {
    .social-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.link-block-style {
    position: relative;
    overflow: hidden;
    height: 110px;
    border-radius: 1.25rem;
    padding: 1rem;
    text-decoration: none;
    color: white;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.link-block-style .title-text {
    font-size: 1.8rem;
    text-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.link-block-style .bg-icon {
    font-size: 3.5rem;
    right: -5px;
    bottom: -10px;
}

.link-block-style:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.close-btn {
    margin-top: 1.5rem;
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 1rem;
}

.close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* Modal Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>