import { BadGatewayException } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { Test, TestingModule } from '@nestjs/testing';

import { of, throwError } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CheapSharkService } from '../src/integrations/cheapshark/cheapshark.service.js';

describe('CheapSharkService', () => {
  let service: CheapSharkService;

  const httpServiceMock = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheapSharkService,
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<CheapSharkService>(CheapSharkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchGames', () => {
    it('should search games and map CheapShark response', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: [
            {
              gameID: '123',
              steamAppID: '1245620',
              cheapest: '39.99',
              cheapestDealID: 'deal-123',
              external: 'ELDEN RING',
              thumb: 'https://example.com/elden-ring.jpg',
            },
          ],
        }),
      );

      const result = await service.searchGames('Elden Ring');

      expect(httpServiceMock.get).toHaveBeenCalledWith('/games', {
        params: {
          title: 'Elden Ring',
        },
      });

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

    it('should return empty array when no games are found', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: [],
        }),
      );

      const result = await service.searchGames('unknown-game');

      expect(result).toEqual([]);
    });

    it('should throw BadGatewayException when search request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.searchGames('Elden Ring')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('getGameDetails', () => {
    it('should return CheapShark game details', async () => {
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

      httpServiceMock.get.mockReturnValue(
        of({
          data: details,
        }),
      );

      const result = await service.getGameDetails('123');

      expect(httpServiceMock.get).toHaveBeenCalledWith('/games', {
        params: {
          id: '123',
        },
      });

      expect(result).toEqual(details);
    });

    it('should throw BadGatewayException when game details request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.getGameDetails('123')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('getStores', () => {
    it('should return CheapShark stores', async () => {
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

      httpServiceMock.get.mockReturnValue(
        of({
          data: stores,
        }),
      );

      const result = await service.getStores();

      expect(httpServiceMock.get).toHaveBeenCalledWith('/stores');

      expect(result).toEqual(stores);
    });

    it('should throw BadGatewayException when stores request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('CheapShark unavailable')),
      );

      await expect(service.getStores()).rejects.toThrow(BadGatewayException);
    });
  });
});
