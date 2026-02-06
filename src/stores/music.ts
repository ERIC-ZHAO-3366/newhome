import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMusicStore = defineStore('music', () => {
    const currentLyric = ref('')
    const isPlaying = ref(false)

    const setLyric = (text: string) => {
        currentLyric.value = text
    }

    const setPlaying = (playing: boolean) => {
        isPlaying.value = playing
    }

    return {
        currentLyric,
        isPlaying,
        setLyric,
        setPlaying
    }
})
