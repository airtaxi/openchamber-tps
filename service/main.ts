// OpenChamber TPS Meter service.
//
// Runs as the extension's local process (manifest `contributes.service`) on
// 127.0.0.1, reachable only through the host proxy. It subscribes to the
// OpenChamber event stream (`GET /api/global/event`, the same SSE the UI reads)
// and derives a rolling generation rate for one session.
//
// The stream carries the OpenCode 2 wire events: `session.text.delta` and
// `session.reasoning.delta` fragments, per-step token settlements
// (`session.step.ended`), session-cumulative usage (`session.usage.updated`),
// and execution status (`session.execution.*`). The 1.x vocabulary
// (`message.part.delta`, `message.updated`, `session.status`) is not on this
// stream anymore.
//
// The panel hands it the OpenChamber origin and the session to watch, then
// polls `GET /rate`. The service never reaches the browser and the panel never
// dials this process directly.
import http from 'node:http';

const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
const token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? '';
if (!Number.isInteger(port) || port <= 0 || !token) {
  console.error('OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required');
  process.exit(1);
}

/** Rolling measurement window. The rate is always "the last five seconds". */
const WINDOW_MS = 5_000;
/** Hard cap on retained delta samples; ~5 seconds of chunks fits far below this. */
const SAMPLE_LIMIT = 20_000;
const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 15_000;

// Character-to-token ratios vary by model, language, and content. The default
// approximates English text; completed steps recalibrate it from real token
// counts. The clamp keeps a single odd step from skewing the meter.
const DEFAULT_CHARS_PER_TOKEN = 0.25;
const MIN_CHARS_PER_TOKEN = 0.05;
const MAX_CHARS_PER_TOKEN = 1;
const CALIBRATION_WEIGHT = 0.3;
/** Ignore tiny settled steps when calibrating; they carry no signal. */
const MIN_CALIBRATION_CHARS = 40;
/**
 * A gap between streamed characters longer than this is a pause, not
 * generation: tool execution, a retry, or the agent waiting for the user. That
 * time is excluded from the turn's average. Streamed chunks normally arrive in
 * tens of milliseconds, so the separation is wide.
 */
const MAX_STREAM_GAP_MS = 1_000;

type ConnectionState = 'idle' | 'connecting' | 'live' | 'error';

type Sample = { at: number; chars: number };

type WatchConfig = {
  origin: string;
  sessionId: string | null;
};

/** The finished turn's average rate, shown after the session goes idle. */
type TurnResult = {
  /** Average tokens per second over the turn's generation time. */
  tokensPerSecond: number;
  /** `tokens` when a settled step reported real counts, otherwise a character estimate. */
  source: 'tokens' | 'estimate';
  tokens: number;
  chars: number;
  /** Time actually spent generating: gaps between streamed characters, pauses excluded. */
  activeMs: number;
  /** First character to last character, pauses included. */
  wallMs: number;
  /** `wallMs - activeMs`: tool calls, retries, and waits for the user. */
  pausedMs: number;
  endedAt: number;
};

/** Running session totals from `session.usage.updated`, the only real counters OpenCode 2 publishes live. */
type SessionUsage = {
  cost: number;
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  /** `output + reasoning`: tokens the model actually generated. */
  generated: number;
};

type WaitingKind = 'permission' | 'question';

const samples: Sample[] = [];
/** Characters seen per part id, used to diff `session.text.ended` / `session.reasoning.ended` snapshots. */
const partChars = new Map<string, number>();
/** Parts already counted through streaming deltas, never diffed again. */
const deltaParts = new Set<string>();
/** Characters seen per assistant message id, used to calibrate tokens per character. */
const messageChars = new Map<string, number>();
/** Last token total reported per settled step (`assistantMessageID`), so retries settle once. */
const stepTokens = new Map<string, number>();

let watch: WatchConfig | null = null;
let connection: ConnectionState = 'idle';
let lastError: string | null = null;
let lastEventAt = 0;
/** Every parsed event on the stream, watched session or not, for diagnosis. */
let eventsSeen = 0;
let lastEventType: string | null = null;
let busy = false;
let charsPerToken = DEFAULT_CHARS_PER_TOKEN;
let sessionUsage: SessionUsage | null = null;
let controller: AbortController | null = null;
let retryTimer: NodeJS.Timeout | null = null;
let retryDelay = RETRY_BASE_MS;

