export interface CheapSharkGame {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  thumb: string;
}

export interface CheapSharkDeal {
  storeID: string;
  dealID: string;
  price: string;
  retailPrice: string;
  savings: string;
}

export interface CheapSharkGameDetails {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };

  cheapestPriceEver: {
    price: string;
    date: number;
  };

  deals: CheapSharkDeal[];
}

export interface CheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: number;

  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}
