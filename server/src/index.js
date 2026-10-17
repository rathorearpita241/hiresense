import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDbChecker } from './db.js';
import { checkMlService } from './ml.js';

// Load the repo-root .env (if present) so all services share one config file.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const config = loadConfig();
const db = createDbChecker(config.mongoUri);

const app = createApp({
  config,
  checkDatabase: () => db.check(),
  checkMlService: () => checkMlService(config.mlServiceUrl),
});

const server = app.listen(config.port, () => {
  console.log(`HireSense API listening on http://localhost:${config.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
