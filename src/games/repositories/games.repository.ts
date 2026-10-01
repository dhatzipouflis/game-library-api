import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateGameDto } from '../dto/create-game.dto.js';
import { Game } from '../entities/game.entity.js';

import type { GamesRepositoryContract } from './games.repository.interface.js';

@Injectable()
export class GamesRepository implements GamesRepositoryContract {
  constructor(
    @InjectRepository(Game)
    private readonly repository: Repository<Game>,
  ) {}

  async findAll() {
    const [data, total] = await this.repository.findAndCount({
      order: {
        id: 'ASC',
      },
    });

    return {
      data,
      total,
    };
  }

  findById(id: number) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async create(data: CreateGameDto) {
    const game = this.repository.create(data);

    return this.repository.save(game);
  }

  save(game: Game) {
    return this.repository.save(game);
  }

  remove(game: Game) {
    return this.repository.remove(game);
  }
}
