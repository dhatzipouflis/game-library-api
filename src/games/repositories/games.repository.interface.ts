import { FindGamesQueryDto } from '../dto/find-games-query.dto.js';
import type { Game } from '../entities/game.entity.js';

export const GAMES_REPOSITORY = Symbol('GAMES_REPOSITORY');

export interface GamesRepositoryContract {
  search(query: FindGamesQueryDto): Promise<{
    data: Game[];
    total: number;
  }>;

  findAll(): Promise<{
    data: Game[];
    total: number;
  }>;

  findById(id: number): Promise<Game | null>;

  create(data: { title: string; genre: string }): Promise<Game>;

  save(game: Game): Promise<Game>;

  remove(game: Game): Promise<Game>;
}
