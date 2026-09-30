import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GamesService } from '../src/games/games.service.js';
import {
  GAMES_REPOSITORY,
  type GamesRepositoryContract,
} from '../src/games/repositories/games.repository.interface.js';

describe('GamesService', () => {
  let service: GamesService;

  const gamesRepositoryMock = {
    findAll: vi.fn<GamesRepositoryContract['findAll']>(),
    findById: vi.fn<GamesRepositoryContract['findById']>(),
    create: vi.fn<GamesRepositoryContract['create']>(),
    save: vi.fn<GamesRepositoryContract['save']>(),
    remove: vi.fn<GamesRepositoryContract['remove']>(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: GAMES_REPOSITORY,
          useValue: gamesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a game when it exists', async () => {
    const game = {
      id: 1,
      title: 'Street Fighter 6',
      genre: 'Fighting',
      platform: 'PC',
      createdAt: new Date(),
    };

    gamesRepositoryMock.findById.mockResolvedValue(game);

    const result = await service.findOne(1);

    expect(result).toEqual(game);

    expect(gamesRepositoryMock.findById).toHaveBeenCalledWith(1);
    expect(gamesRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when game does not exist', async () => {
    gamesRepositoryMock.findById.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);

    expect(gamesRepositoryMock.findById).toHaveBeenCalledWith(999);
  });

  it('should create a game', async () => {
    const dto = {
      title: 'Tekken 8',
      genre: 'Fighting',
      platform: 'PC',
    };

    const createdGame = {
      id: 1,
      ...dto,
      createdAt: new Date(),
    };

    gamesRepositoryMock.create.mockResolvedValue(createdGame);

    const result = await service.create(dto);

    expect(result).toEqual(createdGame);

    expect(gamesRepositoryMock.create).toHaveBeenCalledWith(dto);
  });

  it('should update an existing game', async () => {
    const game = {
      id: 1,
      title: 'Elden Ring',
      genre: 'RPG',
      platform: 'PC',
      createdAt: new Date(),
    };

    const updateDto = {
      genre: 'Action RPG',
    };

    const updatedGame = {
      ...game,
      genre: 'Action RPG',
    };

    gamesRepositoryMock.findById.mockResolvedValue(game);
    gamesRepositoryMock.save.mockResolvedValue(updatedGame);

    const result = await service.update(1, updateDto);

    expect(result).toEqual(updatedGame);

    expect(gamesRepositoryMock.findById).toHaveBeenCalledWith(1);

    expect(gamesRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        genre: 'Action RPG',
      }),
    );
  });

  it('should remove an existing game', async () => {
    const game = {
      id: 1,
      title: 'Tekken 8',
      genre: 'Fighting',
      platform: 'PC',
      createdAt: new Date(),
    };

    gamesRepositoryMock.findById.mockResolvedValue(game);
    gamesRepositoryMock.remove.mockResolvedValue(game);

    const result = await service.remove(1);

    expect(gamesRepositoryMock.findById).toHaveBeenCalledWith(1);
    expect(gamesRepositoryMock.remove).toHaveBeenCalledWith(game);

    expect(result).toEqual({
      message: 'Game with id 1 deleted successfully',
    });
  });

  it('should return games with pagination metadata', async () => {
    const games = [
      {
        id: 1,
        title: 'Street Fighter 6',
        genre: 'Fighting',
        platform: 'PC',
        createdAt: new Date(),
      },
      {
        id: 2,
        title: 'Elden Ring',
        genre: 'RPG',
        platform: 'PC',
        createdAt: new Date(),
      },
    ];

    gamesRepositoryMock.findAll.mockResolvedValue({
      data: games,
      total: 2,
    });

    const result = await service.findAll();

    expect(result).toEqual({
      data: games,
      meta: {
        page: 1,
        pageSize: 10,
        total: 2,
        totalPages: 1,
      },
    });

    expect(gamesRepositoryMock.findAll).toHaveBeenCalledTimes(1);
  });
});
