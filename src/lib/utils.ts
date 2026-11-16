export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const TRACKING_PARAM =
  /^(utm_.+|fbclid|gclid|dclid|msclkid|yclid|mc_cid|mc_eid|igshid|ref|ref_src|ref_url|spm|_hsenc|_hsmi)$/i;

/**
 * Produces a comparison key for a URL: ignores protocol, `www.`, hash, trailing slashes,
 * default ports and well-known tracking parameters. GitHub paths are case-insensitive.
 */
export function normalizeUrl(input: string): string {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let path = url.pathname.replace(/\/+$/, '');
    if (host === 'github.com') path = path.toLowerCase();
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAM.test(key))
      .sort(([a], [b]) => a.localeCompare(b));
    const query = params.length ? `?${new URLSearchParams(params).toString()}` : '';
    const port = url.port && url.port !== '80' && url.port !== '443' ? `:${url.port}` : '';
    return `${host}${port}${path}${query}`;
  } catch {
    return input.trim().toLowerCase();
  }
}

/** Small, fast, non-cryptographic 53-bit string hash (cyrb53), rendered in base 36. */
export function hashString(value: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function hostOf(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Decodes HTML entities safely (DOMParser never executes scripts). */
export function decodeEntities(text: string): string {
  if (!text.includes('&')) return text;
  return new DOMParser().parseFromString(text, 'text/html').documentElement.textContent ?? text;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2);
}

export function parseTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

export class SourceError extends Error {
  readonly kind: 'rate-limit' | 'timeout' | 'network' | 'http' | 'config';

  constructor(kind: SourceError['kind'], message: string) {
    super(message);
    this.name = 'SourceError';
    this.kind = kind;
  }
}

/** JSON fetch with a timeout, caller-provided cancellation and typed failure kinds. */
export async function fetchJson<T>(
  url: string,
  options: { signal?: AbortSignal; timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? 12000);
  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(url, { signal: controller.signal, headers: options.headers });
    if (response.status === 403 || response.status === 429) {
      throw new SourceError('rate-limit', `HTTP ${response.status}`);
    }
    if (!response.ok) throw new SourceError('http', `HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SourceError) throw error;
    if (options.signal?.aborted) throw error;
    if (timedOut) throw new SourceError('timeout', 'Request timed out');
    throw new SourceError('network', error instanceof Error ? error.message : 'Network error');
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}
