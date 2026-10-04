import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Game } from '../games/entities/game.entity.js';
import { UserGame } from '../user-games/entities/user-game.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PriceAlert } from '../price-alerts/entities/price-alert.entity.js';

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),

  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [Game, User, UserGame, PriceAlert],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});
