import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { UserRole } from '../../users/enums/user-role.enum.js';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{
      user: AuthenticatedUser;
    }>();

    return request.user;
  },
);
