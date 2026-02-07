<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useMusicStore } from '../../stores/music'

type Track = {
  id: number
  title: string
  artist: string
  cover?: string
  url: string
  duration: number
}

type LyricLine = {
  time: number
  text: string
}

const props = defineProps({
  playlistUrl: { type: String, default: '' },
  apiBase: { type: String, default: 'https://musicapi.shinji.ren' },
  autoplay: { type: Boolean, default: false },
  // Optional: User real cookie for VIP
  cookie: { type: String, default: '' }
})

const tracks = ref<Track[]>([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const audioRef = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const showPlaylist = ref(false)
const playlistRef = ref(null)
const volume = ref(0.7)
const showVolume = ref(false)
const volumeRef = ref(null)

// 歌词相关
const lyrics = ref<LyricLine[]>([])
const transLyrics = ref<LyricLine[]>([])
const currentLyricIndex = ref(0)
const noLyric = ref(false)
const lyricScrollRef = ref<HTMLElement | null>(null)
const musicStore = useMusicStore()

// Sync playing state to global store
watch(isPlaying, (val) => {
    musicStore.setPlaying(val)
})

const currentTrack = computed(() => tracks.value[currentIndex.value])

// Close playlist on click outside
onClickOutside(playlistRef, () => {
  if (showPlaylist.value) showPlaylist.value = false
})

onClickOutside(volumeRef, () => {
  showVolume.value = false
})

// Volume Control
watch(volume, (v) => {
    if (audioRef.value) audioRef.value.volume = v
    localStorage.setItem('music_volume', v.toString())
})

watch(audioRef, (el) => {
    if (el) el.volume = volume.value
})

const progress = computed({
  get: () => {
     const d = duration.value || currentTrack.value?.duration || 0
     return d ? (currentTime.value / d) * 100 : 0
  },
  set: (val: number) => {
    const d = duration.value || currentTrack.value?.duration || 0
    if (!audioRef.value || !d) return
    audioRef.value.currentTime = (val / 100) * d
  }
})

const displayDuration = computed(() => {
    return duration.value || currentTrack.value?.duration || 0
})

const formatTime = (value: number) => {
  if (!value || Number.isNaN(value)) return '00:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const parseLyric = (lrcString: string) => {
  const lines = lrcString.split('\n')
  const parsed: LyricLine[] = []
  const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/
  
  for (const line of lines) {
    const match = timeExp.exec(line)
    if (match) {
      const min = parseInt(match[1]!)
      const sec = parseInt(match[2]!)
      const ms = parseInt(match[3]!.padEnd(3, '0'))
      const time = min * 60 + sec + ms / 1000
      const text = line.replace(timeExp, '').trim()
      if (text) {
        parsed.push({ time, text })
      }
    }
  }
  return parsed
}

// Find translated lyric by time (nearest within threshold)
const findTransByTime = (time: number, threshold = 0.5) => {
  if (!transLyrics.value || !transLyrics.value.length) return null
  let best: LyricLine | null = null
  let bestDiff = Infinity
  for (const t of transLyrics.value) {
    const diff = Math.abs(t.time - time)
    if (diff < bestDiff) {
      bestDiff = diff
      best = t
    }
  }
  return bestDiff <= threshold ? best : null
}

const fetchLyric = async (id: number) => {
  lyrics.value = []
  transLyrics.value = []
  currentLyricIndex.value = 0
  noLyric.value = false
  
  try {
    const res = await fetch(`${props.apiBase}/lyric?id=${id}`)
    const data = await res.json()
    if (data.lrc && data.lrc.lyric) {
      lyrics.value = parseLyric(data.lrc.lyric)
      // parse translated lyrics if available (tlyric)
      if (data.tlyric && data.tlyric.lyric) {
        transLyrics.value = parseLyric(data.tlyric.lyric)
      } else {
        transLyrics.value = []
      }
    } else {
      noLyric.value = true
    }
  } catch (e) {
    noLyric.value = true
  }
}

const extractPlaylistId = (url: string) => {
  if (!url) return null
  const match = url.match(/playlist\?id=(\d+)/) || url.match(/playlist\/(\d+)/) || url.match(/id=(\d+)/)
  return match ? match[1] : null
}

const loadPlaylist = async () => {
  const playlistId = extractPlaylistId(props.playlistUrl)
  if (!playlistId) {
    errorMessage.value = '请在配置中设置网易云歌单链接'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const playlistRes = await fetch(`${props.apiBase}/playlist/detail?id=${playlistId}`)
    const playlistData = await playlistRes.json()
    
    let rawTracks = playlistData?.playlist?.tracks || []
    
    // 如果详情中没有歌曲（某些 API 版本只返回 IDs），则获取详情
    if (!rawTracks.length && playlistData?.playlist?.trackIds?.length) {
        const trackIds = playlistData.playlist.trackIds.slice(0, 50).map((t: any) => t.id).join(',')
        const detailRes = await fetch(`${props.apiBase}/song/detail?ids=${trackIds}`)
        const detailData = await detailRes.json()
        rawTracks = detailData.songs || []
    } else {
        rawTracks = rawTracks.slice(0, 50)
    }

    if (!rawTracks.length) {
       errorMessage.value = '无法获取歌单详情'
       return 
    }

    // Try to get audio URLs
    let urlMap = new Map()
    try {
        const ids = rawTracks.map((track: any) => track.id).join(',')
        
        // Append cookie if provided
        let fetchUrl = `${props.apiBase}/song/url/v1?id=${ids}&level=standard&randomCNIP=true`
        if (props.cookie) {
             const encodedCookie = encodeURIComponent(props.cookie)
             fetchUrl += `&cookie=${encodedCookie}`
        }

        const urlRes = await fetch(fetchUrl)
        const urlData = await urlRes.json()
        urlMap = new Map((urlData?.data || []).map((item: any) => [item.id, item.url]))
    } catch (e) {
        console.warn('Batch URL fetch failed, will use direct fallback', e)
    }

    tracks.value = rawTracks
      .map((track: any) => {
         const apiUrl = urlMap.get(track.id)
         // Prefer API URL but force HTTPS. If missing, use fallback.
         const safeApiUrl = apiUrl ? apiUrl.replace(/^http:/, 'https:') : null
         
         // Direct fallback URL which works for most non-paid songs
         // Note: Do not rely solely on this as it may 404 for some tracks
         const fallbackUrl = `https://music.163.com/song/media/outer/url?id=${track.id}.mp3`
         
         return {
            id: track.id,
            title: track.name,
            artist: track.ar?.map((artist: any) => artist.name).join(' / ') || 'Unknown',
            cover: track.al?.picUrl ? track.al.picUrl.replace(/^http:/, 'https:') : '',
            url: safeApiUrl || fallbackUrl,
            duration: track.dt ? track.dt / 1000 : 0
        }
      })
      
    if (!tracks.value.length) {
      errorMessage.value = '未获取到可播放的歌曲'
    } else {
      const firstTrack = tracks.value[0]
      if (firstTrack) {
        fetchLyric(firstTrack.id)
      }
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = '音乐加载失败，请检查接口或网络'
  } finally {
    isLoading.value = false
  }
}

const togglePlay = async () => {
  if (!audioRef.value || !currentTrack.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    try {
      await audioRef.value.play()
    } catch (e) {
      console.error("Playback failed", e)
    }
  }
}

// Robust error handling to switch to fallback URL if primary fails
const onAudioError = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    if (!target || !currentTrack.value) return;

    // Prevent infinite error loops if the user interacts rapidly
    // or if the browser fires multiple error events
    if (isLoading.value && target.error?.code === 4) {
       // already handling, or just loaded empty
    }

    // e.target.error contains the MediaError code (1: Aborted, 2: Network, 3: Decode, 4: SrcNotSupported)
    console.warn(`Audio error for [${currentTrack.value.title}]:`, target.error, "Src:", target.src);

    const fallbackUrl = `https://music.163.com/song/media/outer/url?id=${currentTrack.value.id}.mp3`
    
    // Check if we are already using the fallback URL (check reactive state or current src)
    // We strictly check if the current track URL *is* the fallback, or if the audio src ends with the fallback pattern.
    const isFallback = currentTrack.value.url === fallbackUrl || target.src.includes(`id=${currentTrack.value.id}.mp3`);

    if (isFallback) {
         console.warn("Song unavailable (VIP/Copyright):", currentTrack.value.title)
         // Automatically skip to next song if this one is broken
         // Use a small delay/flag to prevent rapid skipping loops in case of global network failure
         if (isPlaying.value || props.autoplay) {
            errorMessage.value = `跳过: ${currentTrack.value.title}`
            setTimeout(() => {
                errorMessage.value = ''
                playNext()
            }, 1500)
         } else {
             // If not playing, just mark it as broken in UI?
             errorMessage.value = '无法播放(版权或VIP)'
         }
    } else {
        console.log("Switching to fallback URL strategy...")
        // Update the reactive state so Vue knows the URL changed
        const trackIndex = tracks.value.findIndex(t => currentTrack.value && t.id === currentTrack.value.id)
        if (trackIndex !== -1 && tracks.value[trackIndex]) {
            tracks.value[trackIndex].url = fallbackUrl
            
            // Force reload
            nextTick(() => {
                if (audioRef.value) {
                    audioRef.value.load()
                    if (isPlaying.value) {
                        const playPromise = audioRef.value.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(e => console.warn("Retry play failed", e))
                        }
                    }
                }
            })
        }
    }
}

const playNext = async () => {
  if (!tracks.value.length) return
  currentIndex.value = (currentIndex.value + 1) % tracks.value.length
  // Ensure autoplay continues when switching
  isPlaying.value = true
}

const playPrev = async () => {
  if (!tracks.value.length) return
  currentIndex.value = (currentIndex.value - 1 + tracks.value.length) % tracks.value.length
  // Ensure autoplay continues when switching
  isPlaying.value = true
}

const togglePlaylist = () => {
    showPlaylist.value = !showPlaylist.value
}

// Fix duration getting logic
const onDurationChange = () => {
  if (audioRef.value) {
     duration.value = audioRef.value.duration
  }
}

// 歌词滚动同步
watch(currentTime, (time) => {
  if (!lyrics.value.length) return
  
  // Find current line based on time
  const index = lyrics.value.findIndex((line, i) => {
     const nextLine = lyrics.value[i + 1]
     return time >= line.time && (!nextLine || time < nextLine.time)
  })
  
  if (index !== -1 && index !== currentLyricIndex.value) {
      currentLyricIndex.value = index
      
      // Update store for global display
      const line = lyrics.value[index]
      if (line) {
        const tline = findTransByTime(line.time)
        if (tline && /[\u4e00-\u9fff]/.test(tline.text)) {
          musicStore.setLyric(`${line.text}\n${tline.text}`)
        } else {
          musicStore.setLyric(line.text)
        }
      }

      // Scroll the lyrics container to keep the active line visible (reads lyricScrollRef)
      nextTick(() => {
        const container = lyricScrollRef.value
        if (!container) return
        const activeEl = container.querySelector('.lyric-line.active') as HTMLElement | null
        if (activeEl) {
          const offset = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2
          container.scrollTo({ top: offset, behavior: 'smooth' })
        }
      })
  }
})

watch(currentIndex, async () => {
  if (!currentTrack.value) return
  
  // Reset failure state/error message when track changes
  errorMessage.value = ''
  
  fetchLyric(currentTrack.value.id)
  
  if (audioRef.value) {
      // Don't set src manually here, rely on :src binding logic update
      // But we need to call load() after binding updates
      setTimeout(() => {
          if (audioRef.value) {
            audioRef.value.load()
            if (props.autoplay || isPlaying.value) {
                audioRef.value.play().catch(e => console.warn(e))
            }
          }
      }, 0)
  }
})

onMounted(() => {
    const savedVol = localStorage.getItem('music_volume')
    if (savedVol !== null) volume.value = parseFloat(savedVol)
    loadPlaylist()
})
</script>

<template>
  <div class="music-card-wrapper">
    <div class="bg-decoration"></div>

    <div class="player-container">
      <div class="player-shell relative">
        <div class="player-header">
          <div class="cover" :style="{ backgroundImage: currentTrack?.cover ? `url(${currentTrack.cover})` : '' }">
            <span v-if="!currentTrack?.cover" class="cover-placeholder">♪</span>
          </div>
          <div class="meta">
            <div class="title">{{ currentTrack?.title || '音乐播放器' }}</div>
            <div class="artist">{{ currentTrack?.artist || (isLoading ? '加载中...' : '等待配置歌单') }}</div>
          </div>
          <div class="controls">
            <div class="relative inline-block volume-control">
                <button class="icon-btn" type="button" @click.stop="showVolume = !showVolume" :class="{ 'active': showVolume }" aria-label="音量">
                   <i class="fa-solid" :class="volume === 0 ? 'fa-volume-xmark' : (volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high')"></i>
                </button>
                
                <!-- Volume Popup (Horizontal) -->
                <div v-if="showVolume" class="volume-popup fade-in" ref="volumeRef" @click.stop>
                    <input 
                        v-model.number="volume" 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        class="volume-slider"
                    >
                </div>
            </div>
            <button class="icon-btn" type="button" @click="playPrev" aria-label="上一首">
              <i class="fa-solid fa-backward-step"></i>
            </button>
            <button class="icon-btn primary" type="button" @click="togglePlay" :disabled="!currentTrack">
              <i class="fa-solid" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
            </button>
            <button class="icon-btn" type="button" @click="playNext" aria-label="下一首">
              <i class="fa-solid fa-forward-step"></i>
            </button>
            <button class="icon-btn" type="button" @click.stop="togglePlaylist" :class="{ 'active': showPlaylist }" aria-label="歌单">
                <i class="fa-solid fa-list-ul"></i>
            </button>
          </div>
        </div>

        <div class="progress-row">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <input
            v-model.number="progress"
            type="range"
            min="0"
            max="100"
            step="0.1"
            class="progress"
            :disabled="!currentTrack"
          />
          <span class="time">{{ formatTime(displayDuration) }}</span>
        </div>

        <div v-if="errorMessage" class="error-message absolute-error">{{ errorMessage }}</div>

        <!-- Playlist Overlay (Independent Layer) -->
        <div v-if="showPlaylist" class="playlist-overlay fade-in" ref="playlistRef">
            <div class="playlist-header">播放列表 ({{ tracks.length }})</div>
            <div class="playlist-scroll">
                <button
                    v-for="(track, index) in tracks"
                    :key="track.id"
                    class="track-item"
                    :class="{ active: index === currentIndex }"
                    type="button"
                    @click="currentIndex = index; showPlaylist = false"
                >
                    <span class="track-index">{{ index + 1 }}</span>
                    <div class="track-info">
                         <span class="track-title">{{ track.title }}</span>
                         <span class="track-artist">{{ track.artist }}</span>
                    </div>
                </button>
            </div>
        </div>

      </div>
    </div>

    <audio
      ref="audioRef"
      :src="currentTrack?.url"
      @timeupdate="currentTime = audioRef?.currentTime || 0"
      @loadedmetadata="onDurationChange"
      @durationchange="onDurationChange"
      @ended="playNext"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @error="onAudioError"
      referrerpolicy="no-referrer"
    ></audio>
  </div>
</template>

<style scoped lang="scss">
.music-card-wrapper {
    background: transparent;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
}

.bg-decoration {
    position: absolute;
    top: -50%; right: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
  background-repeat: no-repeat;
  transform: translateZ(0);
}

.player-container {
    width: 100%;
    padding: 0 16px;
    z-index: 10;
    box-sizing: border-box;
}

.player-shell {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  padding: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative; 
  overflow: hidden; /* Important for overlay containment */
  background-clip: padding-box;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.player-header {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
}

.cover {
  width: 72px;
  height: 72px;
  display: flex; /* flex-center replacement */
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; /* text truncate fix */
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &.active {
      background: rgba(255, 255, 255, 0.3);
  }
}

.icon-btn.primary {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 16px;
}

.relative { position: relative; }
.volume-popup {
    position: absolute;
    top: 120%; /* Below the button */
    left: 0; 
    transform: none; /* Align left */
    width: 100px;
    height: 32px;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 50;
    padding: 0 10px;
}
.volume-slider {
    width: 100%;
    height: 4px;
    transform: none; /* Horizontal */
    accent-color: #fff;
    cursor: pointer;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.progress-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.75rem;
}

.progress {
  width: 100%;
  accent-color: rgba(255, 255, 255, 0.8);
  height: 4px;
}

.error-message {
  color: rgba(255, 200, 200, 0.9);
  font-size: 0.8rem;
}
.absolute-error {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    padding: 4px 8px;
    border-radius: 4px;
    z-index: 50;
    pointer-events: none;
    width: 90%;
    text-align: center;
}

.player-shell {
    justify-content: center;
    height: 100%;
}

/* Playlist Overlay Styles */
.playlist-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(15px);
    z-index: 20;
    display: flex;
    flex-direction: column;
    padding: 12px;
}

.playlist-header {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-scroll {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    /* Custom Scrollbar for list */
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.track-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.track-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.track-index {
    width: 20px;
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
}
.track-item.active .track-index {
    color: #1DB954; /* Spotify Green tint for active indicator */
}

.track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
}

.track-title {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.fade-in {
    animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Mobile Optimization */
@media (max-width: 600px) {
    .player-header {
        grid-template-columns: 56px minmax(0, 1fr) auto;
        gap: 12px;
    }
    .cover {
        width: 56px;
        height: 56px;
        font-size: 20px;
    }
    .controls {
        gap: 6px;
    }
    .icon-btn {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
    .icon-btn.primary {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }
    /* Hide volume slider on mobile to save space (use system volume) */
    .volume-control {
        display: none;
    }
    .title {
        font-size: 0.95rem;
    }
    .artist {
        font-size: 0.8rem;
    }
}
</style>