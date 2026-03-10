import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/renderer/app/index.html'),
        countdown: resolve(__dirname, 'src/renderer/countdown/index.html'),
        indicator: resolve(__dirname, 'src/renderer/indicator/index.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
});
