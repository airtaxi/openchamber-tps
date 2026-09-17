import { connectHost, HostRequestError } from '@openchamber/sdk';
import { applyHostReady, mountBadge, mountBanner, mountButton, mountSeparator } from '@openchamber/sdk/ui';

type ConnectionState = 'idle' | 'connecting' | 'live' | 'error';

type TurnResult = {
  tokensPerSecond: number;
  source: 'tokens' | 'estimate';
  tokens: number;
  chars: number;
  durationMs: number;
  endedAt: number;
};

type RateResponse = {
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
  lastTurn: TurnResult | null;
  eventsSeen: number;
  lastEventType: string | null;
};

type HostContext = {
  locale: string;
  directory: string | null;
  session: { id: string; title: string; busy: boolean } | null;
};

const COPY = {
  en: {
    title: 'TPS Meter',
    unit: 'tok/s',
    windowLabel: 'rolling 5 s',
    noSession: 'No session is open. Open a chat to measure its generation rate.',
    charsPerSecond: 'Characters/s',
    charsPerToken: 'Chars per token',
    idle: 'idle',
    generating: 'generating',
    connecting: 'connecting',
    reconnecting: 'reconnecting',
    asleep: 'not connected',
    serviceHint: 'The extension needs its local service. Approve it in Settings → Extensions.',
    disabled: 'The extension is paused in Settings → Extensions.',
    noOrigin: 'This surface cannot reach the OpenChamber server (relay or embedded view).',
    estimate: 'Tokens are estimated from streamed characters, calibrated with completed turns.',
    statusId: 'Status',
    lastEvent: 'Last event',
    retry: 'Retry',
    lastTurn: 'Last turn average',
    lastTurnEmpty: 'No finished turn yet.',
    lastTurnEstimated: 'estimated',
    lastTurnPending: 'measuring',
    events: 'Events seen',
  },
  ko: {
    title: 'TPS 측정기',
    unit: 'tok/s',
    windowLabel: '최근 5초',
    noSession: '열린 세션이 없습니다. 챗을 열면 생성 속도를 측정합니다.',
    charsPerSecond: '초당 문자 수',
    charsPerToken: '문자당 토큰',
    idle: '대기',
    generating: '생성 중',
    connecting: '연결 중',
    reconnecting: '재연결 중',
    asleep: '연결되지 않음',
    serviceHint: '이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.',
    disabled: '설정 → Extensions에서 확장이 일시중지되었습니다.',
    noOrigin: '이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).',
    estimate: '토큰 수는 스트리밍된 문자 수에서 추정하고, 완료된 턴의 실제 토큰으로 보정합니다.',
    statusId: '상태',
    lastEvent: '마지막 이벤트',
    retry: '다시 시도',
    lastTurn: '지난 턴 평균',
    lastTurnEmpty: '아직 끝난 턴이 없습니다.',
    lastTurnEstimated: '추정',
    lastTurnPending: '측정 중',
    events: '수신 이벤트',
  },
} as const;

type Copy = Record<keyof (typeof COPY)['en'], string>;

const host = connectHost();
const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root');

