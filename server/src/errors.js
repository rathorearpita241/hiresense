/**
 * Application error with an HTTP status and a stable, machine-readable code.
 * Every error response from the API has the shape:
 *   { "error": { "code": "SOME_CODE", "message": "Human readable text", "details"?: ... } }
 */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function body(code, message, details) {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } };
}

/**
 * Convert any thrown value into { status, body }.
 * Unknown errors become a generic 500: internals, stack traces and secrets are never exposed.
 */
export function toErrorResponse(err) {
  if (err instanceof AppError) {
    return { status: err.status, body: body(err.code, err.message, err.details) };
  }
  if (err?.type === 'entity.parse.failed') {
    return { status: 400, body: body('INVALID_JSON', 'Request body is not valid JSON.') };
  }
  if (err?.type === 'entity.too.large') {
    return { status: 413, body: body('PAYLOAD_TOO_LARGE', 'Request body is too large.') };
  }
  return { status: 500, body: body('INTERNAL_ERROR', 'Something went wrong on our side.') };
}
