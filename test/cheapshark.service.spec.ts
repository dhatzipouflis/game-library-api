import { BadGatewayException } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { Test, TestingModule } from '@nestjs/testing';

import { of, throwError } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppCacheService } from '../src/cache/app-cache.service.js';

import { CACHE_TTL } from '../src/cache/cache.constants.js';

import { CheapSharkService } from '../src/integrations/cheapshark/cheapshark.service.js';

describe('CheapSharkService', () => {
  let service: CheapSharkService;

  const httpServiceMock = {
    get: vi.fn(),
  };

  const cacheServiceMock = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    cacheServiceMock.get.mockResolvedValue(undefined);

    cacheServiceMock.set.mockResolvedValue(undefined);

    cacheServiceMock.delete.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheapSharkService,

        {
          provide: HttpService,

          useValue: httpServiceMock,
        },

        {
          provide: AppCacheService,

          useValue: cacheServiceMock,
        },
      ],
    }).compile();

    service = module.get<CheapSharkService>(CheapSharkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchGames', () => {
    it('should search games, map the response and cache raw CheapShark data', async () => {
      const cheapSharkGames = [
        {
          gameID: '123',

          steamAppID: '1245620',

          cheapest: '39.99',

          cheapestDealID: 'deal-123',

          external: 'ELDEN RING',

          thumb: 'https://example.com/elden-ring.jpg',
        },
      ];

      httpServiceMock.get.mockReturnValue(
        of({
          data: cheapSharkGames,
        }),
      );

      const result = await service.searchGames('Elden Ring');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'cheapshark:search:elden ring',
      );

      expect(httpServiceMock.get).toHaveBeenCalledWith('/games', {
        params: {
          title: 'Elden Ring',
        },
      });

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'cheapshark:search:elden ring',
        cheapSharkGames,
        CACHE_TTL.CHEAPSHARK_SEARCH,
      );

      expect(result).toEqual([
        {
          cheapSharkId: '123',

          steamAppId: '1245620',

          title: 'ELDEN RING',

          cheapestPrice: '39.99',

          cheapestDealId: 'deal-123',

          thumbnailUrl: 'https://example.com/elden-ring.jpg',
        },
      ]);
    });

    it('should return cached search results without calling CheapShark', async () => {
      cacheServiceMock.get.mockResolvedValue([
        {
          gameID: '123',

          steamAppID: '1245620',

          cheapest: '39.99',

          cheapestDealID: 'deal-123',

          external: 'ELDEN RING',

          thumb: 'image.jpg',
        },
      ]);

      const result = await service.searchGames('Elden Ring');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'cheapshark:search:elden ring',
      );

      expect(httpServiceMock.get).not.toHaveBeenCalled();

      expect(cacheServiceMock.set).not.toHaveBeenCalled();

      expect(result).toEqual([
        {
          cheapSharkId: '123',

          steamAppId: '1245620',

          title: 'ELDEN RING',

          cheapestPrice: '39.99',

          cheapestDealId: 'deal-123',

          thumbnailUrl: 'image.jpg',
        },
      ]);
    });

    it('should normalize title before creating cache key', async () => {
      cacheServiceMock.get.mockResolvedValue([]);

      await service.searchGames('  ELDEN   RING  ');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'cheapshark:search:elden ring',
      );

      expect(httpServiceMock.get).not.toHaveBeenCalled();
    });

    it('should return empty array when no games are found', async () => {
      const responseData: [] = [];

      httpServiceMock.get.mockReturnValue(
        of({
          data: responseData,
        }),
      );

      const result = await service.searchGames('unknown-game');

      expect(result).toEqual([]);

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'cheapshark:search:unknown-game',
        responseData,
        CACHE_TTL.CHEAPSHARK_SEARCH,
      );
    });

    it('should throw BadGatewayException when search request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.searchGames('Elden Ring')).rejects.toThrow(
        BadGatewayException,
      );

      expect(cacheServiceMock.set).not.toHaveBeenCalled();
    });
  });

  describe('getGameDetails', () => {
    const details = {
      info: {
        title: 'ELDEN RING',

        steamAppID: '1245620',

        thumb: 'https://example.com/elden-ring.jpg',
      },

      cheapestPriceEver: {
        price: '29.99',

        date: 1700000000,
      },

      deals: [
        {
          storeID: '1',

          dealID: 'deal-1',

          price: '39.99',

          retailPrice: '59.99',

          savings: '33.35',
        },
      ],
    };

    it('should return CheapShark game details and cache them', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: details,
        }),
      );

      const result = await service.getGameDetails('123');

      expect(cacheServiceMock.get).toHaveBeenCalledWith('cheapshark:game:123');

      expect(httpServiceMock.get).toHaveBeenCalledWith('/games', {
        params: {
          id: '123',
        },
      });

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'cheapshark:game:123',
        details,
        CACHE_TTL.CHEAPSHARK_GAME_DETAILS,
      );

      expect(result).toEqual(details);
    });

    it('should return cached game details without HTTP request', async () => {
      cacheServiceMock.get.mockResolvedValue(details);

      const result = await service.getGameDetails('123');

      expect(cacheServiceMock.get).toHaveBeenCalledWith('cheapshark:game:123');

      expect(httpServiceMock.get).not.toHaveBeenCalled();

      expect(cacheServiceMock.set).not.toHaveBeenCalled();

      expect(result).toEqual(details);
    });

    it('should throw BadGatewayException when game details request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.getGameDetails('123')).rejects.toThrow(
        BadGatewayException,
      );

      expect(cacheServiceMock.set).not.toHaveBeenCalled();
    });
  });

  describe('getStores', () => {
    const stores = [
      {
        storeID: '1',

        storeName: 'Steam',

        isActive: 1,

        images: {
          banner: '/img/stores/banners/0.png',

          logo: '/img/stores/logos/0.png',

          icon: '/img/stores/icons/0.png',
        },
      },

      {
        storeID: '2',

        storeName: 'GamersGate',

        isActive: 1,

        images: {
          banner: '/img/stores/banners/1.png',

          logo: '/img/stores/logos/1.png',

          icon: '/img/stores/icons/1.png',
        },
      },
    ];

    it('should return CheapShark stores and cache them', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: stores,
        }),
      );

      const result = await service.getStores();

      expect(cacheServiceMock.get).toHaveBeenCalledWith('cheapshark:stores');

      expect(httpServiceMock.get).toHaveBeenCalledWith('/stores');

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'cheapshark:stores',
        stores,
        CACHE_TTL.CHEAPSHARK_STORES,
      );

      expect(result).toEqual(stores);
    });

    it('should return cached stores without HTTP request', async () => {
      cacheServiceMock.get.mockResolvedValue(stores);

      const result = await service.getStores();

      expect(cacheServiceMock.get).toHaveBeenCalledWith('cheapshark:stores');

      expect(httpServiceMock.get).not.toHaveBeenCalled();

      expect(cacheServiceMock.set).not.toHaveBeenCalled();

      expect(result).toEqual(stores);
    });

    it('should throw BadGatewayException when stores request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.getStores()).rejects.toThrow(BadGatewayException);

      expect(cacheServiceMock.set).not.toHaveBeenCalled();
    });
  });
});
