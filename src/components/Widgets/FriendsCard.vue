<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { onClickOutside } from '@vueuse/core'
import friendsData from '../../config/friends.json'

const showModal = ref(false)
const modalRef = ref(null)

const openModal = () => {
        showModal.value = true
        try {
            history.replaceState(null, '', '#friend')
        } catch (e) {
            // fallback
            location.hash = '#friend'
        }
}

const closeModal = () => {
        showModal.value = false
        try {
            if (location.hash === '#friend') {
                const url = location.pathname + location.search
                history.replaceState(null, '', url)
            }
        } catch (e) {
            // ignore
        }
}

onClickOutside(modalRef, closeModal)

// Open modal if URL hash is #friend and listen for changes
const onHashChange = () => {
    if (location.hash === '#friend') showModal.value = true
    else showModal.value = false
}

onMounted(() => {
    if (location.hash === '#friend') showModal.value = true
    window.addEventListener('hashchange', onHashChange)
})

onBeforeUnmount(() => {
    window.removeEventListener('hashchange', onHashChange)
})

// Random Background Logic (similar to LinkBlock)
const getRandomBg = () => `https://picsum.photos/seed/${Math.random()}/300/300?blur=2`
const bgImage = ref(getRandomBg())
</script>

<template>
  <div 
     class="friends-card h-full w-full flex flex-col p-4 relative overflow-hidden cursor-pointer" 
     @click="openModal"
     :style="{ '--bg-image': `url(${bgImage})` }"
  >
      <!-- Background Image Layer -->
      <div class="bg-layer"></div>
      <div class="bg-overlay"></div>

      <!-- Top-left English label (handwritten style) -->
      <div class="title-text top-english">Friends</div>

      <!-- Content similar to LinkBlock (kept for layout, text removed) -->
      <div class="content z-10 w-full h-full flex flex-col justify-start items-start">
      </div>
     
     <div class="bg-icon">
        <i class="fa-solid fa-user-group"></i>
     </div>

     <!-- Modal Portal -->
     <Teleport to="body">
        <transition name="modal">
            <div v-if="showModal" class="friends-modal-overlay">
                <div class="friends-modal glass" ref="modalRef">
                    <div class="modal-header">
                        <h3>我的朋友们</h3>
                        <button class="close-btn" @click.stop="closeModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-body custom-scroll">
                        <a 
                            v-for="(friend, index) in friendsData" 
                            :key="index" 
                            :href="friend.url" 
                            target="_blank" 
                            class="friend-item"
                        >
                            <img :src="friend.avatar" class="friend-avatar" alt="avatar" @error="(e:any)=>e.target.src='https://ui-avatars.com/api/?name='+friend.name">
                            <div class="friend-info">
                                <div class="friend-name">{{ friend.name }}</div>
                                <div class="friend-desc">{{ friend.desc }}</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </transition>
     </Teleport>
  </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Long+Cang&family=Dancing+Script:wght@700&display=swap');

.friends-card {
    text-decoration: none; 
    color: white; 
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
        transform: translateY(-2px);
    }
}

/* Background Layers */
.bg-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  z-index: 0;
}
.friends-card:hover .bg-layer {
  transform: scale(1.1);
}
.bg-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.3); /* Darken for white text legibility */
    z-index: 1;
    transition: background 0.3s;
}
.friends-card:hover .bg-overlay {
    background: rgba(0,0,0,0.1); /* Lighten on hover */
}

.z-10 { z-index: 10; position: relative; }

.title-text {
    font-family: 'Dancing Script', cursive;
    font-size: 2.2rem; 
    font-weight: 700;
    text-align: left;
    line-height: 1.1;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 10;
    color: #fff;
}

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
.friends-card:hover .bg-icon {
    opacity: 0.5;
    transform: rotate(0deg) scale(1.2);
    right: 10px;
    bottom: -10px;
}

/* Top-left label positioning; font comes from .title-text */
.top-english {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 11;
}

:global(.dark) .top-english {
    color: rgba(255,255,255,0.95);
}

/* Modal Styles */
.friends-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.friends-modal {
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    background: var(--card-bg, #fff);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255,255,255,0.2);
}

:global(.dark) .friends-modal {
    background: #1a1a1a;
    color: #fff;
    border-color: #333;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    color: var(--text-color);
    h3 { margin: 0; font-size: 1.25rem; }
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 5px;
    border-radius: 50%;
    
    &:hover { background: rgba(0,0,0,0.1); }
}

.modal-body {
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding-right: 4px;
}

.friend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(0,0,0,0.05);
    border-radius: 12px;
    text-decoration: none;
    color: var(--text-color);
    transition: transform 0.2s, background 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        background: rgba(0,0,0,0.1);
    }
}

:global(.dark) .friend-item {
    background: rgba(255,255,255,0.05);
    &:hover { background: rgba(255,255,255,0.1); }
}

.friend-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.friend-info {
    flex: 1;
    overflow: hidden;
}

.friend-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.friend-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .friends-modal,
.modal-leave-active .friends-modal {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .friends-modal,
.modal-leave-to .friends-modal {
  transform: scale(0.9) translateY(20px);
}
</style>