import { BadGatewayException, Injectable } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import { AppCacheService } from '../../cache/app-cache.service.js';

import { CACHE_TTL } from '../../cache/cache.constants.js';

import type {
  CheapSharkGame,
  CheapSharkGameDetails,
  CheapSharkStore,
} from './interfaces/cheapshark.interface.js';

@Injectable()
export class CheapSharkService {
  constructor(
    private readonly httpService: HttpService,

    private readonly cacheService: AppCacheService,
  ) {}

  async searchGames(title: string) {
    const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, ' ');

    const cacheKey = `cheapshark:search:${normalizedTitle}`;

    const cached = await this.cacheService.get<CheapSharkGame[]>(cacheKey);

    let games: CheapSharkGame[];

    if (cached) {
      games = cached;
    } else {
      try {
        const response = await firstValueFrom(
          this.httpService.get<CheapSharkGame[]>('/games', {
            params: {
              title,
            },
          }),
        );

        games = response.data;

        await this.cacheService.set(
          cacheKey,
          games,
          CACHE_TTL.CHEAPSHARK_SEARCH,
        );
      } catch {
        throw new BadGatewayException('CheapShark API request failed');
      }
    }

    return games.map((game) => ({
      cheapSharkId: game.gameID,

      steamAppId: game.steamAppID,

      title: game.external,

      cheapestPrice: game.cheapest,

      cheapestDealId: game.cheapestDealID,

      thumbnailUrl: game.thumb,
    }));
  }

  async getGameDetails(cheapSharkId: string): Promise<CheapSharkGameDetails> {
    const cacheKey = `cheapshark:game:${cheapSharkId}`;

    const cached = await this.cacheService.get<CheapSharkGameDetails>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<CheapSharkGameDetails>('/games', {
          params: {
            id: cheapSharkId,
          },
        }),
      );

      await this.cacheService.set(
        cacheKey,
        response.data,
        CACHE_TTL.CHEAPSHARK_GAME_DETAILS,
      );

      return response.data;
    } catch {
      throw new BadGatewayException('CheapShark API request failed');
    }
  }

  async getStores(): Promise<CheapSharkStore[]> {
    const cacheKey = 'cheapshark:stores';

    const cached = await this.cacheService.get<CheapSharkStore[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<CheapSharkStore[]>('/stores'),
      );

      await this.cacheService.set(
        cacheKey,
        response.data,
        CACHE_TTL.CHEAPSHARK_STORES,
      );

      return response.data;
    } catch {
      throw new BadGatewayException('CheapShark API request failed');
    }
  }
}
