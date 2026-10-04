import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailService } from '../src/email/email.service.js';

import { GameDealsService } from '../src/integrations/cheapshark/game-deals.service.js';

import { PriceAlertMonitorService } from '../src/price-alerts/price-alert-monitor.service.js';

import {
  PRICE_ALERTS_REPOSITORY,
  type PriceAlertsRepositoryContract,
} from '../src/price-alerts/repositories/price-alerts.repository.interface.js';

import type { PriceAlert } from '../src/price-alerts/entities/price-alert.entity.js';

describe('PriceAlertMonitorService', () => {
  let service: PriceAlertMonitorService;

  const priceAlertsRepositoryMock = {
    findByUserAndGame: vi.fn(),

    findAllByUser: vi.fn(),

    findAllActive: vi.fn<PriceAlertsRepositoryContract['findAllActive']>(),

    create: vi.fn(),

    save: vi.fn<PriceAlertsRepositoryContract['save']>(),

    remove: vi.fn(),
  };

  const gameDealsServiceMock = {
    getDeals: vi.fn(),
  };

  const emailServiceMock = {
    sendPriceDropEmail: vi.fn(),
  };

  const createAlert = (overrides: Partial<PriceAlert> = {}): PriceAlert => {
    return {
      id: 1,
      userId: 10,
      gameId: 5,

      targetPrice: 30,

      isActive: true,
      isTriggered: false,

      lastNotifiedPrice: null,

      lastCheckedAt: null,

      user: {
        email: 'user@example.com',
      } as PriceAlert['user'],

      game: {
        id: 5,
        title: 'Elden Ring',
      } as PriceAlert['game'],

      createdAt: new Date(),

      updatedAt: new Date(),

      ...overrides,
    } as PriceAlert;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    priceAlertsRepositoryMock.save.mockImplementation(async (alert) => alert);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceAlertMonitorService,

        {
          provide: PRICE_ALERTS_REPOSITORY,
          useValue: priceAlertsRepositoryMock,
        },

        {
          provide: GameDealsService,
          useValue: gameDealsServiceMock,
        },

        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<PriceAlertMonitorService>(PriceAlertMonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do nothing when there are no active alerts', async () => {
    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([]);

    await service.checkAlerts();

    expect(gameDealsServiceMock.getDeals).not.toHaveBeenCalled();

    expect(emailServiceMock.sendPriceDropEmail).not.toHaveBeenCalled();
  });

  it('should send email when current price is below target', async () => {
    const alert = createAlert({
      targetPrice: 50,
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([alert]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      game: {
        id: 5,
        title: 'Elden Ring',
      },

      cheapShark: {
        gameId: '123',
        steamAppId: '1245620',
        cheapestPriceEver: 20,
        currency: 'USD',
      },

      deals: [
        {
          storeId: '1',
          store: 'Steam',
          price: 29.99,
          retailPrice: 59.99,
          savingsPercent: 50,
          dealUrl: 'https://www.cheapshark.com/redirect?dealID=deal-1',
        },
      ],
    });

    await service.checkAlerts();

    expect(emailServiceMock.sendPriceDropEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Elden Ring',
      50,
      29.99,
      'https://www.cheapshark.com/redirect?dealID=deal-1',
    );

    expect(alert.isTriggered).toBe(true);

    expect(alert.lastNotifiedPrice).toBe(29.99);

    expect(alert.lastCheckedAt).toBeInstanceOf(Date);

    expect(priceAlertsRepositoryMock.save).toHaveBeenCalledWith(alert);
  });

  it('should not send duplicate email when price has not dropped further', async () => {
    const alert = createAlert({
      targetPrice: 50,
      isTriggered: true,
      lastNotifiedPrice: 29.99,
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([alert]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      deals: [
        {
          price: 29.99,
          dealUrl: 'https://example.com/deal',
        },
      ],
    });

    await service.checkAlerts();

    expect(emailServiceMock.sendPriceDropEmail).not.toHaveBeenCalled();

    expect(alert.isTriggered).toBe(true);

    expect(alert.lastNotifiedPrice).toBe(29.99);

    expect(priceAlertsRepositoryMock.save).toHaveBeenCalledWith(alert);
  });

  it('should send another email when price drops further', async () => {
    const alert = createAlert({
      targetPrice: 50,
      isTriggered: true,
      lastNotifiedPrice: 29.99,
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([alert]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      deals: [
        {
          price: 19.99,
          dealUrl: 'https://example.com/new-deal',
        },
      ],
    });

    await service.checkAlerts();

    expect(emailServiceMock.sendPriceDropEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Elden Ring',
      50,
      19.99,
      'https://example.com/new-deal',
    );

    expect(alert.lastNotifiedPrice).toBe(19.99);
  });

  it('should re-arm alert when price goes back above target', async () => {
    const alert = createAlert({
      targetPrice: 30,
      isTriggered: true,
      lastNotifiedPrice: 20,
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([alert]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      deals: [
        {
          price: 40,
          dealUrl: 'https://example.com/deal',
        },
      ],
    });

    await service.checkAlerts();

    expect(emailServiceMock.sendPriceDropEmail).not.toHaveBeenCalled();

    expect(alert.isTriggered).toBe(false);

    expect(alert.lastCheckedAt).toBeInstanceOf(Date);
  });

  it('should check CheapShark only once for multiple alerts of the same game', async () => {
    const firstAlert = createAlert({
      id: 1,
      userId: 10,
      gameId: 5,
      targetPrice: 50,

      user: {
        email: 'first@example.com',
      } as PriceAlert['user'],
    });

    const secondAlert = createAlert({
      id: 2,
      userId: 20,
      gameId: 5,
      targetPrice: 40,

      user: {
        email: 'second@example.com',
      } as PriceAlert['user'],
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([
      firstAlert,
      secondAlert,
    ]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      deals: [
        {
          price: 25,
          dealUrl: 'https://example.com/deal',
        },
      ],
    });

    await service.checkAlerts();

    expect(gameDealsServiceMock.getDeals).toHaveBeenCalledTimes(1);

    expect(gameDealsServiceMock.getDeals).toHaveBeenCalledWith(5);

    expect(emailServiceMock.sendPriceDropEmail).toHaveBeenCalledTimes(2);

    expect(priceAlertsRepositoryMock.save).toHaveBeenCalledTimes(2);
  });

  it('should not send email when CheapShark returns no deals', async () => {
    const alert = createAlert();

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([alert]);

    gameDealsServiceMock.getDeals.mockResolvedValue({
      deals: [],
    });

    await service.checkAlerts();

    expect(emailServiceMock.sendPriceDropEmail).not.toHaveBeenCalled();

    expect(priceAlertsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should continue checking other games when one game fails', async () => {
    const firstAlert = createAlert({
      id: 1,
      gameId: 5,

      game: {
        id: 5,
        title: 'Broken Game',
      } as PriceAlert['game'],
    });

    const secondAlert = createAlert({
      id: 2,
      gameId: 6,
      targetPrice: 50,

      game: {
        id: 6,
        title: 'Elden Ring',
      } as PriceAlert['game'],
    });

    priceAlertsRepositoryMock.findAllActive.mockResolvedValue([
      firstAlert,
      secondAlert,
    ]);

    gameDealsServiceMock.getDeals.mockImplementation(async (gameId: number) => {
      if (gameId === 5) {
        throw new Error('CheapShark failed');
      }

      return {
        deals: [
          {
            price: 20,
            dealUrl: 'https://example.com/deal',
          },
        ],
      };
    });

    await service.checkAlerts();

    expect(gameDealsServiceMock.getDeals).toHaveBeenCalledWith(5);

    expect(gameDealsServiceMock.getDeals).toHaveBeenCalledWith(6);

    expect(emailServiceMock.sendPriceDropEmail).toHaveBeenCalledTimes(1);
  });
});
