import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routeFilePrefix: '~',
    }),
    react(),
    wasm(),
    topLevelAwait(),
  ],
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm'],
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', 'tests/**', 'dist/**'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