// The turn in progress. A turn spans `session.execution.started` until
// `session.execution.succeeded` / `failed` (or `session.idle` on a 1.x-shaped
// stream). Its average divides tokens by generation time only: pauses between
// streamed characters, whether a tool call or a wait for the user, are
// excluded.
let turnStartedAt: number | null = null;
let turnLastCharAt: number | null = null;
let turnBusyAt: number | null = null;
let turnChars = 0;
let turnTokens = 0;
let turnActiveMs = 0;
let turnSawTokens = false;
let lastTurn: TurnResult | null = null;
// Pending permission and question requests for the watched session. OpenCode
// keeps the session `busy` while an agent waits for the user; these sets are
// what distinguishes generation from waiting.
const pendingPermissions = new Set<string>();
const pendingQuestions = new Set<string>();

const waitingKind = (): WaitingKind | null => (
  pendingPermissions.size > 0 ? 'permission' : pendingQuestions.size > 0 ? 'question' : null
);

const clearTurn = (): void => {
  turnStartedAt = null;
  turnLastCharAt = null;
  turnBusyAt = null;
  turnChars = 0;
  turnTokens = 0;
  turnActiveMs = 0;
  turnSawTokens = false;
};

const resetMeasurement = (): void => {
  samples.length = 0;
  partChars.clear();
  deltaParts.clear();
  messageChars.clear();
  stepTokens.clear();
  lastEventAt = 0;
  busy = false;
  sessionUsage = null;
  clearTurn();
  pendingPermissions.clear();
  pendingQuestions.clear();
  lastTurn = null;
};

const finalizeTurn = (now: number): void => {
  if (turnStartedAt === null || turnLastCharAt === null || turnChars === 0) {
    clearTurn();
    return;
  }
  const wallMs = Math.max(1, turnLastCharAt - turnStartedAt);
  // A single streamed chunk gives no gap to measure; bound the fallback by the
  // widest gap still treated as generation.
  const activeMs = turnActiveMs > 0 ? Math.round(turnActiveMs) : Math.min(wallMs, MAX_STREAM_GAP_MS);
  const source: TurnResult['source'] = turnSawTokens ? 'tokens' : 'estimate';
  const tokens = source === 'tokens' ? turnTokens : turnChars * charsPerToken;
  lastTurn = {
    tokensPerSecond: tokens / (activeMs / 1000),
    source,
    tokens,
    chars: turnChars,
    activeMs,
    wallMs,
    pausedMs: Math.max(0, wallMs - activeMs),
    endedAt: now,
  };
  clearTurn();
};

const pruneSamples = (now: number): void => {
  let expired = 0;
  while (expired < samples.length && now - samples[expired].at > WINDOW_MS) {
    expired += 1;
  }
  if (expired > 0) samples.splice(0, expired);
};

const recordChars = (messageID: string, partID: string, chars: number, now: number): void => {
  if (chars <= 0) return;
  samples.push({ at: now, chars });
  if (samples.length > SAMPLE_LIMIT) samples.splice(0, samples.length - SAMPLE_LIMIT);
  partChars.set(partID, (partChars.get(partID) ?? 0) + chars);
  messageChars.set(messageID, (messageChars.get(messageID) ?? 0) + chars);
  lastEventAt = now;

  if (turnStartedAt === null) {
    turnStartedAt = now;
    // Time to the first character counts only when it looks like generation
    // rather than a pause before the model call.
    if (turnBusyAt !== null && now - turnBusyAt <= MAX_STREAM_GAP_MS) {
      turnActiveMs += now - turnBusyAt;
    }
  } else if (turnLastCharAt !== null && waitingKind() === null) {
    // Streaming gap, so it is generation time. A wait for the user is never
    // generation even when the user answers within the gap threshold.
    const gap = now - turnLastCharAt;
    if (gap <= MAX_STREAM_GAP_MS) turnActiveMs += gap;
  }

  turnLastCharAt = now;
  turnChars += chars;
};

const isWatchedSession = (sessionID: unknown): boolean => (
  typeof sessionID === 'string' && watch !== null && watch.sessionId !== null && sessionID === watch.sessionId
);

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const readNumber = (value: unknown): number => (
  typeof value === 'number' && Number.isFinite(value) ? value : 0
);

const readRecord = (value: unknown): Record<string, unknown> | null => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
);

