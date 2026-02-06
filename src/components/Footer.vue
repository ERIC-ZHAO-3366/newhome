<script setup lang="ts">
import { useMusicStore } from '../stores/music'
import { computed } from 'vue'

const currentYear = new Date().getFullYear()
const musicStore = useMusicStore()

// Show lyric if it exists (persist even when paused to prevent layout jump)
const showLyric = computed(() => !!musicStore.currentLyric)
</script>

<template>
  <footer class="footer">
    <!-- Lyric Display with fixed width to prevent jitter -->
     <transition name="fade">
        <div v-if="showLyric" class="lyric-bar glass">
            <span class="music-icon">🎵</span>
            <span class="lyric-text">{{ musicStore.currentLyric }}</span>
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
    margin-bottom: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.music-icon {
    font-size: 0.9rem;
    animation: bounce 2s infinite;
    flex-shrink: 0;
}

.lyric-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
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
