import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Adjust base when deploying to GitHub Pages, e.g., '/repo-name/'
// Set BASE_URL in env to override; defaults to '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL || '/treasure-code-quest/',
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    minify: false,
    reportCompressedSize: false,
    emptyOutDir: true
  }
})