/** Stable part identity for OpenCode 2 text and reasoning fragments. */
const fragmentPartID = (messageID: string, kind: 'text' | 'reasoning', ordinal: unknown): string => {
  if (!messageID) return '';
  const index = typeof ordinal === 'number' && Number.isInteger(ordinal) && ordinal >= 0 ? ordinal : 0;
  return `${messageID}:${kind}:${index}`;
};

const calibrate = (messageID: string, output: number, reasoning: number): void => {
  const chars = messageChars.get(messageID) ?? 0;
  if (chars < MIN_CALIBRATION_CHARS) return;
  const generated = output + reasoning;
  if (!Number.isFinite(generated) || generated <= 0) return;
  const ratio = Math.min(MAX_CHARS_PER_TOKEN, Math.max(MIN_CHARS_PER_TOKEN, generated / chars));
  charsPerToken = charsPerToken + (ratio - charsPerToken) * CALIBRATION_WEIGHT;
};

/**
 * Folds a settled step's real token counts into the calibration ratio and,
 * while a turn is running, into the turn's token total. The total adjusts by
 * the difference for the message id, so a retry of the same step reports its
 * final counts exactly once.
 */
const recordTokens = (messageID: string, output: number, reasoning: number): void => {
  const generated = output + reasoning;
  if (!messageID || generated <= 0) return;
  calibrate(messageID, output, reasoning);
  const previous = stepTokens.get(messageID) ?? 0;
  stepTokens.set(messageID, generated);
  if (turnStartedAt === null) return;
  turnTokens += generated - previous;
  if (generated > previous) turnSawTokens = true;
};

type RawEvent = { type?: unknown; data?: unknown; properties?: unknown };

