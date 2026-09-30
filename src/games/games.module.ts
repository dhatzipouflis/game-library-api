import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from './entities/game.entity.js';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';
import { GamesRepository } from './repositories/games.repository.js';
import { GAMES_REPOSITORY } from './repositories/games.repository.interface.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), AuthModule],
  controllers: [GamesController],
  providers: [
    GamesService,
    {
      provide: GAMES_REPOSITORY,
      useClass: GamesRepository,
    },
  ],
})
export class GamesModule {}
