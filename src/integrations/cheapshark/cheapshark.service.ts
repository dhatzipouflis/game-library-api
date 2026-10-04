import { BadGatewayException, Injectable } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import type {
  CheapSharkGame,
  CheapSharkGameDetails,
  CheapSharkStore,
} from './interfaces/cheapshark.interface.js';

@Injectable()
export class CheapSharkService {
  constructor(private readonly httpService: HttpService) {}

  async searchGames(title: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CheapSharkGame[]>('/games', {
          params: {
            title,
          },
        }),
      );

      return response.data.map((game) => ({
        cheapSharkId: game.gameID,
        steamAppId: game.steamAppID,
        title: game.external,
        cheapestPrice: game.cheapest,
        cheapestDealId: game.cheapestDealID,
        thumbnailUrl: game.thumb,
      }));
    } catch {
      throw new BadGatewayException('CheapShark API request failed');
    }
  }

  async getGameDetails(cheapSharkId: string): Promise<CheapSharkGameDetails> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CheapSharkGameDetails>('/games', {
          params: {
            id: cheapSharkId,
          },
        }),
      );

      return response.data;
    } catch {
      throw new BadGatewayException('CheapShark API request failed');
    }
  }

  async getStores(): Promise<CheapSharkStore[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CheapSharkStore[]>('/stores'),
      );

      return response.data;
    } catch {
      throw new BadGatewayException('CheapShark API request failed');
    }
  }
}