const handleEvent = (event: RawEvent, now: number): void => {
  const type = readString(event.type);
  if (!type) return;
  // OpenCode 2 carries fields in `data`; the 1.x shapes used `properties`.
  const payload = readRecord(event.data) ?? readRecord(event.properties);
  if (!payload) return;

  // --- streamed output (OpenCode 2) ---------------------------------------

  if (type === 'session.text.delta' || type === 'session.reasoning.delta') {
    if (!isWatchedSession(payload.sessionID)) return;
    const messageID = readString(payload.assistantMessageID);
    const delta = readString(payload.delta);
    const kind = type === 'session.reasoning.delta' ? 'reasoning' : 'text';
    const partID = fragmentPartID(messageID, kind, payload.ordinal);
    if (!partID || delta.length === 0) return;
    deltaParts.add(partID);
    recordChars(messageID, partID, delta.length, now);
    return;
  }

  // The replayable full-value boundary of a fragment. It stands in for a
  // service that attached after the deltas went by; a part counted through
  // deltas is never diffed again.
  if (type === 'session.text.ended' || type === 'session.reasoning.ended') {
    if (!isWatchedSession(payload.sessionID)) return;
    const messageID = readString(payload.assistantMessageID);
    const kind = type === 'session.reasoning.ended' ? 'reasoning' : 'text';
    const partID = fragmentPartID(messageID, kind, payload.ordinal);
    if (!partID) return;
    if (deltaParts.has(partID)) return;
    const text = readString(payload.text);
    const previous = partChars.get(partID) ?? 0;
    if (text.length <= previous) return;
    recordChars(messageID, partID, text.length - previous, now);
    return;
  }

  // `session.tool.input.delta` and the other tool events are not generation.

  // --- real token counts (OpenCode 2) -------------------------------------

  if (type === 'session.step.ended' || type === 'session.step.failed') {
    if (!isWatchedSession(payload.sessionID)) return;
    const tokens = readRecord(payload.tokens);
    if (!tokens) return;
    recordTokens(
      readString(payload.assistantMessageID),
      readNumber(tokens.output),
      readNumber(tokens.reasoning),
    );
    return;
  }

  if (type === 'session.usage.updated') {
    if (!isWatchedSession(payload.sessionID)) return;
    const tokens = readRecord(payload.tokens);
    if (!tokens) return;
    const cache = readRecord(tokens.cache);
    const output = readNumber(tokens.output);
    const reasoning = readNumber(tokens.reasoning);
    sessionUsage = {
      cost: readNumber(payload.cost),
      input: readNumber(tokens.input),
      output,
      reasoning,
      cacheRead: readNumber(cache?.read),
      cacheWrite: readNumber(cache?.write),
      generated: output + reasoning,
    };
    lastEventAt = now;
    return;
  }

  // --- live status (OpenCode 2) -------------------------------------------

  if (type === 'session.execution.started') {
    if (!isWatchedSession(payload.sessionID)) return;
    // Mark where the turn began so time to first token can be judged.
    if (turnStartedAt === null) turnBusyAt = now;
    busy = true;
    lastEventAt = now;
    return;
  }

  if (type === 'session.execution.succeeded' || type === 'session.execution.failed') {
    if (!isWatchedSession(payload.sessionID)) return;
    busy = false;
    lastEventAt = now;
    finalizeTurn(now);
    return;
  }

  if (type === 'session.execution.interrupted') {
    if (!isWatchedSession(payload.sessionID)) return;
    lastEventAt = now;
    // A shutdown is not the end of the turn: OpenCode keeps the execution
    // claim and resumes the same turn after restart, so the session stays busy
    // until the real terminal outcome arrives.
    if (readString(payload.reason) === 'shutdown') return;
    busy = false;
    finalizeTurn(now);
    return;
  }

  // --- requests to the user -----------------------------------------------

  if (type === 'permission.asked' || type === 'permission.v2.asked') {
    if (!isWatchedSession(payload.sessionID)) return;
    const requestId = readString(payload.id);
    if (requestId) pendingPermissions.add(requestId);
    lastEventAt = now;
    return;
  }

  if (type === 'permission.replied' || type === 'permission.v2.replied') {
    if (!isWatchedSession(payload.sessionID)) return;
    const requestId = readString(payload.requestID);
    if (requestId) pendingPermissions.delete(requestId);
    lastEventAt = now;
    return;
  }

  // OpenCode 2 models the question tool as a form.
  if (type === 'form.created') {
    const form = readRecord(payload.form);
    if (!form || !isWatchedSession(form.sessionID)) return;
    const requestId = readString(form.id);
    if (requestId) pendingQuestions.add(requestId);
    lastEventAt = now;
    return;
  }

  if (type === 'form.replied' || type === 'form.cancelled') {
    if (!isWatchedSession(payload.sessionID)) return;
    const requestId = readString(payload.id);
    if (requestId) pendingQuestions.delete(requestId);
    lastEventAt = now;
    return;
  }

  if (type === 'question.asked' || type === 'question.v2.asked') {
    if (!isWatchedSession(payload.sessionID)) return;
    const requestId = readString(payload.id);
    if (requestId) pendingQuestions.add(requestId);
    lastEventAt = now;
    return;
  }

  if (type === 'question.replied' || type === 'question.rejected' || type === 'question.v2.replied' || type === 'question.v2.rejected') {
    if (!isWatchedSession(payload.sessionID)) return;
    const requestId = readString(payload.requestID);
    if (requestId) pendingQuestions.delete(requestId);
    lastEventAt = now;
    return;
  }

  // OpenCode 2 declares `session.status` and `session.idle` but its own status
  // comes from the execution events above; a server that still emits them is
  // handled here for completeness.
  if (type === 'session.status') {
    if (!isWatchedSession(payload.sessionID)) return;
    const status = readRecord(payload.status);
    const nextBusy = status?.type === 'busy' || status?.type === 'retry';
    if (busy && !nextBusy) finalizeTurn(now);
    if (nextBusy && turnStartedAt === null) turnBusyAt = now;
    busy = nextBusy;
    lastEventAt = now;
    return;
  }

  if (type === 'session.idle') {
    if (!isWatchedSession(payload.sessionID)) return;
    busy = false;
    lastEventAt = now;
    finalizeTurn(now);
  }
};

const handleSseChunk = (chunk: string): void => {
  const data: string[] = [];
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data:')) continue;
    data.push(line.slice(5).trimStart());
  }
  if (data.length === 0) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(data.join('\n'));
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== 'object') return;
  // OpenCode 2 frames are the event itself; a proxy that wraps them as
  // `{ payload, directory, eventId }` is unwrapped here.
  const envelope = parsed as { payload?: unknown };
  const event = (envelope.payload && typeof envelope.payload === 'object' ? envelope.payload : parsed) as RawEvent;
  eventsSeen += 1;
  lastEventType = readString(event.type) || null;
  handleEvent(event, Date.now());
};

const scheduleReconnect = (message: string): void => {
  lastError = message;
  connection = 'error';
  if (!watch || retryTimer) return;
  const delay = retryDelay;
  retryDelay = Math.min(RETRY_MAX_MS, retryDelay * 2);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void startStream();
  }, delay);
};

