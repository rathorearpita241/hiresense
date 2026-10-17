import { MongoClient } from 'mongodb';

/**
 * Lazily connects to MongoDB and exposes a health check.
 * check() never throws; a failure is reported as { status: 'down' }.
 */
export function createDbChecker(uri, { timeoutMs = 2000 } = {}) {
  if (!uri) {
    return {
      check: async () => ({ status: 'unconfigured' }),
      close: async () => {},
    };
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeoutMs });

  return {
    async check() {
      try {
        await client.connect();
        await client.db().command({ ping: 1 });
        return { status: 'up' };
      } catch {
        return { status: 'down', detail: 'unreachable' };
      }
    },
    async close() {
      await client.close();
    },
  };
}
