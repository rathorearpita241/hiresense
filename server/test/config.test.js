import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadConfig } from '../src/config.js';
import { checkMlService } from '../src/ml.js';

test('loadConfig applies defaults', () => {
  const config = loadConfig({});
  assert.equal(config.port, 4000);
  assert.deepEqual(config.corsOrigins, ['http://localhost:5173']);
  assert.equal(config.mongoUri, null);
  assert.equal(config.mlServiceUrl, null);
});

test('loadConfig splits and trims CORS origins', () => {
  const config = loadConfig({ CORS_ORIGIN: ' http://a.test , http://b.test ,, ' });
  assert.deepEqual(config.corsOrigins, ['http://a.test', 'http://b.test']);
});

test('loadConfig rejects invalid ports', () => {
  for (const bad of ['abc', '0', '70000', '-1', '4000x']) {
    assert.throws(() => loadConfig({ PORT: bad }), /Invalid PORT/, `PORT=${bad}`);
  }
});

test('checkMlService is unconfigured without a URL', async () => {
  assert.deepEqual(await checkMlService(null), { status: 'unconfigured' });
});

test('checkMlService maps a healthy response', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ version: '0.1.0', model_loaded: false, model_version: null }),
  });
  const result = await checkMlService('http://ml.test', { fetchImpl });
  assert.deepEqual(result, {
    status: 'up',
    version: '0.1.0',
    modelLoaded: false,
    modelVersion: null,
  });
});

test('checkMlService reports non-2xx as down', async () => {
  const fetchImpl = async () => ({ ok: false, status: 503 });
  const result = await checkMlService('http://ml.test', { fetchImpl });
  assert.deepEqual(result, { status: 'down', detail: 'HTTP 503' });
});

test('checkMlService reports network failures as down without leaking the message', async () => {
  const fetchImpl = async () => {
    throw new Error('connect ECONNREFUSED 10.0.0.5:8000');
  };
  const result = await checkMlService('http://ml.test', { fetchImpl });
  assert.deepEqual(result, { status: 'down', detail: 'unreachable' });
});
