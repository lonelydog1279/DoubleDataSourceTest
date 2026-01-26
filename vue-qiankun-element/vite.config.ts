import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue-qiankun-element', {
      useDevMode: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  base: '/'
})
