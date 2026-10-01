import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';
import { GamesModule } from '../games/games.module.js';

import { UserGame } from './entities/user-game.entity.js';

import { UserGamesController } from './user-games.controller.js';

import { UserGamesRepository } from './repositories/user-games.repository.js';

import { USER_GAMES_REPOSITORY } from './repositories/user-games.repository.interface.js';

import { UserGamesService } from './user-games.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserGame]), AuthModule, GamesModule],

  controllers: [UserGamesController],

  providers: [
    UserGamesService,

    {
      provide: USER_GAMES_REPOSITORY,

      useClass: UserGamesRepository,
    },
  ],
})
export class UserGamesModule {}
