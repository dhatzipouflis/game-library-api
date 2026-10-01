import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserRole } from '../enums/user-role.enum.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 50,
  })
  username!: string;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;
}
