export interface CreateExternalGame {
  rawgId: number;
  title: string;
  genre: string;
  platform?: string;
  imageUrl?: string;
  releasedAt?: Date;
  metacritic?: number;
}
