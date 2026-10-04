import { BadGatewayException, Injectable } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import type {
  RawgGame,
  RawgSearchResponse,
} from './interfaces/rawg.interface.js';

@Injectable()
export class RawgService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('RAWG_API_KEY');

    this.baseUrl = this.configService.getOrThrow<string>('RAWG_BASE_URL');
  }

  async searchGames(search: string) {
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

      return response.data.results.map((game) => ({
        rawgId: game.id,
        title: game.name,
        released: game.released,
        imageUrl: game.background_image,
        metacritic: game.metacritic,

        genres: game.genres.map((genre) => genre.name),

        platforms: game.platforms.map(({ platform }) => platform.name),
      }));
    } catch {
      throw new BadGatewayException('RAWG API request failed');
    }
  }

  async getGame(rawgId: number): Promise<RawgGame> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<RawgGame>(`${this.baseUrl}/games/${rawgId}`, {
          params: {
            key: this.apiKey,
          },
        }),
      );

      return response.data;
    } catch {
      throw new BadGatewayException('RAWG API request failed');
    }
  }
}
