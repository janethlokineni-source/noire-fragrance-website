import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/noire-fragrance-website/',
  plugins: [react()],
  server: {
    port: 8080,
    host: true,
  },
})
