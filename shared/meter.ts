// What the rail panel and the Work Status section share. Both frames talk to
// the same service: `POST /watch` names the session and the OpenChamber origin,
// `GET /rate` answers with the measurement below. The origin is only a fallback
// for a host that gives the service no OpenCode access of its own.
import { HostRequestError } from '@openchamber/sdk';

export type ConnectionState = 'idle' | 'connecting' | 'live' | 'error' | 'blocked';

export type TurnResult = {
  tokensPerSecond: number;
  source: 'tokens' | 'estimate';
  tokens: number;
  chars: number;
  activeMs: number;
  wallMs: number;
  pausedMs: number;
  endedAt: number;
};

/** Running session totals from `session.usage.updated`; the only real counters OpenCode 2 publishes live. */
export type SessionUsage = {
  cost: number;
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  /** `output + reasoning`: tokens the model actually generated. */
  generated: number;
};

export type RateResponse = {
  connection: ConnectionState;
  error: string | null;
  sessionId: string | null;
  busy: boolean;
  active: boolean;
  lastEventAt: number | null;
  windowMs: number;
  chars: number;
  charsPerSecond: number;
  tokensPerSecond: number;
  charsPerToken: number;
  sessionUsage: SessionUsage | null;
  lastTurn: TurnResult | null;
  eventsSeen: number;
  lastEventType: string | null;
  waiting: 'permission' | 'question' | null;
};

/** Messages for the host errors a frame can explain to the user. */
export type HostErrorCopy = {
  serviceHint: string;
  disabled: string;
  reconnecting: string;
};

/** The OpenChamber origin this frame was served from, for the service's fallback event stream. */
export const resolveOrigin = (): string | null => {
  try {
    const url = new URL(window.location.href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin;
  } catch {
    // about:srcdoc, an opaque sandbox origin, or no window: nothing usable.
  }
  return null;
};

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const describeHostError = (error: unknown, copy: HostErrorCopy): string => {
  if (error instanceof HostRequestError) {
    if (error.code === 'NO_SERVICE' || error.code === 'NOT_GRANTED' || error.code === 'SERVICE_FAILED') return copy.serviceHint;
    if (error.code === 'DISABLED') return copy.disabled;
    if (error.code === 'HOST_TIMEOUT') return copy.reconnecting;
    return `${error.code}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
};

export const formatCount = (value: number): string => Math.round(value).toLocaleString();

export const formatSeconds = (ms: number): string => `${(ms / 1000).toFixed(1)} s`;
