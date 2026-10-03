import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lost: resolve(__dirname, 'lost.html'),
        found: resolve(__dirname, 'found.html'),
        matches: resolve(__dirname, 'matches.html'),
        claims: resolve(__dirname, 'claims.html'),
        aiHub: resolve(__dirname, 'ai-hub.html'),
      }
    }
  }
});
