import { Inject, Injectable } from '@nestjs/common';

import {
  USERS_REPOSITORY,
  type UsersRepositoryContract,
} from './repositories/users.repository.interface.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryContract,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }

  create(username: string, email: string, passwordHash: string) {
    return this.usersRepository.create({
      username,
      email,
      passwordHash,
    });
  }
}
