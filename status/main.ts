import { connectHost, HostRequestError } from '@openchamber/sdk';
import { applyHostReady, mountBadge } from '@openchamber/sdk/ui';

type ConnectionState = 'idle' | 'connecting' | 'live' | 'error';

/** Only the fields the compact readout needs. */
type RateResponse = {
  connection: ConnectionState;
  error: string | null;
  busy: boolean;
  active: boolean;
  tokensPerSecond: number;
  waiting: 'permission' | 'question' | null;
};

const COPY = {
  en: {
    unit: 'tok/s',
    idle: 'idle',
    generating: 'generating',
    connecting: 'connecting',
    reconnecting: 'reconnecting',
    asleep: 'not connected',
    serviceHint: 'The extension needs its local service. Approve it in Settings → Extensions.',
    disabled: 'The extension is paused in Settings → Extensions.',
    noOrigin: 'This surface cannot reach the OpenChamber server (relay or embedded view).',
    waitingPermission: 'waiting for permission',
    waitingQuestion: 'waiting for answer',
  },
  ko: {
    unit: 'tok/s',
    idle: '대기',
    generating: '생성 중',
    connecting: '연결 중',
    reconnecting: '재연결 중',
    asleep: '연결되지 않음',
    serviceHint: '이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.',
    disabled: '설정 → Extensions에서 확장이 일시중지되었습니다.',
    noOrigin: '이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).',
    waitingPermission: '권한 대기 중',
    waitingQuestion: '응답 대기 중',
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
let sessionId: string | null = null;
let configuredKey = '';
let peak = 0;
let polling = false;
let mounted = false;

const valueEl = el('span', 'tps-value', '0.0');
const unitEl = el('span', 'tps-unit', COPY.en.unit);
const fillEl = el('div', 'tps-bar-fill');
const noticeEl = el('div', 'tps-notice');

let badge: ReturnType<typeof mountBadge> | null = null;

const describeError = (error: unknown): string => {
  if (error instanceof HostRequestError) {
    if (error.code === 'NO_SERVICE' || error.code === 'SERVICE_FAILED') return copy.serviceHint;
    if (error.code === 'DISABLED') return copy.disabled;
    if (error.code === 'HOST_TIMEOUT') return copy.reconnecting;
    return `${error.code}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
};

const statusLabel = (rate: RateResponse | null): { label: string; tone: 'neutral' | 'success' | 'warning' } => {
  if (!rate) return { label: copy.connecting, tone: 'neutral' };
  if (rate.connection === 'error') return { label: copy.reconnecting, tone: 'warning' };
  if (rate.connection === 'connecting') return { label: copy.connecting, tone: 'neutral' };
  if (rate.connection === 'idle') return { label: copy.asleep, tone: 'neutral' };
  if (rate.waiting === 'permission') return { label: copy.waitingPermission, tone: 'warning' };
  if (rate.waiting === 'question') return { label: copy.waitingQuestion, tone: 'warning' };
  if (rate.active && rate.busy) return { label: copy.generating, tone: 'success' };
  return { label: copy.idle, tone: 'neutral' };
};

const render = (rate: RateResponse | null, notice: string | null = null): void => {
  const tps = rate && Number.isFinite(rate.tokensPerSecond) ? rate.tokensPerSecond : 0;
  peak = Math.max(tps, peak * 0.99);
  fillEl.style.transform = `scaleX(${(peak > 0.05 ? Math.min(1, tps / peak) : 0).toFixed(4)})`;
  valueEl.textContent = tps.toFixed(1);
  badge?.update(statusLabel(rate));
  noticeEl.textContent = notice ?? (rate?.error ?? '');
};

let latestRate: RateResponse | null = null;

const poll = async (): Promise<void> => {
  if (polling || !origin) {
    if (!origin) render(null, copy.noOrigin);
    return;
  }
  polling = true;
  try {
    const result = await host.serviceRequest({ method: 'GET', path: '/rate' });
    if (result.status < 400) {
      latestRate = JSON.parse(result.body) as RateResponse;
      render(latestRate);
    } else {
      render(latestRate, `HTTP ${result.status}`);
    }
  } catch (error) {
    render(latestRate, describeError(error));
  } finally {
    polling = false;
  }
};

const configure = async (nextSessionId: string | null): Promise<void> => {
  if (!origin) {
    render(null, copy.noOrigin);
    return;
  }
  const key = `${origin}|${nextSessionId ?? ''}`;
  if (key === configuredKey) return;
  try {
    await host.serviceRequest({
      method: 'POST',
      path: '/watch',
      body: JSON.stringify({ origin, sessionId: nextSessionId }),
    });
    configuredKey = key;
  } catch (error) {
    configuredKey = '';
    render(latestRate, describeError(error));
  }
};

const mount = (): void => {
  const container = el('div', 'tps-status');
  const readout = el('div', 'tps-readout');
  const badgeSlot = el('div', 'tps-badge-slot');
  readout.append(valueEl, unitEl, badgeSlot);
  const bar = el('div', 'tps-bar');
  bar.append(fillEl);
  container.append(readout, bar, noticeEl);
  root.append(container);

  badge = mountBadge(badgeSlot, { label: copy.connecting, tone: 'neutral' });

  void configure(sessionId);
  void poll();

  const loop = () => {
    window.setTimeout(async () => {
      await poll();
      loop();
    }, document.hidden ? 1000 : 250);
  };
  loop();
};

host.onReady((next) => {
  copy = next.locale.toLowerCase().startsWith('ko') ? COPY.ko : COPY.en;
  applyHostReady(next, document.documentElement);
  sessionId = next.session?.id ?? null;
  origin = resolveOrigin();
  unitEl.textContent = copy.unit;
  if (mounted) {
    void configure(sessionId);
    return;
  }
  mounted = true;
  mount();
});

host.onSession((session) => {
  sessionId = session?.id ?? null;
  void configure(sessionId);
});