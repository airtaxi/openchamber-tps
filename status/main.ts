// The Work Status section: a compact readout of the open session's generation
// rate. It reads the same service as the rail panel, which has the detail.
//
// The section stays a frame rather than a view the host draws from a service
// answer: that answer carries only the locale and the project directory, while
// the service needs the session and the OpenChamber origin, which only a frame
// can hand it.
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

import { describeHostError, el, formatCount, formatSeconds, resolveOrigin, type RateResponse } from '../shared/meter';

/** Twice a second is plenty for a five-second window in a compact readout. */
const POLL_MS = 500;
/** Per-poll decay of the recent peak the bar is measured against. */
const PEAK_DECAY = 0.98;
/** A pause shorter than this is not worth mentioning. */
const PAUSE_SHOWN_MS = 1_000;

const COPY = {
  en: {
    live: 'Live',
    lastTurn: 'Last turn',
    session: 'Session',
    chars: 'Chars/s',
    ratio: 'Tokens/char',
    unit: 'tok/s',
    tokens: 'tok',
    measuring: 'measuring',
    noSession: 'No session yet. The rate shows once this chat has one.',
    serviceHint: 'The extension needs its local service. Approve it in Settings → Extensions.',
    disabled: 'The extension is paused in Settings → Extensions.',
    noOrigin: 'This surface cannot reach the OpenChamber server (relay or embedded view).',
    reconnecting: 'Reconnecting to the event stream.',
    liveTip: 'Tokens per second over the last 5 seconds, estimated from streamed characters.',
    sessionTip: 'Tokens the model generated in this session, output and reasoning together.',
    charsTip: 'Streamed characters per second over the last 5 seconds, counting text, reasoning, and tool input. The live rate is computed from this measured value.',
    ratioTip: 'Model tokens per streamed character, calibrated from finished model calls. The live rate is characters per second times this value.',
    generating: 'Generating',
    paused: 'paused',
    estimated: 'Estimated from streamed characters.',
  },
  ko: {
    live: '실시간',
    lastTurn: '지난 턴',
    session: '세션',
    chars: '초당 문자 수',
    ratio: '문자당 토큰',
    unit: 'tok/s',
    tokens: 'tok',
    measuring: '측정 중',
    noSession: '아직 세션이 없습니다. 챗에 세션이 생기면 속도를 표시합니다.',
    serviceHint: '이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.',
    disabled: '설정 → Extensions에서 확장이 일시중지되었습니다.',
    noOrigin: '이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).',
    reconnecting: '이벤트 스트림에 다시 연결하는 중입니다.',
    liveTip: '최근 5초 동안의 초당 토큰 수입니다. 스트리밍된 문자 수로 추정합니다.',
    sessionTip: '이 세션에서 모델이 생성한 토큰 수입니다. 출력과 추론을 합산합니다.',
    charsTip: '최근 5초 동안 스트리밍된 초당 문자 수입니다. 텍스트, 추론, 도구 입력을 모두 세며, 실시간 토큰 속도는 이 실측값으로 계산합니다.',
    ratioTip: '스트리밍된 문자 하나당 모델 토큰 수입니다. 끝난 모델 호출의 실제 토큰으로 보정하며, 실시간 값은 초당 문자 수에 이 값을 곱해 구합니다.',
    generating: '생성',
    paused: '대기',
    estimated: '스트리밍된 문자 수로 추정한 값입니다.',
  },
} as const;

type Copy = Record<keyof (typeof COPY)['en'], string>;

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing #root');

// ----- Skeleton, built once -----

/** One row: what it is, a bar or detail text, and the number. */
const line = (detail: HTMLElement) => {
  const label = el('span', 'tps-what');
  const value = el('span', 'tps-value', '—');
  const row = el('div', 'tps-line');
  row.append(label, detail, value);
  return { row, label, value };
};

const note = el('div', 'tps-note');
note.hidden = true;

const fill = el('div', 'tps-meter-fill');
const meter = el('div', 'tps-meter');
meter.append(fill);
const live = line(meter);

const turnDetail = el('span', 'tps-detail');
const turn = line(turnDetail);

const session = line(el('span'));
const chars = line(el('span'));
const ratio = line(el('span'));

const lines = [live.row, turn.row, session.row, chars.row, ratio.row];
root.append(note, ...lines);

// ----- State -----

let copy: Copy = COPY.en;
let origin: string | null = null;
let sessionId: string | null = null;
let configuredKey = '';
let latestRate: RateResponse | null = null;
let peak = 0;
let inflight = false;
let started = false;

const applyCopy = (): void => {
  live.label.textContent = copy.live;
  turn.label.textContent = copy.lastTurn;
  session.label.textContent = copy.session;
  chars.label.textContent = copy.chars;
  ratio.label.textContent = copy.ratio;
  live.row.title = copy.liveTip;
  session.row.title = copy.sessionTip;
  chars.row.title = copy.charsTip;
  ratio.row.title = copy.ratioTip;
};

type NoteTone = 'muted' | 'warning';

/**
 * Shows a note above the lines, or none. `keepLines` keeps the numbers on
 * screen under it, for a hiccup after a good answer; a note about why nothing
 * can be measured stands alone.
 */
