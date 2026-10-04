import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GamesService } from '../games/games.service.js';

import {
  USER_GAMES_REPOSITORY,
  type UserGamesRepositoryContract,
} from './repositories/user-games.repository.interface.js';

@Injectable()
export class UserGamesService {
  constructor(
    @Inject(USER_GAMES_REPOSITORY)
    private readonly userGamesRepository: UserGamesRepositoryContract,

    private readonly gamesService: GamesService,
  ) {}

  findAll(userId: number) {
    return this.userGamesRepository.findAllByUser(userId);
  }

  async addGame(userId: number, gameId: number) {
    // Throws 404 if game is not
    // present in the catalog.
    const game = await this.gamesService.findOne(gameId);

    const existing = await this.userGamesRepository.findByUserAndGame(
      userId,
      gameId,
    );

    if (existing) {
      throw new ConflictException('Game already exists in your library');
    }

    return this.userGamesRepository.create(userId, game.id);
  }

  async removeGame(userId: number, gameId: number) {
    const userGame = await this.userGamesRepository.findByUserAndGame(
      userId,
      gameId,
    );

    if (!userGame) {
      throw new NotFoundException('Game was not found in your library');
    }

    await this.userGamesRepository.remove(userGame);

    return {
      message: 'Game removed from your library',
    };
  }

  async ensureGameInLibrary(userId: number, gameId: number) {
    const userGame = await this.userGamesRepository.findByUserAndGame(
      userId,
      gameId,
    );

    if (!userGame) {
      throw new NotFoundException('Game was not found in your library');
    }

    return userGame;
  }
}
