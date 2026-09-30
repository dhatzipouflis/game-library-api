import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity.js';
import type { UsersRepositoryContract } from './users.repository.interface.js';

@Injectable()
export class UsersRepository implements UsersRepositoryContract {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return this.repository.findOne({
      where: { username },
    });
  }

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }) {
    const user = this.repository.create(data);

    return this.repository.save(user);
  }
}