const show = (message: string | null, keepLines: boolean, detail: string | null = null, tone: NoteTone = 'warning'): void => {
  note.hidden = message === null;
  note.textContent = message ?? '';
  note.title = detail ?? '';
  note.dataset.tone = tone;
  for (const row of lines) row.hidden = !keepLines;
};

const turnTooltip = (rate: RateResponse): string => {
  const last = rate.lastTurn;
  if (!last) return '';
  const parts = [`${copy.generating} ${formatSeconds(last.activeMs)}`];
  if (last.pausedMs >= PAUSE_SHOWN_MS) parts.push(`${copy.paused} ${formatSeconds(last.pausedMs)}`);
  const timing = parts.join(', ');
  return last.source === 'estimate' ? `${timing}\n${copy.estimated}` : timing;
};

const render = (rate: RateResponse | null): void => {
  const tps = rate && Number.isFinite(rate.tokensPerSecond) ? rate.tokensPerSecond : 0;
  peak = Math.max(tps, peak * PEAK_DECAY);
  const share = peak > 0.05 ? Math.min(1, tps / peak) : 0;
  fill.style.transform = `scaleX(${share.toFixed(4)})`;
  live.value.textContent = rate ? `${tps.toFixed(1)} ${copy.unit}` : '—';
  // Between turns the number is the tail of the window, not a live rate.
  const quiet = String(!(rate?.busy && rate.active));
  live.value.dataset.quiet = quiet;

  const charsPerSecond = rate && Number.isFinite(rate.charsPerSecond) ? rate.charsPerSecond : 0;
  chars.value.textContent = rate ? charsPerSecond.toFixed(1) : '—';
  chars.value.dataset.quiet = quiet;

  const last = rate?.lastTurn ?? null;
  if (rate && last) {
    const approximate = last.source === 'estimate' ? '~' : '';
    turnDetail.textContent = `${approximate}${formatCount(last.tokens)} ${copy.tokens} / ${formatSeconds(last.activeMs)}`;
    turn.value.textContent = `${last.tokensPerSecond.toFixed(1)} ${copy.unit}`;
    turn.row.title = turnTooltip(rate);
  } else {
    turnDetail.textContent = rate?.busy ? copy.measuring : '';
    turn.value.textContent = '—';
    turn.row.title = '';
  }
  turn.value.dataset.quiet = String(!last);

  const usage = rate?.sessionUsage ?? null;
  session.value.textContent = usage ? `${formatCount(usage.generated)} ${copy.tokens}` : '—';
  session.value.dataset.quiet = String(!usage);

  ratio.value.textContent = rate ? rate.charsPerToken.toFixed(3) : '—';
  ratio.value.dataset.quiet = String(!rate);
};

// ----- Service -----

const watchKey = (): string => `${origin ?? ''}|${sessionId ?? ''}`;

/** Points the service at this chat's session; a no-op while it already watches it. */
const configure = async (): Promise<void> => {
  const key = watchKey();
  if (key === configuredKey) return;
  const result = await host.serviceRequest({
    method: 'POST',
    path: '/watch',
    body: JSON.stringify({ origin, sessionId }),
  });
  if (result.status >= 400) throw new Error(`HTTP ${result.status}`);
  // A session switched while this was out differs from the key, so the next poll sends it.
  configuredKey = key;
};

const poll = async (): Promise<void> => {
  if (inflight) return;
  if (!origin) {
    show(copy.noOrigin, false);
    return;
  }
  if (!sessionId) {
    show(copy.noSession, false, null, 'muted');
    return;
  }
  inflight = true;
  const asked = sessionId;
  try {
    await configure();
    const result = await host.serviceRequest({ method: 'GET', path: '/rate' });
    if (result.status >= 400) throw new Error(`HTTP ${result.status}`);
    const rate = JSON.parse(result.body) as RateResponse;
    // The chat moved on while this was out; the next poll reads the new session.
    if (asked !== sessionId) return;
    // A restarted service has forgotten what it watched.
    if (rate.sessionId === null && rate.connection === 'idle') configuredKey = '';
    latestRate = rate;
    render(rate);
    show(rate.connection === 'error' ? copy.reconnecting : null, true, rate.error);
  } catch (error) {
    show(describeHostError(error, copy), latestRate !== null);
  } finally {
    inflight = false;
  }
};

const switchSession = (next: string | null): void => {
  if (next === sessionId) return;
  sessionId = next;
  latestRate = null;
  peak = 0;
  render(null);
  void poll();
};

const tick = async (): Promise<void> => {
  if (!document.hidden) await poll();
  window.setTimeout(() => { void tick(); }, POLL_MS);
};

// The host sizes the section's frame to this, up to its own limit.
let reportedHeight = -1;
new ResizeObserver(() => {
  const height = Math.ceil(root.getBoundingClientRect().height);
  if (height === reportedHeight) return;
  reportedHeight = height;
  void host.setHeight(height).catch(() => undefined);
}).observe(root);

host.onReady((context) => {
  copy = context.locale.toLowerCase().startsWith('ko') ? COPY.ko : COPY.en;
  applyHostReady(context, document.documentElement);
  origin = resolveOrigin();
  applyCopy();
  render(latestRate);
  if (!started) {
    started = true;
    sessionId = context.session?.id ?? null;
    void tick();
    return;
  }
  switchSession(context.session?.id ?? null);
});

host.onSession((next) => {
  switchSession(next?.id ?? null);
});
