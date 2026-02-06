<script setup lang="ts">
import profile from '../../config/profile.json'
</script>

<template>
  <div class="profile-card h-full w-full flex flex-col justify-between p-8 text-left">
    <div class="top-section flex justify-between items-start">
      <div class="avatar-container">
        <img :src="profile.avatar" alt="Avatar" class="avatar" />
        <div class="status-indicator"></div>
      </div>
    </div>
    
    <div class="info-section mt-4">
       <div class="tags flex gap-2 mb-3">
         <span v-for="tag in profile.tags" :key="tag" class="tag">{{ tag }}</span>
       </div>
       <h2 class="name text-2xl font-bold text-gray-800">{{ profile.name }}</h2>
       <p class="bio text-sm text-secondary mt-2 leading-relaxed" style="font-family: 'Long Cang', cursive; font-size: 1.2rem;">{{ profile.bio }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-card {
  height: 100%;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}
.avatar-container {
  position: relative;
  &:hover .avatar { transform: scale(1.05); }
}
.status-indicator {
  position: absolute;
  bottom: 5px; right: 5px;
  width: 14px; height: 14px;
  background: #34c759;
  border: 2px solid #fff;
  border-radius: 50%;
}
.name { color: var(--text-color); margin: 0; }
.text-secondary { color: var(--text-secondary); }
.tag {
  font-size: 0.75rem;
  padding: 4px 10px;
  background: rgba(0,0,0,0.05);
  border-radius: 12px;
  font-weight: 600;
  color: #555;
  margin-right: 5px;
}

:global(.dark) .tag {
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
}

.icon-btn {
  width: 32px; height: 32px;
  display: flex; justify-content: center; align-items: center;
  border-radius: 50%;
  background: white;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  &:hover { background: #000; color: #fff; }
}
.top-section {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* Utilities fallback for safe styling */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-between { justify-content: space-between; }
.items-start { align-items: flex-start; }
.gap-2 { gap: 0.5rem; }
.p-8 { padding: 2rem; }
.mt-4 { margin-top: 1rem; }
.mb-3 { margin-bottom: 0.75rem; }

.bio { 
  /* Use primary text color for better contrast in light/day mode */
  color: var(--text-color); 
  margin-top: 0.5rem;
  line-height: 1.6;
  
  /* Prevent overflow */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; 
  line-clamp: 3;
  overflow: hidden; 
  text-overflow: ellipsis;
}
</style>
