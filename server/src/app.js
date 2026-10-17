import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';

/**
 * Build the Express app. Dependencies are injected so tests can run without
 * MongoDB or the Python service.
 */
export function createApp({ config, checkDatabase, checkMlService, logger = console }) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  }
  app.use(express.json({ limit: '100kb' }));

  app.use(
    '/api/health',
    healthRouter({ checkDatabase, checkMlService, version: config.version }),
  );

  app.use(notFound);
  app.use(errorHandler({ logger }));

  return app;
}
