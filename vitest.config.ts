import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',

      reporter: ['text', 'html', 'json-summary', 'json'],

      reportOnFailure: true,

      include: [
        'src/**/*.service.ts',
        'src/**/*.guard.ts',
        'src/**/*.strategy.ts',
        'src/**/*.filter.ts',
      ],

      exclude: ['src/app.service.ts'],

      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
});
