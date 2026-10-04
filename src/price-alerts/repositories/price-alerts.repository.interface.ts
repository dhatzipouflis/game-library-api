import type { PriceAlert } from '../entities/price-alert.entity.js';

export const PRICE_ALERTS_REPOSITORY = Symbol('PRICE_ALERTS_REPOSITORY');

export interface PriceAlertsRepositoryContract {
  findByUserAndGame(userId: number, gameId: number): Promise<PriceAlert | null>;

  findAllByUser(userId: number): Promise<PriceAlert[]>;

  findAllActive(): Promise<PriceAlert[]>;

  create(
    userId: number,
    gameId: number,
    targetPrice: number,
  ): Promise<PriceAlert>;

  save(alert: PriceAlert): Promise<PriceAlert>;

  remove(alert: PriceAlert): Promise<PriceAlert>;
}
