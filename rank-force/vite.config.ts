import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routeFilePrefix: '~',
    }),
    react({
      tsDecorators: true,
    }),
  ],
  test: {
    setupFiles: ['./tests/setup-tests.ts'],
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
