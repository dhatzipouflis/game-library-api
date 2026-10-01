import { ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesGuard } from '../src/auth/guards/roles.guard.js';

import { UserRole } from '../src/users/enums/user-role.enum.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const reflectorMock = {
    getAllAndOverride: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new RolesGuard(reflectorMock as unknown as Reflector);
  });

  function createContext(role: UserRole): ExecutionContext {
    return {
      getHandler: vi.fn(),

      getClass: vi.fn(),

      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 1,
            username: 'qrowley',
            email: 'user@example.com',
            role,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow route when no roles are required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(createContext(UserRole.USER));

    expect(result).toBe(true);
  });

  it('should allow admin on admin-only route', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = guard.canActivate(createContext(UserRole.ADMIN));

    expect(result).toBe(true);
  });

  it('should reject normal user on admin-only route', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = guard.canActivate(createContext(UserRole.USER));

    expect(result).toBe(false);
  });

  it('should allow user when USER role is required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([UserRole.USER]);

    const result = guard.canActivate(createContext(UserRole.USER));

    expect(result).toBe(true);
  });
});
