import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 개발 서버와 Vue 플러그인을 설정합니다.
export default defineConfig({ plugins: [vue()], base: './' })
