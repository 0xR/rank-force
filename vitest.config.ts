import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // @ts-ignore
  plugins: [react(), tsconfigPaths()],
  test: {
    setupFiles: ['./rank-force/tests/setup-tests.ts'],
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', 'tests/**', 'tests-examples/**'],
  },
});
