// Smoke test for the TPS Meter service.
//
// Starts a mock OpenCode event stream and the built service, feeds it OpenCode
// 2 wire events (`session.text.*`, `session.reasoning.*`, `session.tool.input.*`,
// `session.step.*`, `session.execution.*`, ...) with the same envelopes and in
// the same order the real stream uses, and checks the rolling rate, the direct
// token counts, and the turn average.
//
// The first service runs as a 2.7.0 host starts it: OPENCHAMBER_OPENCODE_URL
// points at the mock and the service token is its bearer. A second service
// without that URL covers the OpenChamber proxy fallback, and a third covers
// the blocked state when neither source exists.
//
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
const PRIMARY_PORT = 39082;
const FALLBACK_PORT = 39083;
const BLOCKED_PORT = 39084;
const SESSION = 'ses_smoke';
const FALLBACK_SESSION = 'ses_fallback_service';

const streamClients = new Set();
const requested = [];

const mock = http.createServer((req, res) => {
  requested.push({ path: req.url, authorization: req.headers.authorization ?? null });
  if (req.url !== '/api/event' && req.url !== '/api/global/event') {
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

const call = async (port, path, init) => {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(init?.headers ?? {}) },
  });
  return { status: response.status, body: await response.json() };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`FAILED: ${message}`);
};

const children = [];
const startService = (port, extraEnv = {}) => {
  const child = spawn(process.execPath, [serviceEntry], {
    env: {
      ...process.env,
      OPENCHAMBER_SERVICE_PORT: String(port),
      OPENCHAMBER_SERVICE_TOKEN: TOKEN,
      ...extraEnv,
    },
    stdio: 'inherit',
  });
  children.push(child);
  return child;
};

const waitForHealth = async (port) => {
  let health = null;
  for (let attempt = 0; attempt < 40 && !health; attempt += 1) {
    await wait(150);
    try {
      health = await call(port, '/health');
    } catch {
      health = null;
    }
  }
  assert(health?.status === 200, `service on ${port} should answer /health`);
};

const waitForLive = async (port) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(100);
    const rate = await call(port, '/rate');
    if (rate.body.connection === 'live') return rate.body;
  }
  return null;
};

await new Promise((done) => mock.listen(MOCK_PORT, '127.0.0.1', done));

const primary = startService(PRIMARY_PORT, {
  OPENCHAMBER_OPENCODE_URL: `http://127.0.0.1:${MOCK_PORT}`,
});

