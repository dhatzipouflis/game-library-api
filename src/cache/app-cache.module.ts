import { Global, Module } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { createKeyv } from '@keyv/redis';

import { AppCacheService } from './app-cache.service.js';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        stores: [createKeyv(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
  ],

  providers: [AppCacheService],

  exports: [AppCacheService],
})
export class AppCacheModule {}
