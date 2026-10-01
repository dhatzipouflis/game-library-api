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

  @CreateDateColumn()
  createdAt!: Date;
}
