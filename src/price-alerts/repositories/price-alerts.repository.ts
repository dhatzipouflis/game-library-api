import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PriceAlert } from '../entities/price-alert.entity.js';

import type { PriceAlertsRepositoryContract } from './price-alerts.repository.interface.js';

@Injectable()
export class PriceAlertsRepository implements PriceAlertsRepositoryContract {
  constructor(
    @InjectRepository(PriceAlert)
    private readonly repository: Repository<PriceAlert>,
  ) {}

  findByUserAndGame(userId: number, gameId: number) {
    return this.repository.findOne({
      where: {
        userId,
        gameId,
      },
    });
  }

  findAllByUser(userId: number) {
    return this.repository.find({
      where: {
        userId,
      },
      relations: {
        game: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findAllActive() {
    return this.repository.find({
      where: {
        isActive: true,
      },
      relations: {
        user: true,
        game: true,
      },
    });
  }

  async create(userId: number, gameId: number, targetPrice: number) {
    const alert = this.repository.create({
      userId,
      gameId,
      targetPrice,
    });

    return this.repository.save(alert);
  }

  save(alert: PriceAlert) {
    return this.repository.save(alert);
  }

  remove(alert: PriceAlert) {
    return this.repository.remove(alert);
  }
}
