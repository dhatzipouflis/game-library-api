import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GamesService } from '../src/games/games.service.js';

import { RawgImportService } from '../src/integrations/rawg/rawg-import.service.js';
import { RawgService } from '../src/integrations/rawg/rawg.service.js';

describe('RawgImportService', () => {
  let service: RawgImportService;

  const rawgServiceMock = {
    getGame: vi.fn(),
  };

  const gamesServiceMock = {
    importFromRawg: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RawgImportService,

        {
          provide: RawgService,
          useValue: rawgServiceMock,
        },

        {
          provide: GamesService,
          useValue: gamesServiceMock,
        },
      ],
    }).compile();

    service = module.get<RawgImportService>(RawgImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch RAWG game and map it to our game model', async () => {
    rawgServiceMock.getGame.mockResolvedValue({
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
          slug: 'rpg',
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
    });

    const importedGame = {
      id: 1,
      rawgId: 326243,
      title: 'Elden Ring',
      genre: 'Action',
      platform: 'PC',

      imageUrl: 'https://example.com/elden-ring.jpg',

      releasedAt: new Date('2022-02-25'),

      metacritic: 96,
      createdAt: new Date(),
    };

    gamesServiceMock.importFromRawg.mockResolvedValue(importedGame);

    const result = await service.importGame(326243);

    expect(rawgServiceMock.getGame).toHaveBeenCalledWith(326243);

    expect(gamesServiceMock.importFromRawg).toHaveBeenCalledWith({
      rawgId: 326243,
      title: 'Elden Ring',
      genre: 'Action',
      platform: 'PC',

      imageUrl: 'https://example.com/elden-ring.jpg',

      releasedAt: new Date('2022-02-25'),

      metacritic: 96,
    });

    expect(result).toEqual(importedGame);
  });

  it('should handle missing optional RAWG data', async () => {
    rawgServiceMock.getGame.mockResolvedValue({
      id: 999,
      slug: 'unknown-game',
      name: 'Unknown Game',

      released: null,
      background_image: null,
      metacritic: null,

      genres: [],
      platforms: [],
    });

    gamesServiceMock.importFromRawg.mockResolvedValue({
      id: 2,
      rawgId: 999,
      title: 'Unknown Game',
      genre: 'Unknown',
    });

    await service.importGame(999);

    expect(gamesServiceMock.importFromRawg).toHaveBeenCalledWith({
      rawgId: 999,
      title: 'Unknown Game',
      genre: 'Unknown',
      platform: undefined,
      imageUrl: undefined,
      releasedAt: undefined,
      metacritic: undefined,
    });
  });

  it('should not call GamesService when RAWG request fails', async () => {
    rawgServiceMock.getGame.mockRejectedValue(new Error('RAWG failed'));

    await expect(service.importGame(326243)).rejects.toThrow('RAWG failed');

    expect(gamesServiceMock.importFromRawg).not.toHaveBeenCalled();
  });
});
