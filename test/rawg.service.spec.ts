import { BadGatewayException } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { ConfigService } from '@nestjs/config';

import { Test, TestingModule } from '@nestjs/testing';

import { of, throwError } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppCacheService } from '../src/cache/app-cache.service.js';

import { CACHE_TTL } from '../src/cache/cache.constants.js';

import { RawgService } from '../src/integrations/rawg/rawg.service.js';

describe('RawgService', () => {
  let service: RawgService;

  const httpServiceMock = {
    get: vi.fn(),
  };

  const configServiceMock = {
    getOrThrow: vi.fn(),
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

    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      if (key === 'RAWG_API_KEY') {
        return 'test-api-key';
      }

      if (key === 'RAWG_BASE_URL') {
        return 'https://api.rawg.io/api';
      }

      throw new Error(`Unexpected config key: ${key}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RawgService,

        {
          provide: HttpService,

          useValue: httpServiceMock,
        },

        {
          provide: ConfigService,

          useValue: configServiceMock,
        },

        {
          provide: AppCacheService,

          useValue: cacheServiceMock,
        },
      ],
    }).compile();

    service = module.get<RawgService>(RawgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load RAWG configuration', () => {
    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith('RAWG_API_KEY');

    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith('RAWG_BASE_URL');
  });

  describe('searchGames', () => {
    it('should search RAWG games and map the response', async () => {
      const rawgResponse = {
        count: 1,
        next: null,
        previous: null,

        results: [
          {
            id: 326243,
            slug: 'elden-ring',
            name: 'Elden Ring',
            released: '2022-02-25',

            background_image: 'https://example.com/elden-ring.jpg',

            metacritic: 96,

            genres: [
              {
                id: 4,
                name: 'Action',
                slug: 'action',
              },
              {
                id: 5,
                name: 'RPG',
                slug: 'role-playing-games-rpg',
              },
            ],

            platforms: [
              {
                platform: {
                  id: 4,
                  name: 'PC',
                  slug: 'pc',
                },
              },
              {
                platform: {
                  id: 187,
                  name: 'PlayStation 5',

                  slug: 'playstation5',
                },
              },
            ],
          },
        ],
      };

      httpServiceMock.get.mockReturnValue(
        of({
          data: rawgResponse,
        }),
      );

      const result = await service.searchGames('Elden Ring');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'rawg:search:elden ring',
      );

      expect(httpServiceMock.get).toHaveBeenCalledWith(
        'https://api.rawg.io/api/games',
        {
          params: {
            key: 'test-api-key',

            search: 'Elden Ring',

            page_size: 10,
          },
        },
      );

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'rawg:search:elden ring',
        rawgResponse,
        CACHE_TTL.RAWG_SEARCH,
      );

      expect(result).toEqual([
        {
          rawgId: 326243,

          title: 'Elden Ring',

          released: '2022-02-25',

          imageUrl: 'https://example.com/elden-ring.jpg',

          metacritic: 96,

          genres: ['Action', 'RPG'],

          platforms: ['PC', 'PlayStation 5'],
        },
      ]);
    });

    it('should return cached RAWG search results without calling RAWG', async () => {
      cacheServiceMock.get.mockResolvedValue({
        count: 1,
        next: null,
        previous: null,

        results: [
          {
            id: 326243,

            slug: 'elden-ring',

            name: 'Elden Ring',

            released: '2022-02-25',

            background_image: null,

            metacritic: 96,

            genres: [],

            platforms: [],
          },
        ],
      });

      const result = await service.searchGames('Elden Ring');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'rawg:search:elden ring',
      );

      expect(httpServiceMock.get).not.toHaveBeenCalled();

      expect(cacheServiceMock.set).not.toHaveBeenCalled();

      expect(result).toEqual([
        {
          rawgId: 326243,

          title: 'Elden Ring',

          released: '2022-02-25',

          imageUrl: null,

          metacritic: 96,

          genres: [],

          platforms: [],
        },
      ]);
    });

    it('should normalize search before creating cache key', async () => {
      cacheServiceMock.get.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      await service.searchGames('  ELDEN   RING  ');

      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        'rawg:search:elden ring',
      );
    });

    it('should return an empty array when RAWG returns no games', async () => {
      const rawgResponse = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };

      httpServiceMock.get.mockReturnValue(
        of({
          data: rawgResponse,
        }),
      );

      const result = await service.searchGames('something-that-does-not-exist');

      expect(result).toEqual([]);

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'rawg:search:something-that-does-not-exist',
        rawgResponse,
        CACHE_TTL.RAWG_SEARCH,
      );
    });

    it('should throw BadGatewayException when RAWG search fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('RAWG unavailable')),
      );

      await expect(service.searchGames('Elden Ring')).rejects.toThrow(
        BadGatewayException,
      );

      expect(cacheServiceMock.set).not.toHaveBeenCalled();
    });
  });

  describe('getGame', () => {
    const rawgGame = {
      id: 326243,

      slug: 'elden-ring',

      name: 'Elden Ring',

      released: '2022-02-25',

      background_image: 'https://example.com/elden-ring.jpg',

      metacritic: 96,

      genres: [
        {
          id: 4,

          name: 'Action',

          slug: 'action',
        },
      ],

      platforms: [
        {
          platform: {
            id: 4,

            name: 'PC',

            slug: 'pc',
          },
        },
      ],
    };

    it('should return a RAWG game by id and cache it', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: rawgGame,
        }),
      );

      const result = await service.getGame(326243);

      expect(cacheServiceMock.get).toHaveBeenCalledWith('rawg:game:326243');

      expect(httpServiceMock.get).toHaveBeenCalledWith(
        'https://api.rawg.io/api/games/326243',
        {
          params: {
            key: 'test-api-key',
          },
        },
      );

      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        'rawg:game:326243',
        rawgGame,
        CACHE_TTL.RAWG_GAME,
      );

      expect(result).toEqual(rawgGame);
    });

    it('should return cached RAWG game without calling RAWG', async () => {
      cacheServiceMock.get.mockResolvedValue(rawgGame);

      const result = await service.getGame(326243);

      expect(cacheServiceMock.get).toHaveBeenCalledWith('rawg:game:326243');

      expect(httpServiceMock.get).not.toHaveBeenCalled();

      expect(cacheServiceMock.set).not.toHaveBeenCalled();

      expect(result).toEqual(rawgGame);
    });

    it('should throw BadGatewayException when RAWG game request fails', async () => {
      httpServiceMock.get.mockReturnValue(
        throwError(() => new Error('RAWG unavailable')),
      );

      await expect(service.getGame(326243)).rejects.toThrow(
        BadGatewayException,
      );

      expect(cacheServiceMock.set).not.toHaveBeenCalled();
    });
  });
});
