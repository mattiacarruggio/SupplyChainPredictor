import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30000,
  },
});
