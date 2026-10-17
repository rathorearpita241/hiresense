/**
 * Ask the Python ML service whether it is healthy.
 * Never throws: a failing dependency is reported as { status: 'down' } so /api/health
 * can still answer. Raw error messages are not passed on to clients.
 */
export async function checkMlService(baseUrl, { timeoutMs = 2000, fetchImpl = fetch } = {}) {
  if (!baseUrl) {
    return { status: 'unconfigured' };
  }
  try {
    const response = await fetchImpl(new URL('/health', baseUrl), {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      return { status: 'down', detail: `HTTP ${response.status}` };
    }
    const data = await response.json();
    return {
      status: 'up',
      version: data.version ?? null,
      modelLoaded: Boolean(data.model_loaded),
      modelVersion: data.model_version ?? null,
    };
  } catch (err) {
    return { status: 'down', detail: err?.name === 'TimeoutError' ? 'timeout' : 'unreachable' };
  }
}
