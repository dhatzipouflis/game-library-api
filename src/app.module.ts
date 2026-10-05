import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesModule } from './games/games.module.js';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { AuthModule } from './auth/auth.module.js';
import { UserGamesModule } from './user-games/user-games.module.js';
import { RawgModule } from './integrations/rawg/rawg.module.js';
import { CheapSharkModule } from './integrations/cheapshark/cheapshark.module.js';
import { PriceAlertsModule } from './price-alerts/price-alerts.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { AppCacheModule } from './cache/app-cache.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),

        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),

    ScheduleModule.forRoot(),

    GamesModule,
    AuthModule,
    UserGamesModule,
    RawgModule,
    CheapSharkModule,
    PriceAlertsModule,
    AppCacheModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
