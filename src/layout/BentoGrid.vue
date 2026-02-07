<script setup lang="ts">
import { defineAsyncComponent, ref, computed } from 'vue'
import gridConfigRaw from '../config/grid.json'

const components: Record<string, any> = {
  ProfileCard: defineAsyncComponent(() => import('../components/Widgets/ProfileCard.vue')),
  MusicCard: defineAsyncComponent(() => import('../components/Widgets/MusicCard.vue')),
  LinkBlock: defineAsyncComponent(() => import('../components/Widgets/LinkBlock.vue')),
  MottoCard: defineAsyncComponent(() => import('../components/Widgets/MottoCard.vue')),
  FriendsCard: defineAsyncComponent(() => import('../components/Widgets/FriendsCard.vue'))
}

// Inject Env Variables
const gridConfig = computed(() => {
    return gridConfigRaw.map(item => {
        if (item.id === 'music') {
            const cookie = import.meta.env.VITE_MUSIC_COOKIE
            if (cookie) {
                return {
                    ...item,
                    props: {
                        ...item.props,
                        cookie: cookie
                    }
                }
            }
        }
        return item
    })
})

const gridRef = ref<HTMLElement | null>(null)

const handleMouseMove = (e: MouseEvent) => {
  if (!gridRef.value) return

  // gridRef may point to a raw HTMLElement (if ref applied to a native element)
  // or to a component instance (transition-group). Normalize to an HTMLElement.
  let container: HTMLElement | null = null
  const maybe: any = gridRef.value
  if (maybe instanceof HTMLElement) {
    container = maybe
  } else if (maybe.$el && maybe.$el instanceof HTMLElement) {
    container = maybe.$el
  } else if (maybe?.$el?.$el && maybe.$el.$el instanceof HTMLElement) {
    // safety for wrapped components
    container = maybe.$el.$el
  }

  if (!container) return

  const cards = container.getElementsByClassName('grid-item') as HTMLCollectionOf<HTMLElement>
  for (const card of cards) {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }
}
</script>

<template>
  <div class="bento-container">
    <transition-group 
        name="list" 
        tag="div" 
        class="bento-grid"
        ref="gridRef"
        @mousemove="handleMouseMove"
    >
      <component
        v-for="item in gridConfig"
        :key="item.id"
        :is="components[item.type]"
        :class="['grid-item', `size-${item.size}`, 'glass', `id-${item.id}`]"
        v-bind="item.props || {}"
      />
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
.bento-container {
  width: 100%;
  max-width: 1100px;
  animation: fadeIn 0.8s ease-out;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 180px; 
  gap: var(--gap);
  padding: 10px;

  // Tablet: Force 4x items to be 2x, etc
  @media (max-width: 900px) {
     grid-template-columns: repeat(2, minmax(0, 1fr));
     
     // Deep selector to override dynamic classes if needed, 
     // but usually changing loop logic or CSS grid rules is better.
     // Here we rely on the grid-column span.
  }

  // Mobile: Stack everything
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .grid-item {
        height: auto;
        min-height: 180px;
    }
  }
}

.grid-item {
  border-radius: var(--radius);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
  
  // Spotlight effect
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    /* Use GPU compositing and avoid repeated background artifacts */
    background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%);
    background-repeat: no-repeat;
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    will-change: opacity, background-position, transform;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
    z-index: 2;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
    z-index: 5;
  }
}

.bento-grid:hover .grid-item::before {
  opacity: 1;
}

// Sizes (Desktop default)
.size-1x1 { grid-column: span 1; grid-row: span 1; }
.size-2x1 { grid-column: span 2; grid-row: span 1; }
.size-2x2 { grid-column: span 2; grid-row: span 2; }
.size-1x2 { grid-column: span 1; grid-row: span 2; }
.size-4x1 { grid-column: span 4; grid-row: span 1; }

// Tablet Overrides
@media (max-width: 900px) and (min-width: 601px) {
  .size-4x1 { grid-column: span 2; } 
  // Keep 2x2 as span 2
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
