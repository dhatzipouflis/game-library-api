import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../src/auth/auth.service.js';

import { UserRole } from '../src/users/enums/user-role.enum.js';
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
    it('should register a normal user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      usersServiceMock.findByUsername.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      usersServiceMock.create.mockResolvedValue(createdUser);

      const dto = {
        username: 'qrowley',
        email: 'user@example.com',
        password: 'StrongPassword123!',
      };

      const result = await service.register(dto);

      expect(result).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(usersServiceMock.findByUsername).toHaveBeenCalledWith(
        dto.username,
      );

      expect(usersServiceMock.create).toHaveBeenCalledWith(
        dto.username,
        dto.email,
        expect.any(String),
      );

      const passwordHash = usersServiceMock.create.mock.calls[0][2];

      expect(passwordHash).not.toBe(dto.password);

      expect(await bcrypt.compare(dto.password, passwordHash)).toBe(true);
    });

    it('should reject duplicate email', async () => {
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

    it('should reject duplicate username', async () => {
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
        role: UserRole.USER,
        createdAt: new Date(),
      };

      usersServiceMock.findByUsername.mockResolvedValue(user);

      jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        identifier: 'qrowley',
        password,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'qrowley',
        email: 'user@example.com',
        role: UserRole.USER,
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',

        user: {
          id: 1,
          username: 'qrowley',
          email: 'user@example.com',
          role: UserRole.USER,
        },
      });
    });

    it('should login using email', async () => {
      const password = 'StrongPassword123!';

      const passwordHash = await bcrypt.hash(password, 4);

      const user = {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        role: UserRole.ADMIN,
        createdAt: new Date(),
      };

      usersServiceMock.findByEmail.mockResolvedValue(user);

      jwtServiceMock.signAsync.mockResolvedValue('admin-token');

      const result = await service.login({
        identifier: 'admin@example.com',
        password,
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
        'admin@example.com',
      );

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 2,
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should reject unknown user', async () => {
      usersServiceMock.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({
          identifier: 'does-not-exist',
          password: 'StrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('should reject incorrect password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123!', 4);

      usersServiceMock.findByUsername.mockResolvedValue({
        id: 1,
        username: 'qrowley',
        email: 'user@example.com',
        passwordHash,
        role: UserRole.USER,
        createdAt: new Date(),
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
