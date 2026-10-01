import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Game } from '../../games/entities/game.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
@Unique('UQ_user_game', ['userId', 'gameId'])
export class UserGame {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  gameId!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  @ManyToOne(() => Game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gameId',
  })
  game!: Game;

  @CreateDateColumn()
  addedAt!: Date;
}
