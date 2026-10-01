import type { UserGame } from '../entities/user-game.entity.js';

export const USER_GAMES_REPOSITORY = Symbol('USER_GAMES_REPOSITORY');

export interface UserGamesRepositoryContract {
  findAllByUser(userId: number): Promise<UserGame[]>;

  findByUserAndGame(userId: number, gameId: number): Promise<UserGame | null>;

  create(userId: number, gameId: number): Promise<UserGame>;

  remove(userGame: UserGame): Promise<UserGame>;
}
