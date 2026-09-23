// service/main.ts
import http from "node:http";
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!Number.isInteger(port) || port <= 0 || !token) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var WINDOW_MS = 5000;
var SAMPLE_LIMIT = 20000;
var RETRY_BASE_MS = 1000;
var RETRY_MAX_MS = 15000;
var DEFAULT_CHARS_PER_TOKEN = 0.25;
var MIN_CHARS_PER_TOKEN = 0.05;
var MAX_CHARS_PER_TOKEN = 1;
var CALIBRATION_WEIGHT = 0.3;
var MIN_CALIBRATION_CHARS = 40;
var MAX_STREAM_GAP_MS = 1000;
var samples = [];
var partChars = new Map;
var deltaParts = new Set;
var messageChars = new Map;
var stepTokens = new Map;
var watch = null;
var connection = "idle";
var lastError = null;
var lastEventAt = 0;
var eventsSeen = 0;
var lastEventType = null;
var busy = false;
var charsPerToken = DEFAULT_CHARS_PER_TOKEN;
var sessionUsage = null;
var controller = null;
var retryTimer = null;
var retryDelay = RETRY_BASE_MS;
var turnStartedAt = null;
var turnLastCharAt = null;
var turnBusyAt = null;
var turnChars = 0;
var turnTokens = 0;
var turnActiveMs = 0;
var turnSawTokens = false;
var lastTurn = null;
var pendingPermissions = new Set;
var pendingQuestions = new Set;
var waitingKind = () => pendingPermissions.size > 0 ? "permission" : pendingQuestions.size > 0 ? "question" : null;
var clearTurn = () => {
  turnStartedAt = null;
  turnLastCharAt = null;
  turnBusyAt = null;
  turnChars = 0;
  turnTokens = 0;
  turnActiveMs = 0;
  turnSawTokens = false;
};
var resetMeasurement = () => {
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
var finalizeTurn = (now) => {
  if (turnStartedAt === null || turnLastCharAt === null || turnChars === 0) {
    clearTurn();
    return;
  }
  const wallMs = Math.max(1, turnLastCharAt - turnStartedAt);
  const activeMs = turnActiveMs > 0 ? Math.round(turnActiveMs) : Math.min(wallMs, MAX_STREAM_GAP_MS);
  const source = turnSawTokens ? "tokens" : "estimate";
  const tokens = source === "tokens" ? turnTokens : turnChars * charsPerToken;
  lastTurn = {
    tokensPerSecond: tokens / (activeMs / 1000),
    source,
    tokens,
    chars: turnChars,
    activeMs,
    wallMs,
    pausedMs: Math.max(0, wallMs - activeMs),
    endedAt: now
  };
  clearTurn();
};
var pruneSamples = (now) => {
  let expired = 0;
  while (expired < samples.length && now - samples[expired].at > WINDOW_MS) {
    expired += 1;
  }
  if (expired > 0)
    samples.splice(0, expired);
};
var recordChars = (messageID, partID, chars, now) => {
  if (chars <= 0)
    return;
  samples.push({ at: now, chars });
  if (samples.length > SAMPLE_LIMIT)
    samples.splice(0, samples.length - SAMPLE_LIMIT);
  partChars.set(partID, (partChars.get(partID) ?? 0) + chars);
  messageChars.set(messageID, (messageChars.get(messageID) ?? 0) + chars);
  lastEventAt = now;
  if (turnStartedAt === null) {
    turnStartedAt = now;
    if (turnBusyAt !== null && now - turnBusyAt <= MAX_STREAM_GAP_MS) {
      turnActiveMs += now - turnBusyAt;
    }
  } else if (turnLastCharAt !== null && waitingKind() === null) {
    const gap = now - turnLastCharAt;
    if (gap <= MAX_STREAM_GAP_MS)
      turnActiveMs += gap;
  }
  turnLastCharAt = now;
  turnChars += chars;
};
var isWatchedSession = (sessionID) => typeof sessionID === "string" && watch !== null && watch.sessionId !== null && sessionID === watch.sessionId;
var readString = (value) => typeof value === "string" ? value : "";
var readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
var readRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
var fragmentPartID = (messageID, kind, ordinal) => {
  if (!messageID)
    return "";
  const index = typeof ordinal === "number" && Number.isInteger(ordinal) && ordinal >= 0 ? ordinal : 0;
  return `${messageID}:${kind}:${index}`;
};
var calibrate = (messageID, output, reasoning) => {
  const chars = messageChars.get(messageID) ?? 0;
  if (chars < MIN_CALIBRATION_CHARS)
    return;
  const generated = output + reasoning;
  if (!Number.isFinite(generated) || generated <= 0)
    return;
  const ratio = Math.min(MAX_CHARS_PER_TOKEN, Math.max(MIN_CHARS_PER_TOKEN, generated / chars));
  charsPerToken = charsPerToken + (ratio - charsPerToken) * CALIBRATION_WEIGHT;
};
var recordTokens = (messageID, output, reasoning) => {
  const generated = output + reasoning;
  if (!messageID || generated <= 0)
    return;
  calibrate(messageID, output, reasoning);
  const previous = stepTokens.get(messageID) ?? 0;
  stepTokens.set(messageID, generated);
  if (turnStartedAt === null)
    return;
  turnTokens += generated - previous;
  if (generated > previous)
    turnSawTokens = true;
};
var handleEvent = (event, now) => {
  const type = readString(event.type);
  if (!type)
    return;
  const payload = readRecord(event.data) ?? readRecord(event.properties);
  if (!payload)
    return;
  if (type === "session.text.delta" || type === "session.reasoning.delta") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const messageID = readString(payload.assistantMessageID);
    const delta = readString(payload.delta);
    const kind = type === "session.reasoning.delta" ? "reasoning" : "text";
    const partID = fragmentPartID(messageID, kind, payload.ordinal);
    if (!partID || delta.length === 0)
      return;
    deltaParts.add(partID);
    recordChars(messageID, partID, delta.length, now);
    return;
  }
  if (type === "session.text.ended" || type === "session.reasoning.ended") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const messageID = readString(payload.assistantMessageID);
    const kind = type === "session.reasoning.ended" ? "reasoning" : "text";
    const partID = fragmentPartID(messageID, kind, payload.ordinal);
    if (!partID)
      return;
    if (deltaParts.has(partID))
      return;
    const text = readString(payload.text);
    const previous = partChars.get(partID) ?? 0;
    if (text.length <= previous)
      return;
    recordChars(messageID, partID, text.length - previous, now);
    return;
  }
  if (type === "session.step.ended" || type === "session.step.failed") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const tokens = readRecord(payload.tokens);
    if (!tokens)
      return;
    recordTokens(readString(payload.assistantMessageID), readNumber(tokens.output), readNumber(tokens.reasoning));
    return;
  }
  if (type === "session.usage.updated") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const tokens = readRecord(payload.tokens);
    if (!tokens)
      return;
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
      generated: output + reasoning
    };
    lastEventAt = now;
    return;
  }
  if (type === "session.execution.started") {
    if (!isWatchedSession(payload.sessionID))
      return;
    if (turnStartedAt === null)
      turnBusyAt = now;
    busy = true;
    lastEventAt = now;
    return;
  }
  if (type === "session.execution.succeeded" || type === "session.execution.failed") {
    if (!isWatchedSession(payload.sessionID))
      return;
    busy = false;
    lastEventAt = now;
    finalizeTurn(now);
    return;
  }
  if (type === "session.execution.interrupted") {
    if (!isWatchedSession(payload.sessionID))
      return;
    lastEventAt = now;
    if (readString(payload.reason) === "shutdown")
      return;
    busy = false;
    finalizeTurn(now);
    return;
  }
  if (type === "permission.asked" || type === "permission.v2.asked") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const requestId = readString(payload.id);
    if (requestId)
      pendingPermissions.add(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "permission.replied" || type === "permission.v2.replied") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const requestId = readString(payload.requestID);
    if (requestId)
      pendingPermissions.delete(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "form.created") {
    const form = readRecord(payload.form);
    if (!form || !isWatchedSession(form.sessionID))
      return;
    const requestId = readString(form.id);
    if (requestId)
      pendingQuestions.add(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "form.replied" || type === "form.cancelled") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const requestId = readString(payload.id);
    if (requestId)
      pendingQuestions.delete(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "question.asked" || type === "question.v2.asked") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const requestId = readString(payload.id);
    if (requestId)
      pendingQuestions.add(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "question.replied" || type === "question.rejected" || type === "question.v2.replied" || type === "question.v2.rejected") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const requestId = readString(payload.requestID);
    if (requestId)
      pendingQuestions.delete(requestId);
    lastEventAt = now;
    return;
  }
  if (type === "session.status") {
    if (!isWatchedSession(payload.sessionID))
      return;
    const status = readRecord(payload.status);
    const nextBusy = status?.type === "busy" || status?.type === "retry";
    if (busy && !nextBusy)
      finalizeTurn(now);
    if (nextBusy && turnStartedAt === null)
      turnBusyAt = now;
    busy = nextBusy;
    lastEventAt = now;
    return;
  }
  if (type === "session.idle") {
    if (!isWatchedSession(payload.sessionID))
      return;
    busy = false;
    lastEventAt = now;
    finalizeTurn(now);
  }
};
var handleSseChunk = (chunk) => {
  const data = [];
  for (const line of chunk.split(`
`)) {
    if (!line.startsWith("data:"))
      continue;
    data.push(line.slice(5).trimStart());
  }
  if (data.length === 0)
    return;
  let parsed;
  try {
    parsed = JSON.parse(data.join(`
`));
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== "object")
    return;
  const envelope = parsed;
  const event = envelope.payload && typeof envelope.payload === "object" ? envelope.payload : parsed;
  eventsSeen += 1;
  lastEventType = readString(event.type) || null;
  handleEvent(event, Date.now());
};
var scheduleReconnect = (message) => {
  lastError = message;
  connection = "error";
  if (!watch || retryTimer)
    return;
  const delay = retryDelay;
  retryDelay = Math.min(RETRY_MAX_MS, retryDelay * 2);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startStream();
  }, delay);
};
var startStream = async () => {
  const current = watch;
  if (!current)
    return;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  controller?.abort();
  const local = new AbortController;
  controller = local;
  connection = "connecting";
  lastError = null;
  try {
    const response = await fetch(new URL("/api/global/event", current.origin), {
      headers: { Accept: "text/event-stream" },
      signal: local.signal
    });
    if (!response.ok || !response.body) {
      scheduleReconnect(`Event stream answered HTTP ${response.status}`);
      return;
    }
    connection = "live";
    retryDelay = RETRY_BASE_MS;
    lastEventAt = Date.now();
    eventsSeen = 0;
    lastEventType = null;
    const decoder = new TextDecoder;
    const reader = response.body.getReader();
    let buffer = "";
    while (!local.signal.aborted) {
      const { value, done } = await reader.read();
      if (done)
        break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf(`

`);
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        handleSseChunk(chunk);
        boundary = buffer.indexOf(`

`);
      }
    }
    if (!local.signal.aborted)
      scheduleReconnect("Event stream closed");
  } catch (error) {
    if (local.signal.aborted)
      return;
    scheduleReconnect(error instanceof Error ? error.message : String(error));
  }
};
var stopStream = () => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  controller?.abort();
  controller = null;
  connection = "idle";
};
var computeRate = (now) => {
  pruneSamples(now);
  let chars = 0;
  for (const sample of samples)
    chars += sample.chars;
  const charsPerSecond = chars / (WINDOW_MS / 1000);
  return {
    chars,
    charsPerSecond,
    tokensPerSecond: charsPerSecond * charsPerToken
  };
};
var isHttpOrigin = (value) => {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.username === "" && parsed.password === "";
  } catch {
    return false;
  }
};
var applyWatch = (next) => {
  const changed = watch === null || watch.origin !== next.origin || watch.sessionId !== next.sessionId;
  watch = next;
  if (!changed)
    return false;
  resetMeasurement();
  retryDelay = RETRY_BASE_MS;
  stopStream();
  startStream();
  return true;
};
var json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
};
var readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 64000) {
      reject(new Error("Request body too large"));
      req.destroy();
    }
  });
  req.on("end", () => {
    if (!body.trim()) {
      resolve(null);
      return;
    }
    try {
      resolve(JSON.parse(body));
    } catch {
      reject(new Error("Request body is not valid JSON"));
    }
  });
  req.on("error", reject);
});
var server = http.createServer((req, res) => {
  if (req.headers.authorization !== `Bearer ${token}`) {
    json(res, 401, { error: "unauthorized" });
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    json(res, 200, { ok: true, pid: process.pid });
    return;
  }
  if (url.pathname === "/watch" && req.method === "POST") {
    readJsonBody(req).then((raw) => {
      const body = raw && typeof raw === "object" ? raw : {};
      const origin = readString(body.origin);
      if (!isHttpOrigin(origin)) {
        json(res, 400, { error: "origin must be an http(s) origin from the OpenChamber server" });
        return;
      }
      const sessionId = typeof body.sessionId === "string" && body.sessionId.trim() ? body.sessionId : null;
      const changed = applyWatch({ origin, sessionId });
      json(res, 200, { ok: true, changed, connection, sessionId });
    }).catch((error) => {
      json(res, 400, { error: error instanceof Error ? error.message : "Invalid request" });
    });
    return;
  }
  if (url.pathname === "/rate") {
    const now = Date.now();
    const rate = computeRate(now);
    json(res, 200, {
      connection,
      error: lastError,
      sessionId: watch?.sessionId ?? null,
      busy,
      active: now - lastEventAt < 2000,
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
      waiting: waitingKind()
    });
    return;
  }
  json(res, 404, { error: "not-found" });
});
server.listen(port, "127.0.0.1");
var shutdown = () => {
  stopStream();
  server.close(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
