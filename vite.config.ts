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
      // Force SWC to run on build (not just dev) so decorator metadata is preserved.
      plugins: [],
      useAtYourOwnRisk_mutateSwcOptions(options) {
        options.jsc ??= {};
        options.jsc.transform ??= {};
        options.jsc.transform.legacyDecorator = true;
        options.jsc.transform.decoratorMetadata = true;
      },
    }),
  ],
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
