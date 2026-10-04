import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module.js';
import { GamesModule } from '../../games/games.module.js';

import { CheapSharkController } from './cheapshark.controller.js';
import { CheapSharkService } from './cheapshark.service.js';

import { GameDealsController } from './game-deals.controller.js';
import { GameDealsService } from './game-deals.service.js';

@Module({
  imports: [
    ConfigModule,

    HttpModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>('CHEAPSHARK_BASE_URL'),

        timeout: 5000,

        headers: {
          'User-Agent': configService.getOrThrow<string>(
            'CHEAPSHARK_USER_AGENT',
          ),
        },
      }),
    }),

    AuthModule,
    GamesModule,
  ],

  controllers: [CheapSharkController, GameDealsController],

  providers: [CheapSharkService, GameDealsService],
})
export class CheapSharkModule {}
