// Smoke test for the TPS Meter service.
//
// Starts a mock OpenChamber event stream and the built service, feeds it
// synthetic deltas, and checks the rolling rate. Run with `bun scripts/smoke.mjs`
// or `node scripts/smoke.mjs` from the extension folder.
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
  res.write('data: {"payload":{"type":"server.connected","properties":{}},"directory":"/repo","eventId":"evt_0"}\n\n');
  streamClients.add(res);
  req.on('close', () => streamClients.delete(res));
});

// The real global stream wraps every event; the service must unwrap `payload`.
const emit = (event) => {
  const payload = `data: ${JSON.stringify({ payload: event, directory: '/repo', eventId: `evt_${Date.now()}` })}\n\n`;
  for (const client of streamClients) client.write(payload);
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

  emit({ type: 'session.status', properties: { sessionID: SESSION, status: { type: 'busy' } } });

  // 400 counted characters over ~0.5 s inside the watched session.
  for (let index = 0; index < 10; index += 1) {
    emit({
      type: 'message.part.delta',
      properties: { sessionID: SESSION, messageID: 'msg_1', partID: 'prt_1', field: 'text', delta: 'x'.repeat(40) },
    });
    // Ignored: another session, and a non-text field.
    emit({
      type: 'message.part.delta',
      properties: { sessionID: 'ses_other', messageID: 'msg_1', partID: 'prt_1', field: 'text', delta: 'y'.repeat(500) },
    });
    emit({
      type: 'message.part.delta',
      properties: { sessionID: SESSION, messageID: 'msg_1', partID: 'prt_tool', field: 'input', delta: 'z'.repeat(500) },
    });
    await wait(50);
  }

  await wait(200);
  const rate = await call('/rate');
  assert(rate.status === 200, 'rate should answer');
  assert(rate.body.sessionId === SESSION, 'rate should report the watched session');
  assert(rate.body.chars === 400, `expected 400 counted characters, got ${rate.body.chars}`);
  assert(Math.abs(rate.body.charsPerSecond - 80) < 1, `expected ~80 chars/s, got ${rate.body.charsPerSecond}`);
  assert(rate.body.tokensPerSecond > 0, 'tokens per second should be positive');
  assert(rate.body.busy === true, 'busy should follow session.status');
  assert(rate.body.eventsSeen > 0, 'the stream counter should grow');
  assert(typeof rate.body.lastEventType === 'string', 'the last event type should be reported');

  // A completed turn recalibrates chars-per-token from real token counts.
  emit({
    type: 'message.updated',
    properties: {
      sessionID: SESSION,
      info: { id: 'msg_1', role: 'assistant', tokens: { output: 120, reasoning: 40 }, time: { created: Date.now(), completed: Date.now() } },
    },
  });
  await wait(100);
  const calibrated = await call('/rate');
  assert(calibrated.body.charsPerToken > 0.25, `expected calibration above the default, got ${calibrated.body.charsPerToken}`);

  emit({ type: 'session.idle', properties: { sessionID: SESSION } });
  await wait(100);
  const idle = await call('/rate');
  assert(idle.body.busy === false, 'busy should clear on session.idle');

  const turn = idle.body.lastTurn;
  assert(turn, 'a finished turn should be reported');
  assert(turn.source === 'tokens', `expected real token counts, got ${turn.source}`);
  assert(turn.tokens === 160, `expected 160 turn tokens, got ${turn.tokens}`);
  assert(turn.durationMs > 0, 'turn duration should be positive');
  assert(turn.tokensPerSecond > 0, 'turn average should be positive');
  assert(turn.endedAt > 0, 'turn should be stamped');

  // Fallback path: a server that only sends growing `message.part.updated`
  // snapshots must still count characters.
  const secondSession = 'ses_fallback';
  await call('/watch', {
    method: 'POST',
    body: JSON.stringify({ origin: `http://127.0.0.1:${MOCK_PORT}`, sessionId: secondSession }),
  });
  assert((await call('/rate')).body.lastTurn === null, 'watching a new session should clear the last turn');
  await wait(300);
  emit({ type: 'message.part.updated', properties: { sessionID: secondSession, part: { id: 'prt_2', messageID: 'msg_2', type: 'text', text: 'a'.repeat(100) } } });
  await wait(50);
  emit({ type: 'message.part.updated', properties: { sessionID: secondSession, part: { id: 'prt_2', messageID: 'msg_2', type: 'text', text: 'a'.repeat(250) } } });
  await wait(200);
  const fallback = await call('/rate');
  assert(fallback.body.chars === 250, `expected 250 characters from part snapshots, got ${fallback.body.chars}`);

  console.log('smoke: ok');
  console.log(JSON.stringify(fallback.body, null, 2));
} finally {
  child.kill();
  mock.close();
}
