// OpenChamber TPS Meter service.
//
// Runs as the extension's local process (manifest `contributes.service`) on
// 127.0.0.1, reachable only through the host proxy. It subscribes to the
// OpenChamber event stream (`GET /api/event`, the same SSE the UI reads) and
// derives a rolling generation rate for one session.
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
// approximates English text; completed turns recalibrate it from real token
// counts. The clamp keeps a single odd turn from skewing the meter.
const DEFAULT_CHARS_PER_TOKEN = 0.25;
const MIN_CHARS_PER_TOKEN = 0.05;
const MAX_CHARS_PER_TOKEN = 1;
const CALIBRATION_WEIGHT = 0.3;
/** Ignore tiny completed turns when calibrating; they carry no signal. */
const MIN_CALIBRATION_CHARS = 40;

type ConnectionState = 'idle' | 'connecting' | 'live' | 'error';

type Sample = { at: number; chars: number };

type WatchConfig = {
  origin: string;
  sessionId: string | null;
};

/** The finished turn's average rate, shown after the session goes idle. */
type TurnResult = {
  /** Average tokens per second over the turn's generation span. */
  tokensPerSecond: number;
  /** `tokens` when completed message counts existed, otherwise a character estimate. */
  source: 'tokens' | 'estimate';
  tokens: number;
  chars: number;
  durationMs: number;
  endedAt: number;
};

const samples: Sample[] = [];
/** Characters seen per part id, used to diff `message.part.updated` snapshots. */
const partChars = new Map<string, number>();
/** Parts already counted through `message.part.delta`, never diffed again. */
const deltaParts = new Set<string>();
/** Characters seen per message id, used to calibrate tokens per character. */
const messageChars = new Map<string, number>();

let watch: WatchConfig | null = null;
let connection: ConnectionState = 'idle';
let lastError: string | null = null;
let lastEventAt = 0;
/** Every parsed event on the stream, watched session or not, for diagnosis. */
let eventsSeen = 0;
let lastEventType: string | null = null;
let busy = false;
let charsPerToken = DEFAULT_CHARS_PER_TOKEN;
let controller: AbortController | null = null;
let retryTimer: NodeJS.Timeout | null = null;
let retryDelay = RETRY_BASE_MS;

// The turn in progress. A turn spans the first streamed character after idle
// until `session.idle`, so its average describes generation, not tool waits
// before the first token or after the last one.
let turnStartedAt: number | null = null;
let turnLastCharAt: number | null = null;
let turnChars = 0;
let turnTokens = 0;
const turnTokenMessages = new Set<string>();
let lastTurn: TurnResult | null = null;

const resetMeasurement = (): void => {
  samples.length = 0;
  partChars.clear();
  deltaParts.clear();
  messageChars.clear();
  lastEventAt = 0;
  busy = false;
  turnStartedAt = null;
  turnLastCharAt = null;
  turnChars = 0;
  turnTokens = 0;
  turnTokenMessages.clear();
  lastTurn = null;
};

const finalizeTurn = (now: number): void => {
  if (turnStartedAt === null || turnLastCharAt === null || turnChars === 0) {
    turnStartedAt = null;
    turnLastCharAt = null;
    turnChars = 0;
    turnTokens = 0;
    turnTokenMessages.clear();
    return;
  }
  const durationMs = Math.max(1, turnLastCharAt - turnStartedAt);
  const source: TurnResult['source'] = turnTokenMessages.size > 0 ? 'tokens' : 'estimate';
  const tokens = source === 'tokens' ? turnTokens : turnChars * charsPerToken;
  lastTurn = {
    tokensPerSecond: tokens / (durationMs / 1000),
    source,
    tokens,
    chars: turnChars,
    durationMs,
    endedAt: now,
  };
  turnStartedAt = null;
  turnLastCharAt = null;
  turnChars = 0;
  turnTokens = 0;
  turnTokenMessages.clear();
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
  if (turnStartedAt === null) turnStartedAt = now;
  turnLastCharAt = now;
  turnChars += chars;
};

