import { ConfigService } from '@nestjs/config';

import { describe, expect, it, vi } from 'vitest';

import { JwtStrategy } from '../src/auth/strategies/jwt.strategy.js';

describe('JwtStrategy', () => {
  it('should map JWT payload to authenticated user', () => {
    const configService = {
      getOrThrow: vi.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(configService);

    const result = strategy.validate({
      sub: 42,
      username: 'qrowley',
      email: 'user@example.com',
    });

    expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');

    expect(result).toEqual({
      id: 42,
      username: 'qrowley',
      email: 'user@example.com',
    });
  });
});
