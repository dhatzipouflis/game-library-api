import { Injectable } from '@nestjs/common';

import { GamesService } from '../../games/games.service.js';

import { RawgService } from './rawg.service.js';

@Injectable()
export class RawgImportService {
  constructor(
    private readonly rawgService: RawgService,

    private readonly gamesService: GamesService,
  ) {}

  async importGame(rawgId: number) {
    const rawgGame = await this.rawgService.getGame(rawgId);

    return this.gamesService.importFromRawg({
      rawgId: rawgGame.id,

      title: rawgGame.name,

      genre: rawgGame.genres[0]?.name ?? 'Unknown',

      platform: rawgGame.platforms[0]?.platform.name,

      imageUrl: rawgGame.background_image ?? undefined,

      releasedAt: rawgGame.released ? new Date(rawgGame.released) : undefined,

      metacritic: rawgGame.metacritic ?? undefined,
    });
  }
}
