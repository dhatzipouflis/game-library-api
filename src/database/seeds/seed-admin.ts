import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { UserRole } from '../../users/enums/user-role.enum.js';

const username = getRequiredEnv('SEED_ADMIN_USERNAME');

const email = getRequiredEnv('SEED_ADMIN_EMAIL');

const password = getRequiredEnv('SEED_ADMIN_PASSWORD');

if (!username || !email || !password) {
  throw new Error(
    'SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required',
  );
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const dataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),

  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [User],

  synchronize: false,
});

async function seedAdmin() {
  await dataSource.initialize();

  try {
    const repository = dataSource.getRepository(User);

    const existingByEmail = await repository.findOne({
      where: {
        email,
      },
    });

    const existingByUsername = await repository.findOne({
      where: {
        username,
      },
    });

    const existing = existingByEmail ?? existingByUsername;

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      if (existing.email !== email || existing.username !== username) {
        throw new Error(
          'Seed admin username or email is already used by another account',
        );
      }

      existing.role = UserRole.ADMIN;

      existing.passwordHash = passwordHash;

      await repository.save(existing);

      console.log(`Admin user updated: ${email}`);

      return;
    }

    const admin = repository.create({
      username,
      email,
      passwordHash,
      role: UserRole.ADMIN,
    });

    await repository.save(admin);

    console.log(`Admin user created: ${email}`);
  } finally {
    await dataSource.destroy();
  }
}

try {
  await seedAdmin();
} catch (error) {
  console.error('Failed to seed admin user', error);

  process.exitCode = 1;
}
