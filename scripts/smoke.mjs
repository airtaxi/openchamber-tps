// Smoke test for the TPS Meter service.
//
// Starts a mock OpenChamber event stream and the built service, feeds it
// OpenCode 2 wire events (`session.text.delta`, `session.step.ended`,
// `session.execution.*`, ...) with the same envelopes the real stream uses,
// and checks the rolling rate, the direct token counts, and the turn average.
// Run with `bun scripts/smoke.mjs` or `node scripts/smoke.mjs` from the
// extension folder.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const serviceEntry = resolve(here, '..', 'service', 'main.js');
const TOKEN = 'smoke-token';
const MOCK_PORT = 39081;
const SERVICE_PORT = 39082;
const SESSION = 'ses_smoke';

const streamClients = new Set();
const requestedPaths = [];

const mock = http.createServer((req, res) => {
  requestedPaths.push(req.url);
  if (req.url !== '/api/global/event') {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
  res.write('data: {"id":"evt_0","created":0,"type":"server.connected","data":{}}\n\n');
  streamClients.add(res);
  req.on('close', () => streamClients.delete(res));
});

// OpenCode 2 frames are the event itself: `{ id, created, type, data }`.
let eventSeq = 0;
const emit = (type, data) => {
  eventSeq += 1;
  const frame = `data: ${JSON.stringify({ id: `evt_${eventSeq}`, created: Date.now(), type, data })}\n\n`;
  for (const client of streamClients) client.write(frame);
};

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const call = async (path, init) => {
  const response = await fetch(`http://127.0.0.1:${SERVICE_PORT}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(init?.headers ?? {}) },
  });
  return { status: response.status, body: await response.json() };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAILED: ${message}`);
};

await new Promise((done) => mock.listen(MOCK_PORT, '127.0.0.1', done));

const child = spawn(process.execPath, [serviceEntry], {
  env: {
    ...process.env,
    OPENCHAMBER_SERVICE_PORT: String(SERVICE_PORT),
    OPENCHAMBER_SERVICE_TOKEN: TOKEN,
  },
  stdio: 'inherit',
});

try {
  let health = null;
  for (let attempt = 0; attempt < 40 && !health; attempt += 1) {
    await wait(150);
    try {
      health = await call('/health');
    } catch {
      health = null;
    }
  }
  assert(health?.status === 200, 'service should answer /health');

  const unauthorized = await fetch(`http://127.0.0.1:${SERVICE_PORT}/health`);
  assert(unauthorized.status === 401, 'service should reject a request without the token');

  const watch = await call('/watch', {
    method: 'POST',
    body: JSON.stringify({ origin: `http://127.0.0.1:${MOCK_PORT}`, sessionId: SESSION }),
  });
  assert(watch.status === 200, 'watch should be accepted');

  let live = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(100);
    const rate = await call('/rate');
    if (rate.body.connection === 'live') {
      live = rate.body;
      break;
    }
  }
  assert(live, 'service should connect to the event stream');
  assert(
    requestedPaths.every((path) => path === '/api/global/event'),
    `service must use the global stream, saw ${requestedPaths.join(', ')}`,
  );

  emit('session.execution.started', { sessionID: SESSION });

  // 400 counted characters over ~0.5 s inside the watched session.
  for (let index = 0; index < 10; index += 1) {
    emit('session.text.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, delta: 'x'.repeat(40) });
    // Ignored: another session, and tool-input fragments (not generation).
    emit('session.text.delta', { sessionID: 'ses_other', assistantMessageID: 'msg_1', ordinal: 0, delta: 'y'.repeat(500) });
    emit('session.tool.input.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', id: 'call_1', delta: 'z'.repeat(500) });
    await wait(50);
  }

  await wait(200);
  const rate = await call('/rate');
  assert(rate.status === 200, 'rate should answer');
  assert(rate.body.sessionId === SESSION, 'rate should report the watched session');
  assert(rate.body.chars === 400, `expected 400 counted characters, got ${rate.body.chars}`);
  assert(Math.abs(rate.body.charsPerSecond - 80) < 1, `expected ~80 chars/s, got ${rate.body.charsPerSecond}`);
  assert(rate.body.tokensPerSecond > 0, 'tokens per second should be positive');
  assert(rate.body.busy === true, 'busy should follow session.execution.started');
  assert(rate.body.eventsSeen > 0, 'the stream counter should grow');
  assert(typeof rate.body.lastEventType === 'string', 'the last event type should be reported');
  assert(rate.body.waiting === null, 'no wait should be reported while generating');
  assert(rate.body.sessionUsage === null, 'session totals should be empty before the first settled step');

  // The agent asks for permission and stops generating. OpenCode keeps the
  // session busy while it waits, so only the pause accounting keeps this out of
  // the turn average.
  emit('permission.asked', { id: 'per_1', sessionID: SESSION, action: 'bash' });
  await wait(400);
  assert((await call('/rate')).body.waiting === 'permission', 'a pending permission should be reported');
  emit('session.text.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, delta: 'x'.repeat(40) });
  emit('permission.replied', { sessionID: SESSION, requestID: 'per_1', reply: 'once' });
  await wait(50);
  emit('session.text.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, delta: 'x'.repeat(40) });
  await wait(50);
  emit('session.text.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, delta: 'x'.repeat(40) });

  // The question tool arrives as a form on OpenCode 2.
  emit('form.created', { form: { id: 'frm_1', sessionID: SESSION, title: 'Pick one' } });
  await wait(50);
  assert((await call('/rate')).body.waiting === 'question', 'a pending form should be reported');
  emit('form.replied', { id: 'frm_1', sessionID: SESSION, answer: {} });
  await wait(50);
  assert((await call('/rate')).body.waiting === null, 'a resolved form should clear the wait');

  // A settled step carries the provider's real token counts and recalibrates
  // chars-per-token.
  emit('session.step.ended', {
    sessionID: SESSION,
    assistantMessageID: 'msg_1',
    finish: 'stop',
    cost: 0.01,
    tokens: { input: 900, output: 120, reasoning: 40, cache: { read: 0, write: 0 } },
  });
  await wait(100);
  const calibrated = await call('/rate');
  assert(calibrated.body.charsPerToken > 0.25, `expected calibration above the default, got ${calibrated.body.charsPerToken}`);

  // Session-cumulative usage is reported as-is, so the panel can show real
  // session totals next to the estimate.
  emit('session.usage.updated', {
    sessionID: SESSION,
    cost: 0.02,
    tokens: { input: 1000, output: 200, reasoning: 60, cache: { read: 0, write: 0 } },
  });
  await wait(100);
  const usage = await call('/rate');
  assert(usage.body.sessionUsage?.generated === 260, `expected 260 generated session tokens, got ${usage.body.sessionUsage?.generated}`);
  assert(usage.body.sessionUsage?.cost === 0.02, `expected the session cost, got ${usage.body.sessionUsage?.cost}`);

  emit('session.execution.succeeded', { sessionID: SESSION });
  await wait(100);
  const idle = await call('/rate');
  assert(idle.body.busy === false, 'busy should clear on session.execution.succeeded');
  assert(idle.body.waiting === null, 'a resolved permission should clear the wait');

  const turn = idle.body.lastTurn;
  assert(turn, 'a finished turn should be reported');
  assert(turn.source === 'tokens', `expected real token counts, got ${turn.source}`);
  assert(turn.tokens === 160, `expected 160 turn tokens, got ${turn.tokens}`);
  assert(turn.chars === 520, `expected 520 counted characters, got ${turn.chars}`);
  assert(turn.activeMs > 0, 'active time should be positive');
  assert(turn.wallMs > turn.activeMs, 'the wait should make wall time exceed generation time');
  assert(turn.pausedMs >= 350, `expected the wait to be excluded, paused ${turn.pausedMs} ms`);
  assert(
    turn.tokensPerSecond > turn.tokens / (turn.wallMs / 1000),
    'the average should divide by generation time only',
  );
  assert(turn.endedAt > 0, 'turn should be stamped');

  // Fallback path: a service that attached after the deltas went by still
  // counts characters from the full-value `*ended` boundary.
  const secondSession = 'ses_fallback';
  await call('/watch', {
    method: 'POST',
    body: JSON.stringify({ origin: `http://127.0.0.1:${MOCK_PORT}`, sessionId: secondSession }),
  });
  const switched = await call('/rate');
  assert(switched.body.lastTurn === null, 'watching a new session should clear the last turn');
  assert(switched.body.sessionUsage === null, 'watching a new session should clear the session totals');
  await wait(300);
  emit('session.execution.started', { sessionID: secondSession });
  emit('session.text.ended', { sessionID: secondSession, assistantMessageID: 'msg_2', ordinal: 0, text: 'a'.repeat(250) });
  await wait(50);
  emit('session.text.ended', { sessionID: secondSession, assistantMessageID: 'msg_2', ordinal: 0, text: 'a'.repeat(400) });
  await wait(100);
  // A shutdown is not the end of the turn: the session stays busy.
  emit('session.execution.interrupted', { sessionID: secondSession, reason: 'shutdown' });
  await wait(50);
  const interrupted = await call('/rate');
  assert(interrupted.body.busy === true, 'a shutdown interruption should keep the session busy');
  assert(interrupted.body.chars === 400, `expected 400 characters from the full-value boundary, got ${interrupted.body.chars}`);

  emit('session.execution.succeeded', { sessionID: secondSession });
  await wait(100);
  const fallback = await call('/rate');
  assert(fallback.body.busy === false, 'busy should clear after the resumed turn ends');
  assert(fallback.body.chars === 400, `expected 400 characters from the full-value boundary, got ${fallback.body.chars}`);

  console.log('turn:', JSON.stringify(turn));
  console.log('usage:', JSON.stringify(usage.body.sessionUsage));
  console.log('fallback:', JSON.stringify(fallback.body));
  console.log('smoke: ok');
} finally {
  child.kill();
  mock.close();
}
