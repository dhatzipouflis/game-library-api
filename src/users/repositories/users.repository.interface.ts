import type { User } from '../entities/user.entity.js';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepositoryContract {
  findByEmail(email: string): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;

  create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
}
