import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AuthModule } from '../../auth/auth.module.js';
import { GamesModule } from '../../games/games.module.js';

import { RawgController } from './rawg.controller.js';
import { RawgImportService } from './rawg-import.service.js';
import { RawgService } from './rawg.service.js';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),

    AuthModule,
    GamesModule,
  ],

  controllers: [RawgController],

  providers: [RawgService, RawgImportService],
})
export class RawgModule {}
