import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: false,
    // Proxy API calls to the Node backend during dev.
    proxy: { '/api': process.env.VITE_API_TARGET || 'http://localhost:5174' },
  },
})
