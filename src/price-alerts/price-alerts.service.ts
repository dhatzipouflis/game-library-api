import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UserGamesService } from '../user-games/user-games.service.js';

import {
  PRICE_ALERTS_REPOSITORY,
  type PriceAlertsRepositoryContract,
} from './repositories/price-alerts.repository.interface.js';

@Injectable()
export class PriceAlertsService {
  constructor(
    @Inject(PRICE_ALERTS_REPOSITORY)
    private readonly priceAlertsRepository: PriceAlertsRepositoryContract,

    private readonly userGamesService: UserGamesService,
  ) {}

  findAll(userId: number) {
    return this.priceAlertsRepository.findAllByUser(userId);
  }

  async setAlert(userId: number, gameId: number, targetPrice: number) {
    await this.userGamesService.ensureGameInLibrary(userId, gameId);

    const existing = await this.priceAlertsRepository.findByUserAndGame(
      userId,
      gameId,
    );

    if (existing) {
      existing.targetPrice = targetPrice;

      existing.isActive = true;

      // Changing the target re-arms it.
      existing.isTriggered = false;

      existing.lastNotifiedPrice = null;

      return this.priceAlertsRepository.save(existing);
    }

    return this.priceAlertsRepository.create(userId, gameId, targetPrice);
  }

  async removeAlert(userId: number, gameId: number) {
    const alert = await this.priceAlertsRepository.findByUserAndGame(
      userId,
      gameId,
    );

    if (!alert) {
      throw new NotFoundException('Price alert was not found');
    }

    await this.priceAlertsRepository.remove(alert);

    return {
      message: 'Price alert removed successfully',
    };
  }
}