const startStream = async (): Promise<void> => {
  const current = watch;
  if (!current) return;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  controller?.abort();
  const local = new AbortController();
  controller = local;
  connection = 'connecting';
  lastError = null;

  try {
    // The global stream is not directory scoped. `/api/event` silently carries
    // only the server's default directory, which is why an open project would
    // never see its own session events there.
    const response = await fetch(new URL('/api/global/event', current.origin), {
      headers: { Accept: 'text/event-stream' },
      signal: local.signal,
    });
    if (!response.ok || !response.body) {
      scheduleReconnect(`Event stream answered HTTP ${response.status}`);
      return;
    }
    connection = 'live';
    retryDelay = RETRY_BASE_MS;
    lastEventAt = Date.now();
    eventsSeen = 0;
    lastEventType = null;

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = '';
    while (!local.signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        handleSseChunk(chunk);
        boundary = buffer.indexOf('\n\n');
      }
    }
    if (!local.signal.aborted) scheduleReconnect('Event stream closed');
  } catch (error) {
    if (local.signal.aborted) return;
    scheduleReconnect(error instanceof Error ? error.message : String(error));
  }
};

const stopStream = (): void => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  controller?.abort();
  controller = null;
  connection = 'idle';
};

const computeRate = (now: number) => {
  pruneSamples(now);
  let chars = 0;
  for (const sample of samples) chars += sample.chars;
  const charsPerSecond = chars / (WINDOW_MS / 1000);
  return {
    chars,
    charsPerSecond,
    tokensPerSecond: charsPerSecond * charsPerToken,
  };
};

const isHttpOrigin = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:')
      && parsed.username === ''
      && parsed.password === '';
  } catch {
    return false;
  }
};

const applyWatch = (next: WatchConfig): boolean => {
  const changed = watch === null
    || watch.origin !== next.origin
    || watch.sessionId !== next.sessionId;
  watch = next;
  if (!changed) return false;
  resetMeasurement();
  retryDelay = RETRY_BASE_MS;
  stopStream();
  void startStream();
  return true;
};

const json = (res: http.ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
};

const readJsonBody = (req: http.IncomingMessage): Promise<unknown> => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk: Buffer) => {
    body += chunk;
    if (body.length > 64_000) {
      reject(new Error('Request body too large'));
      req.destroy();
    }
  });
  req.on('end', () => {
    if (!body.trim()) {
      resolve(null);
      return;
    }
    try {
      resolve(JSON.parse(body));
    } catch {
      reject(new Error('Request body is not valid JSON'));
    }
  });
  req.on('error', reject);
});

const server = http.createServer((req, res) => {
  if (req.headers.authorization !== `Bearer ${token}`) {
    json(res, 401, { error: 'unauthorized' });
    return;
  }

  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (url.pathname === '/health') {
    json(res, 200, { ok: true, pid: process.pid });
    return;
  }

  if (url.pathname === '/watch' && req.method === 'POST') {
    void readJsonBody(req).then((raw) => {
      const body = (raw && typeof raw === 'object' ? raw : {}) as { origin?: unknown; sessionId?: unknown };
      const origin = readString(body.origin);
      if (!isHttpOrigin(origin)) {
        json(res, 400, { error: 'origin must be an http(s) origin from the OpenChamber server' });
        return;
      }
      const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim() ? body.sessionId : null;
      const changed = applyWatch({ origin, sessionId });
      json(res, 200, { ok: true, changed, connection, sessionId });
    }).catch((error: unknown) => {
      json(res, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    });
    return;
  }

  if (url.pathname === '/rate') {
    const now = Date.now();
    const rate = computeRate(now);
    json(res, 200, {
      connection,
      error: lastError,
      sessionId: watch?.sessionId ?? null,
      busy,
      active: now - lastEventAt < 2_000,
      lastEventAt: lastEventAt || null,
      windowMs: WINDOW_MS,
      chars: rate.chars,
      charsPerSecond: rate.charsPerSecond,
      tokensPerSecond: rate.tokensPerSecond,
      charsPerToken,
      sessionUsage,
      lastTurn,
      eventsSeen,
      lastEventType,
      waiting: waitingKind(),
    });
    return;
  }

  json(res, 404, { error: 'not-found' });
});

server.listen(port, '127.0.0.1');

const shutdown = (): void => {
  stopStream();
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
