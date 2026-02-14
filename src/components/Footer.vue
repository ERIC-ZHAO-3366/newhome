<script setup lang="ts">
import { useMusicStore } from '../stores/music'
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import profile from '../config/profile.json'

const currentYear = new Date().getFullYear()
const musicStore = useMusicStore()

// Show lyric if it exists AND is playing
const showLyric = computed(() => !!musicStore.currentLyric && musicStore.isPlaying)
const lyricHtml = computed(() => {
  return musicStore.currentLyric ? musicStore.currentLyric.replace(/\n/g, '<br/>') : ''
})

// Auto-fit logic: try to keep footer items on one line by reducing font-size when needed
const containerRef = ref<HTMLElement | null>(null)
let originalFontPx = 0

function adjustFontToFit() {
  nextTick(() => {
    const el = containerRef.value
    if (!el) return

    // restore original font-size if we know it
    if (!originalFontPx) {
      originalFontPx = parseFloat(window.getComputedStyle(el).fontSize || '12')
    }
    el.style.whiteSpace = 'nowrap'
    el.style.flexDirection = 'row'
    el.style.flexWrap = 'nowrap'
    el.style.justifyContent = 'center'

    let fontPx = originalFontPx
    el.style.fontSize = fontPx + 'px'

    // Calculate available width with a safety margin (e.g. parent width or viewport width minus padding)
    const availableWidth = Math.min(el.parentElement?.clientWidth || window.innerWidth, window.innerWidth) - 32;

    // Check if scrollWidth (content width) exceeds available width or clientWidth
    if (el.scrollWidth > availableWidth || el.scrollWidth > el.clientWidth) {
      el.style.whiteSpace = 'normal'
      el.style.flexDirection = 'column'
      // Restore original font size when wrapped, or keep it slightly smaller if desired, 
      // but usually wrapping means we have enough width for the content blocks.
      el.style.fontSize = originalFontPx + 'px'
      el.style.gap = '4px' // Reduce gap when stacked
    } else {
        // It fits!
        el.style.gap = '28px' // Restore original gap
    }
  })
}

let resizeTimer: number | undefined
function onResize() {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => adjustFontToFit(), 120)
}

onMounted(() => {
  adjustFontToFit()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) window.clearTimeout(resizeTimer)
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

    <div class="footer-content glass" ref="containerRef">
      <p class="copyright">© {{ currentYear }} EricZhao. All Rights Reserved.</p>

      <div class="links">
        <a v-if="profile.beian" :href="profile.beian.url" target="_blank" rel="noopener noreferrer">{{ profile.beian.text }}</a>
        <span class="sep" v-if="profile.beian && profile.gongan">·</span>
        <a v-if="profile.gongan" :href="profile.gongan.url" target="_blank" rel="noopener noreferrer">{{ profile.gongan.text }}</a>
      </div>
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
  flex-direction: row; /* default try to keep on one line */
  gap: 28px;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap; /* prefer single line */
  flex-wrap: nowrap;
  max-width: 95vw; /* Ensure it is constrained */
  box-sizing: border-box;
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

.beian { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }

.links a {
  color: inherit;
  text-decoration: none;
  font-weight: inherit;
  font-size: inherit;
}
.links { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: inherit; flex-wrap: wrap; }
.links a:hover { color: var(--text-color); }
.sep { opacity: 0.5; margin: 0 8px; }

/* Responsive: when viewport is narrow, reduce footer font-size to avoid overflow */
@media (max-width: 480px) {
  .footer-content { font-size: 0.72rem; padding: 8px 16px; }
  .links { gap: 6px; }
}

@media (max-width: 360px) {
  .footer-content { font-size: 0.66rem; }
  .sep { margin: 0 6px; }
}

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
