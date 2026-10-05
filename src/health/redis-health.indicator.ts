import { Injectable } from '@nestjs/common';

import { HealthIndicatorService } from '@nestjs/terminus';

import { AppCacheService } from '../cache/app-cache.service.js';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,

    private readonly cacheService: AppCacheService,
  ) {}

async isHealthy(key: string) {
  const indicator = this.healthIndicatorService.check(key);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const available = await Promise.race([
      this.cacheService.isAvailable(),

      new Promise<boolean>((resolve) => {
        timeoutId = setTimeout(() => resolve(false), 1_000);
      }),
    ]);

    if (!available) {
      return indicator.degraded(
        'Redis unavailable; serving without cache',
      );
    }

    return indicator.up();
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
}
