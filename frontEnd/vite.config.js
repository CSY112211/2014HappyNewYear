import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:3000', // 指定代理的目标地址
      changeOrigin: true, // 允许改变源
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
