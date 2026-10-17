/**
 * Small fetch wrapper. Every API error has the shape
 *   { error: { code, message } }
 * and is surfaced as an Error whose message is safe to show to the user.
 */
export async function apiGet(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Could not reach the HireSense API. Is the server running?');
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response; fall through to the generic message below.
  }

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Request failed (HTTP ${response.status}).`);
  }
  return body;
}
