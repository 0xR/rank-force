import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // @ts-ignore
  plugins: [react(), tsconfigPaths()],
  test: {
    setupFiles: ['./test/setup-tests.ts'],
    environment: 'jsdom',
    globals: true,
  },
});