try {
  await waitForHealth(PRIMARY_PORT);

  const unauthorized = await fetch(`http://127.0.0.1:${PRIMARY_PORT}/health`);
  assert(unauthorized.status === 401, 'service should reject a request without the token');

  const watch = await call(PRIMARY_PORT, '/watch', {
    method: 'POST',
    body: JSON.stringify({ sessionId: SESSION }),
  });
  assert(watch.status === 200, 'watch should be accepted without an origin');

  const live = await waitForLive(PRIMARY_PORT);
  assert(live, 'service should connect to the event stream');
  assert(
    requested.every((entry) => entry.path === '/api/event'),
    `service must use the host's OpenCode stream, saw ${requested.map((entry) => entry.path).join(', ')}`,
  );
  assert(
    requested.every((entry) => entry.authorization === `Bearer ${TOKEN}`),
    'the host OpenCode access should receive the service token as its bearer',
  );

  emit('session.execution.started', { sessionID: SESSION });

  // Step 1 in the order a real stream sends it: reasoning arrives in one piece
  // when the part ends, and tool input arrives with no fragments at all. Both
  // are generated tokens, so the step's whole stream counts as generation.
  emit('session.step.started', { sessionID: SESSION, assistantMessageID: 'msg_1' });
  emit('session.reasoning.started', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0 });
  // Ignored: another session.
  emit('session.text.delta', { sessionID: 'ses_other', assistantMessageID: 'msg_x', ordinal: 0, delta: 'y'.repeat(500) });
  await wait(300);
  emit('session.reasoning.delta', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, delta: 'r'.repeat(200) });
  emit('session.reasoning.ended', { sessionID: SESSION, assistantMessageID: 'msg_1', ordinal: 0, text: 'r'.repeat(200) });
  emit('session.tool.input.started', { sessionID: SESSION, assistantMessageID: 'msg_1', id: 'call_1', name: 'bash' });
  await wait(400);
  emit('session.tool.input.ended', { sessionID: SESSION, assistantMessageID: 'msg_1', id: 'call_1', text: 'z'.repeat(300) });
  emit('session.step.streamed', { sessionID: SESSION, assistantMessageID: 'msg_1' });

  await wait(100);
  const rate = await call(PRIMARY_PORT, '/rate');
  assert(rate.status === 200, 'rate should answer');
  assert(rate.body.sessionId === SESSION, 'rate should report the watched session');
  assert(rate.body.chars === 500, `expected reasoning and tool input to count, 500 characters, got ${rate.body.chars}`);
  assert(Math.abs(rate.body.charsPerSecond - 100) < 1, `expected ~100 chars/s, got ${rate.body.charsPerSecond}`);
  assert(rate.body.tokensPerSecond > 0, 'tokens per second should be positive');
  assert(rate.body.busy === true, 'busy should follow session.execution.started');
  assert(rate.body.eventsSeen > 0, 'the stream counter should grow');
  assert(typeof rate.body.lastEventType === 'string', 'the last event type should be reported');
  assert(rate.body.waiting === null, 'no wait should be reported while generating');
  assert(rate.body.sessionUsage === null, 'session totals should be empty before the first settled step');

  // The tool runs and asks for permission. OpenCode keeps the session busy
  // while it waits; the wait falls outside every step's stream.
  emit('session.tool.called', { sessionID: SESSION, assistantMessageID: 'msg_1', id: 'call_1' });
  emit('permission.asked', { id: 'per_1', sessionID: SESSION, action: 'bash' });
  await wait(50);
  assert((await call(PRIMARY_PORT, '/rate')).body.waiting === 'permission', 'a pending permission should be reported');
  await wait(350);
  emit('permission.replied', { sessionID: SESSION, requestID: 'per_1', reply: 'once' });
  emit('session.tool.success', { sessionID: SESSION, assistantMessageID: 'msg_1', id: 'call_1' });

  // The step settles after its tool ran, with the provider's real token
  // counts, which recalibrate chars-per-token.
  emit('session.step.ended', {
    sessionID: SESSION,
    assistantMessageID: 'msg_1',
    finish: 'tool-calls',
    cost: 0.01,
    tokens: { input: 900, output: 120, reasoning: 40, cache: { read: 0, write: 0 } },
  });
  await wait(100);
  const calibrated = await call(PRIMARY_PORT, '/rate');
  assert(calibrated.body.charsPerToken > 0.25, `expected calibration above the default, got ${calibrated.body.charsPerToken}`);

  // The question tool arrives as a form on OpenCode 2.
  emit('form.created', { form: { id: 'frm_1', sessionID: SESSION, title: 'Pick one' } });
  await wait(50);
  assert((await call(PRIMARY_PORT, '/rate')).body.waiting === 'question', 'a pending form should be reported');
  emit('form.replied', { id: 'frm_1', sessionID: SESSION, answer: {} });
  await wait(50);
  assert((await call(PRIMARY_PORT, '/rate')).body.waiting === null, 'a resolved form should clear the wait');

  // Step 2: the reply streams as text fragments.
  emit('session.step.started', { sessionID: SESSION, assistantMessageID: 'msg_2' });
  emit('session.text.started', { sessionID: SESSION, assistantMessageID: 'msg_2', ordinal: 0 });
  for (let index = 0; index < 10; index += 1) {
    emit('session.text.delta', { sessionID: SESSION, assistantMessageID: 'msg_2', ordinal: 0, delta: 'x'.repeat(40) });
    await wait(50);
  }
  emit('session.text.ended', { sessionID: SESSION, assistantMessageID: 'msg_2', ordinal: 0, text: 'x'.repeat(400) });
  emit('session.step.streamed', { sessionID: SESSION, assistantMessageID: 'msg_2' });
  emit('session.step.ended', {
    sessionID: SESSION,
    assistantMessageID: 'msg_2',
    finish: 'stop',
    cost: 0.01,
    tokens: { input: 950, output: 100, reasoning: 0, cache: { read: 0, write: 0 } },
  });

  // Session-cumulative usage is reported as-is, so the panel can show real
  // session totals next to the estimate.
  emit('session.usage.updated', {
    sessionID: SESSION,
    cost: 0.02,
    tokens: { input: 1000, output: 200, reasoning: 60, cache: { read: 0, write: 0 } },
  });
  await wait(100);
  const usage = await call(PRIMARY_PORT, '/rate');
  assert(usage.body.sessionUsage?.generated === 260, `expected 260 generated session tokens, got ${usage.body.sessionUsage?.generated}`);
  assert(usage.body.sessionUsage?.cost === 0.02, `expected the session cost, got ${usage.body.sessionUsage?.cost}`);

  emit('session.execution.succeeded', { sessionID: SESSION });
  await wait(100);
  const idle = await call(PRIMARY_PORT, '/rate');
  assert(idle.body.busy === false, 'busy should clear on session.execution.succeeded');
  assert(idle.body.waiting === null, 'a resolved permission should clear the wait');

  const turn = idle.body.lastTurn;
  assert(turn, 'a finished turn should be reported');
  assert(turn.source === 'tokens', `expected real token counts, got ${turn.source}`);
  assert(turn.tokens === 260, `expected 260 turn tokens, got ${turn.tokens}`);
  assert(turn.chars === 900, `expected 900 counted characters, got ${turn.chars}`);
  // Step 1 streams for ~700 ms without a single gap between fragments, and
  // step 2 for ~500 ms. Both count.
  assert(turn.activeMs >= 1_000, `expected both steps' streams as generation time, got ${turn.activeMs} ms`);
  assert(turn.wallMs > turn.activeMs, 'the tool run and the waits should make wall time exceed generation time');
  assert(turn.pausedMs >= 450, `expected the tool run and the waits to be excluded, paused ${turn.pausedMs} ms`);
  assert(
    turn.tokensPerSecond > turn.tokens / (turn.wallMs / 1000),
    'the average should divide by generation time only',
  );
  assert(turn.endedAt > 0, 'turn should be stamped');

  // Fallback path: a service that attached after the deltas went by still
  // counts characters from the full-value `*ended` boundary.
  const secondSession = 'ses_fallback';
  await call(PRIMARY_PORT, '/watch', {
    method: 'POST',
    body: JSON.stringify({ sessionId: secondSession }),
  });
  const switched = await call(PRIMARY_PORT, '/rate');
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
  const interrupted = await call(PRIMARY_PORT, '/rate');
  assert(interrupted.body.busy === true, 'a shutdown interruption should keep the session busy');
  assert(interrupted.body.chars === 400, `expected 400 characters from the full-value boundary, got ${interrupted.body.chars}`);

  emit('session.execution.succeeded', { sessionID: secondSession });
  await wait(100);
  const fallback = await call(PRIMARY_PORT, '/rate');
  assert(fallback.body.busy === false, 'busy should clear after the resumed turn ends');
  assert(fallback.body.chars === 400, `expected 400 characters from the full-value boundary, got ${fallback.body.chars}`);
  assert(fallback.body.lastTurn === null, 'a turn seen only through finished parts has no timing to report');

  // A host with no OpenCode access falls back to the OpenChamber proxy origin.
  primary.kill();
  await wait(200);
  startService(FALLBACK_PORT);
  await waitForHealth(FALLBACK_PORT);
  const fallbackWatch = await call(FALLBACK_PORT, '/watch', {
    method: 'POST',
    body: JSON.stringify({ origin: `http://127.0.0.1:${MOCK_PORT}`, sessionId: FALLBACK_SESSION }),
  });
  assert(fallbackWatch.status === 200, 'the fallback watch should accept an origin');
  const fallbackLive = await waitForLive(FALLBACK_PORT);
  assert(fallbackLive, 'the fallback service should connect through /api/global/event');
  emit('session.execution.started', { sessionID: FALLBACK_SESSION });
  emit('session.text.delta', { sessionID: FALLBACK_SESSION, assistantMessageID: 'msg_f', ordinal: 0, delta: 'f'.repeat(120) });
  await wait(100);
  const fallbackRate = await call(FALLBACK_PORT, '/rate');
  assert(fallbackRate.body.chars === 120, `the fallback stream should count characters, got ${fallbackRate.body.chars}`);
  assert(
    requested.some((entry) => entry.path === '/api/global/event'),
    'the fallback service should use /api/global/event',
  );

  // With no URL and no origin there is nothing to read; the service says so
  // instead of retrying forever.
  startService(BLOCKED_PORT);
  await waitForHealth(BLOCKED_PORT);
  await call(BLOCKED_PORT, '/watch', {
    method: 'POST',
    body: JSON.stringify({ sessionId: SESSION }),
  });
  let blocked = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await wait(50);
    const rateAnswer = await call(BLOCKED_PORT, '/rate');
    if (rateAnswer.body.connection === 'blocked') {
      blocked = rateAnswer.body;
      break;
    }
  }
  assert(blocked, 'a service with no event source should report the blocked state');
  assert(typeof blocked.error === 'string' && blocked.error.length > 0, 'the blocked state should explain itself');

  console.log('turn:', JSON.stringify(turn));
  console.log('usage:', JSON.stringify(usage.body.sessionUsage));
  console.log('fallback:', JSON.stringify(fallback.body));
  console.log('smoke: ok');
} finally {
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
  mock.close();
}
