import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      clientPort: 3000,
      host: '3000-i38ap822v87sy2xai6x43-18e660f9.sandbox.novita.ai',
      protocol: 'wss'
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
