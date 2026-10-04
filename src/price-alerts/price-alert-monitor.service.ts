import { Inject, Injectable, Logger } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';

import { EmailService } from '../email/email.service.js';

import { GameDealsService } from '../integrations/cheapshark/game-deals.service.js';

import {
  PRICE_ALERTS_REPOSITORY,
  type PriceAlertsRepositoryContract,
} from './repositories/price-alerts.repository.interface.js';

@Injectable()
export class PriceAlertMonitorService {
  private readonly logger = new Logger(PriceAlertMonitorService.name);

  constructor(
    @Inject(PRICE_ALERTS_REPOSITORY)
    private readonly priceAlertsRepository: PriceAlertsRepositoryContract,

    private readonly gameDealsService: GameDealsService,

    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkAlerts() {
    const alerts = await this.priceAlertsRepository.findAllActive();

    const gameIds = [...new Set(alerts.map((alert) => alert.gameId))];

    for (const gameId of gameIds) {
      try {
        const result = await this.gameDealsService.getDeals(gameId);

        const cheapest = result.deals[0];

        if (!cheapest) {
          continue;
        }

        const gameAlerts = alerts.filter((alert) => alert.gameId === gameId);

        for (const alert of gameAlerts) {
          await this.processAlert(alert, cheapest.price, cheapest.dealUrl);
        }
      } catch (error) {
        this.logger.error(`Failed to check price for game ${gameId}`, error);
      }
    }
  }

  private async processAlert(
    alert: Awaited<
      ReturnType<PriceAlertsRepositoryContract['findAllActive']>
    >[number],

    currentPrice: number,
    dealUrl: string,
  ) {
    const belowTarget = currentPrice <= alert.targetPrice;

    const priceDroppedFurther =
      alert.lastNotifiedPrice === null ||
      alert.lastNotifiedPrice === undefined ||
      currentPrice < alert.lastNotifiedPrice;

    const shouldNotify =
      belowTarget && (!alert.isTriggered || priceDroppedFurther);

    if (shouldNotify) {
      await this.emailService.sendPriceDropEmail(
        alert.user.email,
        alert.game.title,
        alert.targetPrice,
        currentPrice,
        dealUrl,
      );

      alert.isTriggered = true;

      alert.lastNotifiedPrice = currentPrice;
    }

    // Price went back above threshold.
    // Re-arm the alert.
    if (!belowTarget && alert.isTriggered) {
      alert.isTriggered = false;
    }

    alert.lastCheckedAt = new Date();

    await this.priceAlertsRepository.save(alert);
  }
}
