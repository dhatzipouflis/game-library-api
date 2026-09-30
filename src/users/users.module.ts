import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity.js';
import { UsersRepository } from './repositories/users.repository.js';
import { USERS_REPOSITORY } from './repositories/users.repository.interface.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],

  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],

  exports: [UsersService],
})
export class UsersModule {}
