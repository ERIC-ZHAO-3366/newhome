import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://musicapi.shinji.ren',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'meting-js'
      }
    }
  })],
})
