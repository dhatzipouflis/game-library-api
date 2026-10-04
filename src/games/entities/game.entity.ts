import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 150,
  })
  title!: string;

  @Column({
    length: 50,
  })
  genre!: string;

  @Column({
    nullable: true,
    length: 50,
  })
  platform?: string;

  @Column({
    nullable: true,
    unique: true,
  })
  rawgId?: number;

  @Column({
    nullable: true,
  })
  imageUrl?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  releasedAt?: Date;

  @Column({
    nullable: true,
  })
  metacritic?: number;

  @CreateDateColumn()
  createdAt!: Date;
}
