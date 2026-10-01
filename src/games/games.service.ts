import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateGameDto } from './dto/create-game.dto.js';
import { UpdateGameDto } from './dto/update-game.dto.js';

import {
  GAMES_REPOSITORY,
  type GamesRepositoryContract,
} from './repositories/games.repository.interface.js';

@Injectable()
export class GamesService {
  constructor(
    @Inject(GAMES_REPOSITORY)
    private readonly gamesRepository: GamesRepositoryContract,
  ) {}

  async findAll() {
    const { data, total } = await this.gamesRepository.findAll();

    return {
      data,
      meta: {
        total,
      },
    };
  }

  async findOne(id: number) {
    const game = await this.gamesRepository.findById(id);

    if (!game) {
      throw new NotFoundException(`Game with id ${id} was not found`);
    }

    return game;
  }

  create(dto: CreateGameDto) {
    return this.gamesRepository.create(dto);
  }

  async update(id: number, dto: UpdateGameDto) {
    const game = await this.findOne(id);

    Object.assign(game, dto);

    return this.gamesRepository.save(game);
  }

  async remove(id: number) {
    const game = await this.findOne(id);

    await this.gamesRepository.remove(game);

    return {
      message: `Game with id ${id} deleted successfully`,
    };
  }
}
