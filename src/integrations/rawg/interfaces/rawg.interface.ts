export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgPlatformInfo {
  id: number;
  name: string;
  slug: string;
}

export interface RawgPlatform {
  platform: RawgPlatformInfo;
}

export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
  metacritic: number | null;
  genres: RawgGenre[];
  platforms: RawgPlatform[];
}

export interface RawgSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}