const isWatchedSession = (sessionID: unknown): boolean => (
  typeof sessionID === 'string' && watch !== null && watch.sessionId !== null && sessionID === watch.sessionId
);

const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

const calibrate = (messageID: string, output: number, reasoning: number): void => {
  const chars = messageChars.get(messageID) ?? 0;
  if (chars < MIN_CALIBRATION_CHARS) return;
  const generated = output + reasoning;
  if (!Number.isFinite(generated) || generated <= 0) return;
  const ratio = Math.min(MAX_CHARS_PER_TOKEN, Math.max(MIN_CHARS_PER_TOKEN, generated / chars));
  charsPerToken = charsPerToken + (ratio - charsPerToken) * CALIBRATION_WEIGHT;
};

type RawEvent = { type?: unknown; properties?: unknown };

const handleEvent = (event: RawEvent, now: number): void => {
  const type = readString(event.type);
  if (!type) return;
  const properties = (event.properties && typeof event.properties === 'object' ? event.properties : {}) as Record<string, unknown>;

  if (type === 'message.part.delta') {
    if (!isWatchedSession(properties.sessionID)) return;
    if (readString(properties.field) !== 'text') return;
    const partID = readString(properties.partID);
    const messageID = readString(properties.messageID);
    const delta = readString(properties.delta);
    if (!partID || !messageID || delta.length === 0) return;
    deltaParts.add(partID);
    recordChars(messageID, partID, delta.length, now);
    return;
  }

  if (type === 'message.part.updated') {
    if (!isWatchedSession(properties.sessionID)) return;
    const part = properties.part as { id?: unknown; messageID?: unknown; type?: unknown; text?: unknown } | undefined;
    if (!part) return;
    if (part.type !== 'text' && part.type !== 'reasoning') return;
    const partID = readString(part.id);
    const partText = readString(part.text);
    if (!partID) return;
    // Deltas are the finer source; never count the same part twice.
    if (deltaParts.has(partID)) return;
    const previous = partChars.get(partID) ?? 0;
    if (partText.length <= previous) return;
    recordChars(readString(part.messageID), partID, partText.length - previous, now);
    return;
  }

  if (type === 'message.updated') {
    if (!isWatchedSession(properties.sessionID)) return;
    const info = properties.info as {
      id?: unknown;
      role?: unknown;
      tokens?: { output?: unknown; reasoning?: unknown };
      time?: { completed?: unknown };
    } | undefined;
    if (!info || info.role !== 'assistant') return;
    // Calibrate only on finished turns; a streaming message reports partial tokens.
    if (info.time?.completed === undefined) return;
    const output = typeof info.tokens?.output === 'number' ? info.tokens.output : 0;
    const reasoning = typeof info.tokens?.reasoning === 'number' ? info.tokens.reasoning : 0;
    const messageID = readString(info.id);
    calibrate(messageID, output, reasoning);
    // Real token counts for the turn in progress. One completed message is
    // counted once even when the server repeats its final snapshot.
    if (turnStartedAt !== null && messageID && !turnTokenMessages.has(messageID)) {
      turnTokenMessages.add(messageID);
      turnTokens += output + reasoning;
    }
    return;
  }

  if (type === 'session.status') {
    if (!isWatchedSession(properties.sessionID)) return;
    const status = properties.status as { type?: unknown } | undefined;
    const nextBusy = status?.type === 'busy' || status?.type === 'retry';
    if (busy && !nextBusy) finalizeTurn(now);
    busy = nextBusy;
    lastEventAt = now;
    return;
  }

  if (type === 'session.idle') {
    if (!isWatchedSession(properties.sessionID)) return;
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
  // The global stream wraps each event as `{ payload, directory, eventId }`;
  // the directory stream sends the event itself. Accept both.
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
      lastTurn,
      eventsSeen,
      lastEventType,
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
