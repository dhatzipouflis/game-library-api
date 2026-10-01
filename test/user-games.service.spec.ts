import { ConflictException, NotFoundException } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GamesService } from '../src/games/games.service.js';

import { UserGamesService } from '../src/user-games/user-games.service.js';

import {
  USER_GAMES_REPOSITORY,
  type UserGamesRepositoryContract,
} from '../src/user-games/repositories/user-games.repository.interface.js';

describe('UserGamesService', () => {
  let service: UserGamesService;

  const userGamesRepositoryMock = {
    findAllByUser: vi.fn<UserGamesRepositoryContract['findAllByUser']>(),

    findByUserAndGame:
      vi.fn<UserGamesRepositoryContract['findByUserAndGame']>(),

    create: vi.fn<UserGamesRepositoryContract['create']>(),

    remove: vi.fn<UserGamesRepositoryContract['remove']>(),
  };

  const gamesServiceMock = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGamesService,

        {
          provide: USER_GAMES_REPOSITORY,
          useValue: userGamesRepositoryMock,
        },

        {
          provide: GamesService,
          useValue: gamesServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserGamesService>(UserGamesService);
  });

  it('should return current user library', async () => {
    const library = [
      {
        id: 1,
        userId: 10,
        gameId: 5,
        addedAt: new Date(),

        game: {
          id: 5,
          title: 'Elden Ring',
          genre: 'RPG',
          platform: 'PC',
          createdAt: new Date(),
        },
      },
    ];

    userGamesRepositoryMock.findAllByUser.mockResolvedValue(library as never);

    const result = await service.findAll(10);

    expect(result).toEqual(library);

    expect(userGamesRepositoryMock.findAllByUser).toHaveBeenCalledWith(10);
  });

  it('should add existing catalog game to user library', async () => {
    const game = {
      id: 5,
      title: 'Tekken 8',
      genre: 'Fighting',
      platform: 'PC',
      createdAt: new Date(),
    };

    gamesServiceMock.findOne.mockResolvedValue(game);

    userGamesRepositoryMock.findByUserAndGame.mockResolvedValue(null);

    const userGame = {
      id: 20,
      userId: 10,
      gameId: 5,
      addedAt: new Date(),
    };

    userGamesRepositoryMock.create.mockResolvedValue(userGame as never);

    const result = await service.addGame(10, 5);

    expect(gamesServiceMock.findOne).toHaveBeenCalledWith(5);

    expect(userGamesRepositoryMock.findByUserAndGame).toHaveBeenCalledWith(
      10,
      5,
    );

    expect(userGamesRepositoryMock.create).toHaveBeenCalledWith(10, 5);

    expect(result).toEqual(userGame);
  });

  it('should throw when catalog game does not exist', async () => {
    gamesServiceMock.findOne.mockRejectedValue(
      new NotFoundException('Game not found'),
    );

    await expect(service.addGame(10, 999)).rejects.toThrow(NotFoundException);

    expect(userGamesRepositoryMock.findByUserAndGame).not.toHaveBeenCalled();

    expect(userGamesRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('should reject duplicate game in library', async () => {
    gamesServiceMock.findOne.mockResolvedValue({
      id: 5,
    });

    userGamesRepositoryMock.findByUserAndGame.mockResolvedValue({
      id: 1,
      userId: 10,
      gameId: 5,
    } as never);

    await expect(service.addGame(10, 5)).rejects.toThrow(ConflictException);

    expect(userGamesRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('should remove game from user library', async () => {
    const userGame = {
      id: 1,
      userId: 10,
      gameId: 5,
      addedAt: new Date(),
    };

    userGamesRepositoryMock.findByUserAndGame.mockResolvedValue(
      userGame as never,
    );

    userGamesRepositoryMock.remove.mockResolvedValue(userGame as never);

    const result = await service.removeGame(10, 5);

    expect(userGamesRepositoryMock.findByUserAndGame).toHaveBeenCalledWith(
      10,
      5,
    );

    expect(userGamesRepositoryMock.remove).toHaveBeenCalledWith(userGame);

    expect(result).toEqual({
      message: 'Game removed from your library',
    });
  });

  it('should throw when removing game that is not in library', async () => {
    userGamesRepositoryMock.findByUserAndGame.mockResolvedValue(null);

    await expect(service.removeGame(10, 5)).rejects.toThrow(NotFoundException);

    expect(userGamesRepositoryMock.remove).not.toHaveBeenCalled();
  });
});
