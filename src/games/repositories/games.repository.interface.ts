import type { CreateGameDto } from '../dto/create-game.dto.js';
import type { Game } from '../entities/game.entity.js';
import type { CreateExternalGame } from '../interfaces/create-external-game.interface.js';

export const GAMES_REPOSITORY = Symbol('GAMES_REPOSITORY');

export interface GamesRepositoryContract {
  findAll(): Promise<{
    data: Game[];
    total: number;
  }>;

  findById(id: number): Promise<Game | null>;

  create(data: CreateGameDto): Promise<Game>;

  save(game: Game): Promise<Game>;

  remove(game: Game): Promise<Game>;

  findByRawgId(rawgId: number): Promise<Game | null>;

  createFromExternal(data: CreateExternalGame): Promise<Game>;
}
