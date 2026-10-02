import { initDatabase, resetDatabase } from './index.js';

export async function seedDatabase() {
  initDatabase();
  resetDatabase();
  console.log('Database cleanly reset with 0 accounts. Only user-created accounts will be present.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().catch(console.error);
}

