import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  GAMES_REPOSITORY,
  type GamesRepositoryContract,
} from './repositories/games.repository.interface.js';

import { CreateGameDto } from './dto/create-game.dto.js';
import { UpdateGameDto } from './dto/update-game.dto.js';
import { FindGamesQueryDto } from './dto/find-games-query.dto.js';

@Injectable()
export class GamesService {
  constructor(
    @Inject(GAMES_REPOSITORY)
    private readonly gamesRepository: GamesRepositoryContract,
  ) {}

  async search(query: FindGamesQueryDto) {
    const { data, total } = await this.gamesRepository.search(query);

    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findAll() {
    const { data, total } = await this.gamesRepository.findAll();

    return {
      data,
      meta: {
        page: 1,
        pageSize: 10,
        total,
        totalPages: Math.ceil(total / 10),
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

  async create(createGameDto: CreateGameDto) {
    return await this.gamesRepository.create(createGameDto);
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.findOne(id);

    Object.assign(game, updateGameDto);

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
