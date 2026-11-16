import { GOOGLE_CSE_ID, hasGoogleCse } from '../lib/config';
import { SourceError, decodeEntities, hostOf, isHttpUrl, truncate } from '../lib/utils';
import { AWESOME_LISTS } from './links';
import { asRepositoryUrl } from './repo';
import type { SearchResult, SearchSource, SourceId } from './types';

/** Shape of the result objects handed to the Element's "results ready" callback. */
type CseResult = {
  url?: string;
  visibleUrl?: string;
  titleNoFormatting?: string;
  contentNoFormatting?: string;
};

type CseElement = { execute(query: string): void };

type CseWindow = Window & {
  __gcse?: {
    parsetags?: string;
    callback?: () => void;
    searchCallbacks?: {
      web?: {
        ready?: (gname: string, query: string, promos: unknown[], results: CseResult[]) => boolean;
      };
    };
  };
  google?: {
    search?: {
      cse?: {
        element?: {
          render(config: { div: string; tag: string; gname: string; attributes?: Record<string, unknown> }): void;
          getElement(gname: string): CseElement | null;
        };
      };
    };
  };
};

const GNAME = 'vibeyaab';
const CONTAINER_ID = 'vibeyaab-cse';
const TIMEOUT_MS = 12000;

type Pending = { query: string; resolve: (results: CseResult[]) => void };

let ready: Promise<CseElement> | null = null;
let pending: Pending | null = null;
let queue: Promise<unknown> = Promise.resolve();

const cseWindow = (): CseWindow => window as CseWindow;

function ensureContainer(): HTMLElement {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.setAttribute('aria-hidden', 'true');
    // The Element is used as a data source only; VibeYaab renders the results itself.
    container.style.cssText =
      'position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);pointer-events:none;';
    document.body.appendChild(container);
  }
  return container;
}

/** Loads Google's script once and renders a hidden `searchresults-only` element. */
function loadElement(): Promise<CseElement> {
  if (ready) return ready;

  ready = new Promise<CseElement>((resolve, reject) => {
    const win = cseWindow();
    let settled = false;

    const init = () => {
      if (settled) return;
      const api = win.google?.search?.cse?.element;
      if (!api) return;
      settled = true;
      ensureContainer();
      api.render({
        div: CONTAINER_ID,
        tag: 'searchresults-only',
        gname: GNAME,
        attributes: { webSearchResultSetSize: 10, linkTarget: '_blank' },
      });
      const element = api.getElement(GNAME);
      if (element) resolve(element);
      else reject(new SourceError('network', 'Google search element unavailable'));
    };

    win.__gcse = {
      parsetags: 'explicit',
      callback: init,
      searchCallbacks: {
        web: {
          ready: (_gname, resultQuery, _promos, results) => {
            // Ignore late answers for searches that were cancelled or superseded.
            if (pending && pending.query.trim().toLowerCase() === resultQuery.trim().toLowerCase()) {
              pending.resolve(results ?? []);
              pending = null;
            }
            // Returning true stops Google from drawing its own markup.
            return true;
          },
        },
      },
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://cse.google.com/cse.js?cx=${encodeURIComponent(GOOGLE_CSE_ID)}`;
    script.onload = init;
    script.onerror = () => {
      settled = true;
      reject(new SourceError('network', 'Could not load Google Programmable Search'));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    ready = null;
    throw error;
  });

  return ready;
}

function executeQuery(element: CseElement, query: string, signal?: AbortSignal): Promise<CseResult[]> {
  return new Promise<CseResult[]>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending = null;
      reject(new SourceError('timeout', 'Google search timed out'));
    }, TIMEOUT_MS);
    const onAbort = () => {
      window.clearTimeout(timer);
      pending = null;
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    pending = {
      query,
      resolve: (results) => {
        window.clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(results);
      },
    };
    element.execute(query);
  });
}

const AWESOME_PREFIXES = AWESOME_LISTS.map((list) => normalizePath(list.url));

function normalizePath(url: string): string {
  return `${hostOf(url)}${new URL(url).pathname.toLowerCase()}`;
}

/** Maps a result URL to the directory it belongs to (for source badges and filters). */
function classify(url: string): { source: SourceId; label: string } {
  const host = hostOf(url);
  const normalized = `${host}${new URL(url).pathname.toLowerCase()}`;
  if (AWESOME_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return { source: 'awesome', label: 'Awesome list' };
  }
  if (host === 'github.com') return { source: 'github', label: 'GitHub' };
  if (host === 'youraiproject.com') return { source: 'youraiproject', label: 'YourAIProject' };
  if (host === 'opensaas.directory') return { source: 'opensaas', label: 'Open SaaS Directory' };
  if (host === 'onesvibe.app') return { source: 'onesvibe', label: 'One’s Vibe' };
  return { source: 'google', label: 'Google' };
}

function toResult(item: CseResult, index: number): SearchResult | null {
  if (!isHttpUrl(item.url)) return null;
  const title = decodeEntities(item.titleNoFormatting ?? '').trim();
  if (!title) return null;
  const { source, label } = classify(item.url);
  return {
    id: `google:${item.url}`,
    title,
    description: truncate(decodeEntities(item.contentNoFormatting ?? ''), 240),
    url: item.url,
    source,
    sourceLabel: label,
    isLive: null,
    isOpenSource: null,
    repositoryUrl: asRepositoryUrl(item.url),
    via: 'google',
    position: index,
  };
}

/**
 * Google Programmable Search Element, used in `searchresults-only` mode. Google's own
 * rendering is suppressed through the "results ready" callback so that its results can
 * join the unified list. Requests are serialised because the Element has one callback.
 */
export const googleCse: SearchSource = {
  id: 'google',
  label: { en: 'Google', fa: 'Google' },
  isEnabled: hasGoogleCse,
  search(query) {
    const run = async (): Promise<SearchResult[]> => {
      if (query.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const element = await loadElement();
      if (query.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const items = await executeQuery(element, query.q, query.signal);
      return items.map(toResult).filter((result): result is SearchResult => result !== null);
    };
    const task = queue.then(run, run);
    queue = task.catch(() => undefined);
    return task;
  },
};
