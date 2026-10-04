import { NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserGamesService } from '../src/user-games/user-games.service.js';

import { PriceAlertsService } from '../src/price-alerts/price-alerts.service.js';

import {
  PRICE_ALERTS_REPOSITORY,
  type PriceAlertsRepositoryContract,
} from '../src/price-alerts/repositories/price-alerts.repository.interface.js';

import type { PriceAlert } from '../src/price-alerts/entities/price-alert.entity.js';

describe('PriceAlertsService', () => {
  let service: PriceAlertsService;

  const priceAlertsRepositoryMock = {
    findByUserAndGame:
      vi.fn<PriceAlertsRepositoryContract['findByUserAndGame']>(),

    findAllByUser: vi.fn<PriceAlertsRepositoryContract['findAllByUser']>(),

    findAllActive: vi.fn<PriceAlertsRepositoryContract['findAllActive']>(),

    create: vi.fn<PriceAlertsRepositoryContract['create']>(),

    save: vi.fn<PriceAlertsRepositoryContract['save']>(),

    remove: vi.fn<PriceAlertsRepositoryContract['remove']>(),
  };

  const userGamesServiceMock = {
    ensureGameInLibrary: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceAlertsService,

        {
          provide: PRICE_ALERTS_REPOSITORY,
          useValue: priceAlertsRepositoryMock,
        },

        {
          provide: UserGamesService,
          useValue: userGamesServiceMock,
        },
      ],
    }).compile();

    service = module.get<PriceAlertsService>(PriceAlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all price alerts for user', async () => {
      const alerts = [
        {
          id: 1,
          userId: 10,
          gameId: 5,
          targetPrice: 30,
          isActive: true,
          isTriggered: false,
          lastNotifiedPrice: null,
          lastCheckedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as PriceAlert[];

      priceAlertsRepositoryMock.findAllByUser.mockResolvedValue(alerts);

      const result = await service.findAll(10);

      expect(result).toEqual(alerts);

      expect(priceAlertsRepositoryMock.findAllByUser).toHaveBeenCalledWith(10);
    });
  });

  describe('setAlert', () => {
    it('should create a new alert when one does not exist', async () => {
      userGamesServiceMock.ensureGameInLibrary.mockResolvedValue({
        userId: 10,
        gameId: 5,
      });

      priceAlertsRepositoryMock.findByUserAndGame.mockResolvedValue(null);

      const createdAlert = {
        id: 1,
        userId: 10,
        gameId: 5,
        targetPrice: 29.99,
        isActive: true,
        isTriggered: false,
        lastNotifiedPrice: null,
        lastCheckedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PriceAlert;

      priceAlertsRepositoryMock.create.mockResolvedValue(createdAlert);

      const result = await service.setAlert(10, 5, 29.99);

      expect(userGamesServiceMock.ensureGameInLibrary).toHaveBeenCalledWith(
        10,
        5,
      );

      expect(priceAlertsRepositoryMock.findByUserAndGame).toHaveBeenCalledWith(
        10,
        5,
      );

      expect(priceAlertsRepositoryMock.create).toHaveBeenCalledWith(
        10,
        5,
        29.99,
      );

      expect(result).toEqual(createdAlert);
    });

    it('should update and re-arm an existing alert', async () => {
      userGamesServiceMock.ensureGameInLibrary.mockResolvedValue({
        userId: 10,
        gameId: 5,
      });

      const existingAlert = {
        id: 1,
        userId: 10,
        gameId: 5,
        targetPrice: 30,
        isActive: false,
        isTriggered: true,
        lastNotifiedPrice: 25,
        lastCheckedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PriceAlert;

      priceAlertsRepositoryMock.findByUserAndGame.mockResolvedValue(
        existingAlert,
      );

      priceAlertsRepositoryMock.save.mockImplementation(async (alert) => alert);

      const result = await service.setAlert(10, 5, 20);

      expect(priceAlertsRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          targetPrice: 20,
          isActive: true,
          isTriggered: false,
          lastNotifiedPrice: null,
        }),
      );

      expect(result.targetPrice).toBe(20);

      expect(result.isActive).toBe(true);

      expect(result.isTriggered).toBe(false);

      expect(result.lastNotifiedPrice).toBeNull();
    });

    it('should stop when game is not in user library', async () => {
      userGamesServiceMock.ensureGameInLibrary.mockRejectedValue(
        new NotFoundException('Game was not found in your library'),
      );

      await expect(service.setAlert(10, 999, 30)).rejects.toThrow(
        NotFoundException,
      );

      expect(
        priceAlertsRepositoryMock.findByUserAndGame,
      ).not.toHaveBeenCalled();

      expect(priceAlertsRepositoryMock.create).not.toHaveBeenCalled();

      expect(priceAlertsRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('removeAlert', () => {
    it('should remove an existing alert', async () => {
      const alert = {
        id: 1,
        userId: 10,
        gameId: 5,
        targetPrice: 30,
      } as PriceAlert;

      priceAlertsRepositoryMock.findByUserAndGame.mockResolvedValue(alert);

      priceAlertsRepositoryMock.remove.mockResolvedValue(alert);

      const result = await service.removeAlert(10, 5);

      expect(priceAlertsRepositoryMock.findByUserAndGame).toHaveBeenCalledWith(
        10,
        5,
      );

      expect(priceAlertsRepositoryMock.remove).toHaveBeenCalledWith(alert);

      expect(result).toEqual({
        message: 'Price alert removed successfully',
      });
    });

    it('should throw when price alert does not exist', async () => {
      priceAlertsRepositoryMock.findByUserAndGame.mockResolvedValue(null);

      await expect(service.removeAlert(10, 5)).rejects.toThrow(
        NotFoundException,
      );

      expect(priceAlertsRepositoryMock.remove).not.toHaveBeenCalled();
    });
  });
});
