import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from '../entities/game.entity.js';
import type { GamesRepositoryContract } from './games.repository.interface.js';
import { FindGamesQueryDto } from '../dto/find-games-query.dto.js';

@Injectable()
export class GamesRepository implements GamesRepositoryContract {
  constructor(
    @InjectRepository(Game)
    private readonly repository: Repository<Game>,
  ) {}

  async search(query: FindGamesQueryDto) {
    const { page, pageSize, genre, search } = query;

    const queryBuilder = this.repository.createQueryBuilder('game');

    if (genre) {
      queryBuilder.andWhere('LOWER(game.genre) = LOWER(:genre)', { genre });
    }

    if (search) {
      queryBuilder.andWhere('LOWER(game.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy('game.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findAll() {
    const [data, total] = await this.repository.findAndCount({
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
    };
  }

  async findById(id: number) {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async create(data: { title: string; genre: string }) {
    const game = this.repository.create(data);

    return await this.repository.save(game);
  }

  async save(game: Game) {
    return await this.repository.save(game);
  }

  async remove(game: Game) {
    return await this.repository.remove(game);
  }
}
