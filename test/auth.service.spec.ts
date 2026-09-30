import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../src/auth/auth.service.js';
import { UsersService } from '../src/users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    create: vi.fn(),
  };

  const jwtServiceMock = {
    signAsync: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: UsersService,
          useValue: usersServiceMock,
        },

        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.findByUsername.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      usersServiceMock.create.mockResolvedValue(createdUser);

      const result = await service.register({
        username: 'qrowley',
        email: 'user@example.com',
        password: 'StrongPassword123!',
      });

      expect(result).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );

      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('qrowley');

      expect(usersServiceMock.create).toHaveBeenCalledWith(
        'qrowley',
        'user@example.com',
        expect.any(String),
      );

      const passedHash = usersServiceMock.create.mock.calls[0][2];

      expect(passedHash).not.toBe('StrongPassword123!');
    });

    it('should throw ConflictException when email already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 1,
      });

      await expect(
        service.register({
          username: 'qrowley',
          email: 'user@example.com',
          password: 'StrongPassword123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersServiceMock.findByUsername).not.toHaveBeenCalled();

      expect(usersServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      usersServiceMock.findByUsername.mockResolvedValue({
        id: 1,
      });

      await expect(
        service.register({
          username: 'qrowley',
          email: 'user@example.com',
          password: 'StrongPassword123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(usersServiceMock.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login using username', async () => {
      const password = 'StrongPassword123!';
      const passwordHash = await bcrypt.hash(password, 4);

      const user = {
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash,
        createdAt: new Date(),
      };

      usersServiceMock.findByUsername.mockResolvedValue(user);

      jwtServiceMock.signAsync.mockResolvedValue('test-token');

      const result = await service.login({
        identifier: 'qrowley',
        password,
      });

      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith('qrowley');

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'qrowley',
        email: 'user@example.com',
      });

      expect(result).toEqual({
        accessToken: 'test-token',
        user: {
          id: 1,
          username: 'qrowley',
          email: 'user@example.com',
        },
      });
    });

    it('should login using email', async () => {
      const password = 'StrongPassword123!';
      const passwordHash = await bcrypt.hash(password, 4);

      const user = {
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash,
        createdAt: new Date(),
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      jwtServiceMock.signAsync.mockResolvedValue('test-token');

      const result = await service.login({
        identifier: 'user@example.com',
        password,
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );

      expect(result.accessToken).toBe('test-token');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      usersServiceMock.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({
          identifier: 'unknown-user',
          password: 'StrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123!', 4);

      usersServiceMock.findByUsername.mockResolvedValue({
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash,
      });

      await expect(
        service.login({
          identifier: 'qrowley',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
