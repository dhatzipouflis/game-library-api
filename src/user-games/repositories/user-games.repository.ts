import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserGame } from '../entities/user-game.entity.js';

import type { UserGamesRepositoryContract } from './user-games.repository.interface.js';

@Injectable()
export class UserGamesRepository implements UserGamesRepositoryContract {
  constructor(
    @InjectRepository(UserGame)
    private readonly repository: Repository<UserGame>,
  ) {}

  findAllByUser(userId: number) {
    return this.repository.find({
      where: {
        userId,
      },

      relations: {
        game: true,
      },

      order: {
        addedAt: 'DESC',
      },
    });
  }

  findByUserAndGame(userId: number, gameId: number) {
    return this.repository.findOne({
      where: {
        userId,
        gameId,
      },
    });
  }

  async create(userId: number, gameId: number) {
    const userGame = this.repository.create({
      userId,
      gameId,
    });

    return this.repository.save(userGame);
  }

  remove(userGame: UserGame) {
    return this.repository.remove(userGame);
  }
}
