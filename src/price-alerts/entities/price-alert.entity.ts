import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Game } from '../../games/entities/game.entity.js';
import { User } from '../../users/entities/user.entity.js';

const moneyTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity()
@Unique('UQ_price_alert_user_game', ['userId', 'gameId'])
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  gameId!: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: moneyTransformer,
  })
  targetPrice!: number;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    default: false,
  })
  isTriggered!: boolean;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: moneyTransformer,
  })
  lastNotifiedPrice?: number | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  lastCheckedAt?: Date | null;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: Relation<User>;

  @ManyToOne(() => Game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gameId',
  })
  game!: Relation<Game>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
