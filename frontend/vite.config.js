import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if HTTPS certificates exist
const certPath = path.resolve(__dirname, '../certs/cert.pem')
const keyPath = path.resolve(__dirname, '../certs/key.pem')
const hasHttps = fs.existsSync(certPath) && fs.existsSync(keyPath)

const httpsConfig = hasHttps ? {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
} : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: hasHttps ? 'https://localhost:3001' : 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
