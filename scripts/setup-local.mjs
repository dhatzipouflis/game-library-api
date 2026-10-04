import { copyFileSync, existsSync } from 'node:fs';

import { spawnSync } from 'node:child_process';

import { setTimeout as wait } from 'node:timers/promises';

const isWindows = process.platform === 'win32';

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function checkCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'ignore',
    shell: isWindows,
  });

  return result.status === 0;
}

const nodeMajor = Number(process.versions.node.split('.')[0]);

if (nodeMajor < 24) {
  throw new Error(
    `Node.js 24+ is required. Current version: ${process.version}`,
  );
}

if (!checkCommand('docker', ['--version'])) {
  throw new Error('Docker is required for local setup');
}

if (!checkCommand('docker', ['compose', 'version'])) {
  throw new Error('Docker Compose is required for local setup');
}

if (!existsSync('.env')) {
  console.log('\n.env not found. Creating it from .env.example...');

  copyFileSync('.env.example', '.env');

  console.log('Created .env');

  console.log('Remember to replace RAWG_API_KEY before using RAWG endpoints.');
} else {
  console.log('\nExisting .env found. Keeping it.');
}

run('npm', ['ci']);

run('docker', ['compose', 'up', '-d']);

console.log('\nWaiting for PostgreSQL...');

let databaseReady = false;

for (let attempt = 1; attempt <= 30; attempt++) {
  const result = spawnSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'pg_isready',
      '-U',
      'gamelibrary',
      '-d',
      'gamelibrary',
    ],
    {
      stdio: 'ignore',
      shell: isWindows,
    },
  );

  if (result.status === 0) {
    databaseReady = true;
    break;
  }

  await wait(2000);
}

if (!databaseReady) {
  throw new Error('PostgreSQL did not become ready in time');
}

console.log('PostgreSQL is ready.');

run('npm', ['run', 'migration:run']);

run('npm', ['run', 'seed:admin']);

console.log(`
Local setup completed ✅

Start the API:
  npm run start:dev

Swagger:
  http://localhost:3000/api

Mailpit:
  http://localhost:8025

Default local admin:
  admin@gamelibrary.local

The password is configured through:
  SEED_ADMIN_PASSWORD
`);
