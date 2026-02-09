<script setup lang="ts">
import { useMusicStore } from '../stores/music'
import { computed } from 'vue'

const currentYear = new Date().getFullYear()
const musicStore = useMusicStore()

// Show lyric if it exists AND is playing
const showLyric = computed(() => !!musicStore.currentLyric && musicStore.isPlaying)
const lyricHtml = computed(() => {
  return musicStore.currentLyric ? musicStore.currentLyric.replace(/\n/g, '<br/>') : ''
})
</script>

<template>
  <footer class="footer">
    <!-- Lyric Display (Fixed at bottom) -->
     <transition name="fade">
        <div v-if="showLyric" class="lyric-bar">
          <span class="music-icon">🎵</span>
          <span class="lyric-text" v-html="lyricHtml"></span>
        </div>
    </transition>

    <div class="footer-content glass">
      <p class="copyright">© {{ currentYear }} EricZhao. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  margin-top: 40px;
}
.footer-content {
  padding: 10px 24px;
  border-radius: 50px; /* Pill shape */
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.lyric-bar {
    /* Fixed Positioning */
    position: fixed;
    bottom: 80px; /* Above the footer area usually, or just float at bottom */
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    
    /* Fixed width constraint to prevent jumping when song/lyric changes */
    width: min(400px, 90vw);
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 0.95rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    /* Transparent Frosted Glass Effect */
    background: rgba(255, 255, 255, 0.1); 
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Dark mode override */
:global(.dark) .lyric-bar {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 600px) {
    .lyric-bar {
        bottom: 40px; /* Closer to bottom on mobile */
    }
}

.music-icon {
    font-size: 0.9rem;
    animation: bounce 2s infinite;
    flex-shrink: 0;
}

.lyric-text {
  display: block;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  word-break: break-word;
  max-height: calc(2 * 1.2em);
  line-height: 1.2em;
  text-align: center;
}

.copyright { margin: 0; }

.links a {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}
.links a:hover { color: var(--text-color); }
.sep { opacity: 0.5; }

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
