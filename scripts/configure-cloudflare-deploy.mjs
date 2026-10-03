import { readFile, writeFile } from 'node:fs/promises';

const configPath = new URL('../dist/server/wrangler.json', import.meta.url);
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || '__GRAMMARTEST_D1_DATABASE_ID__';

if (databaseId.startsWith('__')) {
  throw new Error('Set CLOUDFLARE_D1_DATABASE_ID before preparing the Cloudflare deployment.');
}

const config = JSON.parse(await readFile(configPath, 'utf8'));
config.name = 'grammartest';
config.topLevelName = 'grammartest';
config.observability = { enabled: true };
config.d1_databases = [{
  binding: 'DB',
  database_name: 'grammartest-db',
  database_id: databaseId,
  migrations_dir: '../../drizzle',
}];

await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Prepared ${configPath.pathname} for Cloudflare Worker “grammartest”.`);
