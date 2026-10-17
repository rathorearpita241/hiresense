import { AppError, toErrorResponse } from '../errors.js';

export function notFound(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `No route for ${req.method} ${req.path}`));
}

// Express recognises error handlers by their four-argument signature.
export function errorHandler({ logger = console } = {}) {
  // eslint-disable-next-line no-unused-vars
  return (err, _req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    const { status, body } = toErrorResponse(err);
    if (status >= 500) {
      // Full details go to the server log only, never to the client.
      logger.error(err);
    }
    return res.status(status).json(body);
  };
}
