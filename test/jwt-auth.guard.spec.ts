import { describe, expect, it } from 'vitest';

import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const guard = new JwtAuthGuard();

    expect(guard).toBeDefined();
  });
});
