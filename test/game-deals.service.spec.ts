import { NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GamesService } from '../src/games/games.service.js';

import { CheapSharkService } from '../src/integrations/cheapshark/cheapshark.service.js';

import { GameDealsService } from '../src/integrations/cheapshark/game-deals.service.js';

describe('GameDealsService', () => {
  let service: GameDealsService;

  const gamesServiceMock = {
    findOne: vi.fn(),
  };

  const cheapSharkServiceMock = {
    searchGames: vi.fn(),
    getGameDetails: vi.fn(),
    getStores: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameDealsService,

        {
          provide: GamesService,
          useValue: gamesServiceMock,
        },

        {
          provide: CheapSharkService,
          useValue: cheapSharkServiceMock,
        },
      ],
    }).compile();

    service = module.get<GameDealsService>(GameDealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return sorted deals for a local game', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 1,
      title: 'Elden Ring',
      genre: 'Action',
      platform: 'PC',
      createdAt: new Date(),
    });

    cheapSharkServiceMock.searchGames.mockResolvedValue([
      {
        cheapSharkId: '111',
        steamAppId: '999',
        title: 'Elden Ring Nightreign',
        cheapestPrice: '30.00',
        cheapestDealId: 'wrong-deal',
        thumbnailUrl: '',
      },

      {
        cheapSharkId: '123',
        steamAppId: '1245620',
        title: 'ELDEN RING',
        cheapestPrice: '39.99',
        cheapestDealId: 'deal-123',
        thumbnailUrl: '',
      },
    ]);

    cheapSharkServiceMock.getGameDetails.mockResolvedValue({
      info: {
        title: 'ELDEN RING',
        steamAppID: '1245620',
        thumb: '',
      },

      cheapestPriceEver: {
        price: '29.99',
        date: 1700000000,
      },

      deals: [
        {
          storeID: '2',
          dealID: 'deal-2',
          price: '49.99',
          retailPrice: '59.99',
          savings: '16.67',
        },
        {
          storeID: '1',
          dealID: 'deal-1',
          price: '39.99',
          retailPrice: '59.99',
          savings: '33.35',
        },
      ],
    });

    cheapSharkServiceMock.getStores.mockResolvedValue([
      {
        storeID: '1',
        storeName: 'Steam',
        isActive: 1,
        images: {
          banner: '',
          logo: '',
          icon: '',
        },
      },
      {
        storeID: '2',
        storeName: 'GamersGate',
        isActive: 1,
        images: {
          banner: '',
          logo: '',
          icon: '',
        },
      },
    ]);

    const result = await service.getDeals(1);

    expect(gamesServiceMock.findOne).toHaveBeenCalledWith(1);

    expect(cheapSharkServiceMock.searchGames).toHaveBeenCalledWith(
      'Elden Ring',
    );

    // Important:
    // should select exact title match,
    // not Nightreign.
    expect(cheapSharkServiceMock.getGameDetails).toHaveBeenCalledWith('123');

    expect(cheapSharkServiceMock.getStores).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      game: {
        id: 1,
        title: 'Elden Ring',
      },

      cheapShark: {
        gameId: '123',
        steamAppId: '1245620',
        cheapestPriceEver: 29.99,
        currency: 'USD',
      },

      deals: [
        {
          storeId: '1',
          store: 'Steam',
          price: 39.99,
          retailPrice: 59.99,
          savingsPercent: 33.35,

          dealUrl: 'https://www.cheapshark.com/redirect?dealID=deal-1',
        },

        {
          storeId: '2',
          store: 'GamersGate',
          price: 49.99,
          retailPrice: 59.99,
          savingsPercent: 16.67,

          dealUrl: 'https://www.cheapshark.com/redirect?dealID=deal-2',
        },
      ],
    });
  });

  it('should use first CheapShark result when no exact title match exists', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 1,
      title: 'Elden Ring',
    });

    cheapSharkServiceMock.searchGames.mockResolvedValue([
      {
        cheapSharkId: '777',
        title: 'Elden Ring Deluxe',
      },
      {
        cheapSharkId: '888',
        title: 'Elden Ring Complete',
      },
    ]);

    cheapSharkServiceMock.getGameDetails.mockResolvedValue({
      info: {
        title: 'Elden Ring Deluxe',
        steamAppID: null,
        thumb: '',
      },

      cheapestPriceEver: {
        price: '20.00',
        date: 1700000000,
      },

      deals: [],
    });

    cheapSharkServiceMock.getStores.mockResolvedValue([]);

    await service.getDeals(1);

    expect(cheapSharkServiceMock.getGameDetails).toHaveBeenCalledWith('777');
  });

  it('should throw NotFoundException when CheapShark has no matching games', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 1,
      title: 'Totally Unknown Game',
    });

    cheapSharkServiceMock.searchGames.mockResolvedValue([]);

    await expect(service.getDeals(1)).rejects.toThrow(NotFoundException);

    expect(cheapSharkServiceMock.getGameDetails).not.toHaveBeenCalled();

    expect(cheapSharkServiceMock.getStores).not.toHaveBeenCalled();
  });

  it('should use Unknown when store cannot be mapped', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 1,
      title: 'Elden Ring',
    });

    cheapSharkServiceMock.searchGames.mockResolvedValue([
      {
        cheapSharkId: '123',
        title: 'Elden Ring',
      },
    ]);

    cheapSharkServiceMock.getGameDetails.mockResolvedValue({
      info: {
        title: 'Elden Ring',
        steamAppID: '1245620',
        thumb: '',
      },

      cheapestPriceEver: {
        price: '29.99',
        date: 1700000000,
      },

      deals: [
        {
          storeID: '999',
          dealID: 'deal-999',
          price: '10.50',
          retailPrice: '50.00',
          savings: '79.00',
        },
      ],
    });

    cheapSharkServiceMock.getStores.mockResolvedValue([]);

    const result = await service.getDeals(1);

    expect(result.deals[0]).toEqual(
      expect.objectContaining({
        storeId: '999',
        store: 'Unknown',
        price: 10.5,
      }),
    );
  });

  it('should propagate error when local game does not exist', async () => {
    gamesServiceMock.findOne.mockRejectedValue(
      new NotFoundException('Game with id 999 was not found'),
    );

    await expect(service.getDeals(999)).rejects.toThrow(NotFoundException);

    expect(cheapSharkServiceMock.searchGames).not.toHaveBeenCalled();
  });

  it('should propagate CheapShark failures', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 1,
      title: 'Elden Ring',
    });

    cheapSharkServiceMock.searchGames.mockRejectedValue(
      new Error('CheapShark failed'),
    );

    await expect(service.getDeals(1)).rejects.toThrow('CheapShark failed');

    expect(cheapSharkServiceMock.getGameDetails).not.toHaveBeenCalled();
  });
});
