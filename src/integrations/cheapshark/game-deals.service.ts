import { Injectable, NotFoundException } from '@nestjs/common';

import { GamesService } from '../../games/games.service.js';

import { CheapSharkService } from './cheapshark.service.js';

@Injectable()
export class GameDealsService {
  constructor(
    private readonly gamesService: GamesService,

    private readonly cheapSharkService: CheapSharkService,
  ) {}

  async getDeals(gameId: number) {
    const game = await this.gamesService.findOne(gameId);

    const matches = await this.cheapSharkService.searchGames(game.title);

    if (!matches.length) {
      throw new NotFoundException(
        `No CheapShark listing found for "${game.title}"`,
      );
    }

    const normalize = (value: string) => value.trim().toLowerCase();

    const match =
      matches.find(
        (candidate) => normalize(candidate.title) === normalize(game.title),
      ) ?? matches[0];

    const [details, stores] = await Promise.all([
      this.cheapSharkService.getGameDetails(match.cheapSharkId),

      this.cheapSharkService.getStores(),
    ]);

    const storeMap = new Map(
      stores.map((store) => [store.storeID, store.storeName]),
    );

    const deals = details.deals
      .map((deal) => ({
        storeId: deal.storeID,

        store: storeMap.get(deal.storeID) ?? 'Unknown',

        price: Number(deal.price),

        retailPrice: Number(deal.retailPrice),

        savingsPercent: Number(deal.savings),

        dealUrl: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(
          deal.dealID,
        )}`,
      }))
      .sort((a, b) => a.price - b.price);

    return {
      game: {
        id: game.id,
        title: game.title,
      },

      cheapShark: {
        gameId: match.cheapSharkId,

        steamAppId: details.info.steamAppID,

        cheapestPriceEver: Number(details.cheapestPriceEver.price),

        currency: 'USD',
      },

      deals,
    };
  }
}
