import { Controller, Get } from '@nestjs/common';

import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { RedisHealthIndicator } from './redis-health.indicator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,

    private readonly database: TypeOrmHealthIndicator,

    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Check application health',
  })
  @ApiOkResponse({
    description: 'Application is healthy or degraded',
  })
  @ApiServiceUnavailableResponse({
    description: 'A critical dependency is unavailable',
  })
  check() {
    return this.health.check([
      () =>
        this.database.pingCheck('database').withTimeout(1_000).cacheFor(5_000),

      () => this.redis.isHealthy('redis'),
    ]);
  }
}
