import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.PORTAL_API_TARGET ?? 'http://127.0.0.1:8083',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
