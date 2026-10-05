import { Test, TestingModule } from '@nestjs/testing';

import { HealthIndicatorService } from '@nestjs/terminus';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppCacheService } from '../src/cache/app-cache.service.js';

import { RedisHealthIndicator } from '../src/health/redis-health.indicator.js';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;

  const upMock = vi.fn();

  const degradedMock = vi.fn();

  const healthIndicatorServiceMock = {
    check: vi.fn(),
  };

  const cacheServiceMock = {
    isAvailable: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    upMock.mockReturnValue({
      redis: {
        status: 'up',
      },
    });

    degradedMock.mockImplementation((message: string) => ({
      redis: {
        status: 'degraded',

        message,
      },
    }));

    healthIndicatorServiceMock.check.mockReturnValue({
      up: upMock,

      degraded: degradedMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,

        {
          provide: HealthIndicatorService,

          useValue: healthIndicatorServiceMock,
        },

        {
          provide: AppCacheService,

          useValue: cacheServiceMock,
        },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should report Redis as up when cache is available', async () => {
    cacheServiceMock.isAvailable.mockResolvedValue(true);

    const result = await indicator.isHealthy('redis');

    expect(healthIndicatorServiceMock.check).toHaveBeenCalledWith('redis');

    expect(upMock).toHaveBeenCalled();

    expect(degradedMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      redis: {
        status: 'up',
      },
    });
  });

  it('should report Redis as degraded when cache is unavailable', async () => {
    cacheServiceMock.isAvailable.mockResolvedValue(false);

    const result = await indicator.isHealthy('redis');

    expect(degradedMock).toHaveBeenCalledWith(
      'Redis unavailable; serving without cache',
    );

    expect(upMock).not.toHaveBeenCalled();

    expect(result).toEqual({
      redis: {
        status: 'degraded',

        message: 'Redis unavailable; serving without cache',
      },
    });
  });
});
