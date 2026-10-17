import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

/**
 * Read and validate configuration from environment variables.
 * Fails fast on invalid values so misconfiguration is caught at startup.
 */
export function loadConfig(env = process.env) {
  const rawPort = env.PORT ?? '4000';
  const port = Number.parseInt(rawPort, 10);
  if (!/^\d+$/.test(String(rawPort)) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${rawPort}": expected an integer between 1 and 65535`);
  }

  return {
    version: pkg.version,
    nodeEnv: env.NODE_ENV || 'development',
    port,
    corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    mongoUri: env.MONGODB_URI || null,
    mlServiceUrl: env.ML_SERVICE_URL || null,
  };
}
