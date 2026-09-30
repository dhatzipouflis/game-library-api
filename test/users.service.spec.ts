import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersService } from '../src/users/users.service.js';

import {
  USERS_REPOSITORY,
  type UsersRepositoryContract,
} from '../src/users/repositories/users.repository.interface.js';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findByEmail: vi.fn<UsersRepositoryContract['findByEmail']>(),

    findByUsername: vi.fn<UsersRepositoryContract['findByUsername']>(),

    create: vi.fn<UsersRepositoryContract['create']>(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find a user by email', async () => {
    const user = {
      id: 1,
      username: 'qrowley',
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    };

    usersRepositoryMock.findByEmail.mockResolvedValue(user);

    const result = await service.findByEmail('user@example.com');

    expect(result).toEqual(user);

    expect(usersRepositoryMock.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
  });

  it('should find a user by username', async () => {
    const user = {
      id: 1,
      username: 'qrowley',
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    };

    usersRepositoryMock.findByUsername.mockResolvedValue(user);

    const result = await service.findByUsername('qrowley');

    expect(result).toEqual(user);

    expect(usersRepositoryMock.findByUsername).toHaveBeenCalledWith('qrowley');
  });

  it('should create a user', async () => {
    const createdUser = {
      id: 1,
      username: 'qrowley',
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    };

    usersRepositoryMock.create.mockResolvedValue(createdUser);

    const result = await service.create('qrowley', 'user@example.com', 'hash');

    expect(result).toEqual(createdUser);

    expect(usersRepositoryMock.create).toHaveBeenCalledWith({
      username: 'qrowley',
      email: 'user@example.com',
      passwordHash: 'hash',
    });
  });
});
