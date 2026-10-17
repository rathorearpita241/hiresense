import { Router } from 'express';

/**
 * GET /api/health
 * The API itself is reachable if this answers (HTTP 200). `status` is "ok" only when every
 * dependency is up, otherwise "degraded", so the UI can show exactly what is missing.
 */
export function healthRouter({ checkDatabase, checkMlService, version }) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const [database, mlService] = await Promise.all([checkDatabase(), checkMlService()]);
    const allUp = [database, mlService].every((dependency) => dependency.status === 'up');

    res.json({
      status: allUp ? 'ok' : 'degraded',
      service: 'hiresense-api',
      version,
      time: new Date().toISOString(),
      dependencies: { database, mlService },
    });
  });

  return router;
}
