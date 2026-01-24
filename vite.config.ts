import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/ui',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/ui/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    }
  }
});
