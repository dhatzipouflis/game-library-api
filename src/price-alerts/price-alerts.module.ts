import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';

import { EmailModule } from '../email/email.module.js';

import { CheapSharkModule } from '../integrations/cheapshark/cheapshark.module.js';

import { UserGamesModule } from '../user-games/user-games.module.js';

import { PriceAlert } from './entities/price-alert.entity.js';

import { PriceAlertMonitorService } from './price-alert-monitor.service.js';

import { PriceAlertsController } from './price-alerts.controller.js';

import { PriceAlertsService } from './price-alerts.service.js';

import { PriceAlertsRepository } from './repositories/price-alerts.repository.js';

import { PRICE_ALERTS_REPOSITORY } from './repositories/price-alerts.repository.interface.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceAlert]),
    AuthModule,
    UserGamesModule,
    CheapSharkModule,
    EmailModule,
  ],

  controllers: [PriceAlertsController],

  providers: [
    PriceAlertsService,
    PriceAlertMonitorService,
    {
      provide: PRICE_ALERTS_REPOSITORY,
      useClass: PriceAlertsRepository,
    },
  ],
})
export class PriceAlertsModule {}
