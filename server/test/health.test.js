import assert from 'node:assert/strict';
import { test } from 'node:test';

import request from 'supertest';

import { createApp } from '../src/app.js';

const config = { nodeEnv: 'test', corsOrigins: ['http://localhost:5173'], version: '0.1.0' };
const up = async () => ({ status: 'up' });
const down = async () => ({ status: 'down', detail: 'unreachable' });
const silentLogger = { error: () => {} };

function build(overrides = {}) {
  return createApp({
    config,
    checkDatabase: up,
    checkMlService: up,
    logger: silentLogger,
    ...overrides,
  });
}

test('GET /api/health reports ok when every dependency is up', async () => {
  const res = await request(build()).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'hiresense-api');
  assert.equal(res.body.version, '0.1.0');
  assert.deepEqual(res.body.dependencies, {
    database: { status: 'up' },
    mlService: { status: 'up' },
  });
  assert.ok(!Number.isNaN(Date.parse(res.body.time)));
});

test('GET /api/health reports degraded (still HTTP 200) when a dependency is down', async () => {
  const res = await request(build({ checkMlService: down })).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'degraded');
  assert.equal(res.body.dependencies.database.status, 'up');
  assert.equal(res.body.dependencies.mlService.status, 'down');
});

test('unconfigured dependencies are not reported as ok', async () => {
  const unconfigured = async () => ({ status: 'unconfigured' });
  const res = await request(build({ checkDatabase: unconfigured })).get('/api/health');
  assert.equal(res.body.status, 'degraded');
});

test('unknown routes return the standard error shape', async () => {
  const res = await request(build()).get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
  assert.equal(typeof res.body.error.message, 'string');
});

test('malformed JSON returns 400 INVALID_JSON', async () => {
  const res = await request(build())
    .post('/api/anything')
    .set('Content-Type', 'application/json')
    .send('{"broken":');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_JSON');
});

test('oversized bodies return 413 PAYLOAD_TOO_LARGE', async () => {
  const res = await request(build())
    .post('/api/anything')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ blob: 'x'.repeat(200_000) }));
  assert.equal(res.status, 413);
  assert.equal(res.body.error.code, 'PAYLOAD_TOO_LARGE');
});

test('unexpected errors become a generic 500 and never leak internals', async () => {
  const logged = [];
  const boom = async () => {
    throw new Error('secret connection string mongodb://user:pass@host');
  };
  const res = await request(
    build({ checkDatabase: boom, logger: { error: (e) => logged.push(e) } }),
  ).get('/api/health');

  assert.equal(res.status, 500);
  assert.equal(res.body.error.code, 'INTERNAL_ERROR');
  assert.ok(!JSON.stringify(res.body).includes('secret'));
  assert.equal(logged.length, 1, 'the real error is logged server-side');
});

test('security headers are set and CORS only allows configured origins', async () => {
  const app = build();
  const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.ok(allowed.headers['x-content-type-options']);

  const blocked = await request(app).get('/api/health').set('Origin', 'http://evil.example');
  assert.equal(blocked.headers['access-control-allow-origin'], undefined);
});