const resolveOrigin = (): string | null => {
  try {
    const url = new URL(window.location.href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin;
  } catch {
    // about:srcdoc, an opaque sandbox origin, or no window: nothing usable.
  }
  return null;
};

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

let copy: Copy = COPY.en;
let origin: string | null = null;
let context: HostContext = { locale: 'en', directory: null, session: null };
let mounted = false;
let stopped = false;
let polling = false;
let configuredKey = '';
let peak = 0;

let badge: ReturnType<typeof mountBadge> | null = null;
let banner: ReturnType<typeof mountBanner> | null = null;
let noticeRoot: HTMLElement | null = null;

const valueEl = el('span', 'tps-value', '0.0');
const unitEl = el('span', 'tps-unit');
const fillEl = el('div', 'tps-bar-fill');
const sessionEl = el('div', 'tps-session');
const noteEl = el('div', 'tps-note');
const charsEl = el('dd', 'tps-detail-value');
const ratioEl = el('dd', 'tps-detail-value');
const connectionEl = el('dd', 'tps-detail-value');
const lastEventEl = el('dd', 'tps-detail-value');
const eventsEl = el('dd', 'tps-detail-value');
const lastTurnValueEl = el('div', 'tps-lastturn-value', '—');
const lastTurnMetaEl = el('div', 'tps-lastturn-meta');

const describeError = (error: unknown): string => {
  if (error instanceof HostRequestError) {
    if (error.code === 'NO_SERVICE' || error.code === 'SERVICE_FAILED') return copy.serviceHint;
    if (error.code === 'DISABLED') return copy.disabled;
    if (error.code === 'HOST_TIMEOUT') return copy.reconnecting;
    return `${error.code}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
};

const setNotice = (message: string | null, tone: 'info' | 'warning' | 'error' = 'warning'): void => {
  if (!message) {
    banner?.dispose();
    banner = null;
    return;
  }
  if (banner) {
    banner.update({ tone, title: message, body: undefined });
    return;
  }
  banner = mountBanner(noticeRoot ?? root, { tone, title: message });
};

const statusLabel = (rate: RateResponse | null): { label: string; tone: 'neutral' | 'success' | 'warning' } => {
  if (!rate) return { label: copy.connecting, tone: 'neutral' };
  if (rate.connection === 'error') return { label: copy.reconnecting, tone: 'warning' };
  if (rate.connection === 'connecting') return { label: copy.connecting, tone: 'neutral' };
  if (rate.connection === 'idle') return { label: copy.asleep, tone: 'neutral' };
  if (rate.active && rate.busy) return { label: copy.generating, tone: 'success' };
  return { label: copy.idle, tone: 'neutral' };
};

const formatAge = (lastEventAt: number | null): string => {
  if (!lastEventAt) return '—';
  const seconds = Math.max(0, (Date.now() - lastEventAt) / 1000);
  return seconds < 1 ? '<1 s' : `${seconds.toFixed(0)} s`;
};

const formatCount = (value: number): string => Math.round(value).toLocaleString();

const renderLastTurn = (rate: RateResponse | null): void => {
  const turn = rate?.lastTurn ?? null;
  if (turn) {
    lastTurnValueEl.textContent = `${turn.tokensPerSecond.toFixed(1)} ${copy.unit}`;
    lastTurnValueEl.dataset.state = 'ready';
    const suffix = turn.source === 'estimate' ? ` · ${copy.lastTurnEstimated}` : '';
    lastTurnMetaEl.textContent = `${formatCount(turn.tokens)} tok · ${(turn.durationMs / 1000).toFixed(1)} s${suffix}`;
    return;
  }
  const measuring = Boolean(rate?.busy);
  lastTurnValueEl.textContent = measuring ? copy.lastTurnPending : '—';
  lastTurnValueEl.dataset.state = measuring ? 'pending' : 'empty';
  lastTurnMetaEl.textContent = measuring ? '' : copy.lastTurnEmpty;
};

const render = (rate: RateResponse | null, notice: string | null = null): void => {
  const tps = rate && Number.isFinite(rate.tokensPerSecond) ? rate.tokensPerSecond : 0;
  peak = Math.max(tps, peak * 0.99);
  const fill = peak > 0.05 ? Math.min(1, tps / peak) : 0;

  valueEl.textContent = tps.toFixed(1);
  fillEl.style.transform = `scaleX(${fill.toFixed(4)})`;

  const status = statusLabel(rate);
  badge?.update({ label: status.label, tone: status.tone });

  const session = context.session;
  sessionEl.textContent = session ? session.title : copy.noSession;
  sessionEl.dataset.empty = session ? 'false' : 'true';

  charsEl.textContent = rate ? `${rate.charsPerSecond.toFixed(1)}` : '—';
  ratioEl.textContent = rate ? rate.charsPerToken.toFixed(3) : '—';
  connectionEl.textContent = rate ? rate.connection : '—';
  lastEventEl.textContent = rate ? formatAge(rate.lastEventAt) : '—';
  eventsEl.textContent = rate ? formatCount(rate.eventsSeen) : '—';
  noteEl.textContent = rate?.error ? `${rate.error}` : copy.estimate;

  renderLastTurn(rate);

  if (notice) setNotice(notice);
};

let latestRate: RateResponse | null = null;

const poll = async (): Promise<void> => {
  if (stopped) return;
  if (polling) return;
  if (!origin) {
    render(null, copy.noOrigin);
    return;
  }
  polling = true;
  try {
    const result = await host.serviceRequest({ method: 'GET', path: '/rate' });
    if (result.status < 400) {
      latestRate = JSON.parse(result.body) as RateResponse;
      render(latestRate);
    } else {
      render(latestRate, `${copy.statusId}: HTTP ${result.status}`);
    }
  } catch (error) {
    render(latestRate, describeError(error));
  } finally {
    polling = false;
  }
};

const configure = async (sessionId: string | null): Promise<void> => {
  if (!origin) {
    render(null, copy.noOrigin);
    return;
  }
  const key = `${origin}|${sessionId ?? ''}`;
  if (key === configuredKey) return;
  try {
    await host.serviceRequest({
      method: 'POST',
      path: '/watch',
      body: JSON.stringify({ origin, sessionId }),
    });
    configuredKey = key;
  } catch (error) {
    configuredKey = '';
    render(latestRate, describeError(error));
  }
};

const mount = (): void => {
  const container = el('div', 'tps-root');
  noticeRoot = el('div', 'tps-notice');
  const card = el('section', 'tps-card');
  const header = el('div', 'tps-header');
  header.append(el('h1', 'tps-title', copy.title));
  const badgeSlot = el('div');
  header.append(badgeSlot);

  const readout = el('div', 'tps-readout');
  readout.append(valueEl, unitEl);
  const windowEl = el('div', 'tps-window', copy.windowLabel);
  const bar = el('div', 'tps-bar');
  bar.append(fillEl);
  const sessionRow = el('div', 'tps-session-row');
  sessionRow.append(sessionEl);

  card.append(header, readout, windowEl, bar, sessionRow);

  const lastTurnCard = el('section', 'tps-card tps-lastturn');
  lastTurnCard.append(el('div', 'tps-lastturn-label', copy.lastTurn), lastTurnValueEl, lastTurnMetaEl);

  const details = el('section', 'tps-card');
  const list = el('dl', 'tps-details');
  const row = (label: string, value: HTMLElement) => {
    list.append(el('dt', 'tps-detail-label', label), value);
  };
  row(copy.charsPerSecond, charsEl);
  row(copy.charsPerToken, ratioEl);
  row(copy.statusId, connectionEl);
  row(copy.lastEvent, lastEventEl);
  row(copy.events, eventsEl);
  details.append(list);

  const footer = el('div', 'tps-footer');
  footer.append(noteEl);
  const actions = el('div', 'tps-actions');
  mountButton(actions, { label: copy.retry, variant: 'outline', size: 'sm', onClick: () => { void configure(context.session?.id ?? null); void poll(); } });
  footer.append(actions);
  details.append(footer);
  mountSeparator(details, {});

  container.append(noticeRoot, card, lastTurnCard, details);
  root.append(container);

  badge = mountBadge(badgeSlot, { label: copy.connecting, tone: 'neutral' });
  unitEl.textContent = copy.unit;
  noteEl.textContent = copy.estimate;
  renderLastTurn(null);

  stopped = false;
  void configure(context.session?.id ?? null);
  void poll();

  const loop = () => {
    if (stopped) return;
    const delay = document.hidden ? 1000 : 250;
    window.setTimeout(async () => {
      await poll();
      loop();
    }, delay);
  };
  loop();
};

host.onReady((next) => {
  copy = next.locale.toLowerCase().startsWith('ko') ? COPY.ko : COPY.en;
  applyHostReady(next, document.documentElement);
  context = {
    locale: next.locale,
    directory: next.directory,
    session: next.session ? { id: next.session.id, title: next.session.title, busy: next.session.busy } : null,
  };
  origin = resolveOrigin();
  if (!mounted) {
    mounted = true;
    unitEl.textContent = copy.unit;
    mount();
    return;
  }
  void configure(context.session?.id ?? null);
});

host.onSession((session) => {
  context = { ...context, session };
  void configure(session?.id ?? null);
});
