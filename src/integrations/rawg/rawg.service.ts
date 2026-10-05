import { BadGatewayException, Injectable } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import type {
  RawgGame,
  RawgSearchResponse,
} from './interfaces/rawg.interface.js';
import { AppCacheService } from '../../cache/app-cache.service.js';
import { CACHE_TTL } from '../../cache/cache.constants.js';

@Injectable()
export class RawgService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: AppCacheService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('RAWG_API_KEY');

    this.baseUrl = this.configService.getOrThrow<string>('RAWG_BASE_URL');
  }

  async searchGames(search: string) {
    const normalizedSearch = search.trim().toLowerCase().replace(/\s+/g, ' ');

    const cacheKey = `rawg:search:${normalizedSearch}`;

    const cached = await this.cacheService.get<RawgSearchResponse>(cacheKey);

    let data: RawgSearchResponse;

    if (cached) {
      data = cached;
    } else {
      try {
        const response = await firstValueFrom(
          this.httpService.get<RawgSearchResponse>(`${this.baseUrl}/games`, {
            params: {
              key: this.apiKey,
              search,
              page_size: 10,
            },
          }),
        );

        data = response.data;

        await this.cacheService.set(cacheKey, data, CACHE_TTL.RAWG_SEARCH);
      } catch {
        throw new BadGatewayException('RAWG API request failed');
      }
    }

    return data.results.map((game) => ({
      rawgId: game.id,
      title: game.name,
      released: game.released,
      imageUrl: game.background_image,
      metacritic: game.metacritic,

      genres: game.genres.map((genre) => genre.name),

      platforms: game.platforms.map(({ platform }) => platform.name),
    }));
  }
  async getGame(rawgId: number): Promise<RawgGame> {
    const cacheKey = `rawg:game:${rawgId}`;

    const cached = await this.cacheService.get<RawgGame>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<RawgGame>(`${this.baseUrl}/games/${rawgId}`, {
          params: {
            key: this.apiKey,
          },
        }),
      );

      await this.cacheService.set(cacheKey, response.data, CACHE_TTL.RAWG_GAME);

      return response.data;
    } catch {
      throw new BadGatewayException('RAWG API request failed');
    }
  }
}
