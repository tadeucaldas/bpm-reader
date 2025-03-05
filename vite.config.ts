import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      name: 'My Vue App',
      short_name: 'VueApp',
      description: 'My Vue.js Application',
      theme_color: '#ffffff'
    },
  })],
  base: '/bpm-reader',
  /*build: {
    outDir: 'docs',
    emptyOutDir: true,
  },*/
  server: {
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
    },
    host: '0.0.0.0', // Permite acesso de outros dispositivos na rede
    port: 5173, // Pode ser alterado
  }
})
