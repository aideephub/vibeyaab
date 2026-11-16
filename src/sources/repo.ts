/** Helpers for recognising source-code hosting URLs. */
const CODE_HOSTS = new Set(['github.com', 'gitlab.com', 'codeberg.org', 'bitbucket.org']);
const RESERVED_FIRST_SEGMENTS = new Set([
  'topics',
  'search',
  'orgs',
  'collections',
  'sponsors',
  'marketplace',
  'features',
  'about',
  'pricing',
  'explore',
  'trending',
  'settings',
  'login',
  'signup',
  'issues',
  'pulls',
  'users',
]);

/** Returns the URL if it points at a repository (owner/name), otherwise `null`. */
export function asRepositoryUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!CODE_HOSTS.has(host)) return null;
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2 || RESERVED_FIRST_SEGMENTS.has(segments[0].toLowerCase())) return null;
    return `${parsed.origin}/${segments[0]}/${segments[1]}`;
  } catch {
    return null;
  }
}

/** Whether the URL itself is a repository root page (not a deeper file or a demo site). */
export function isRepositoryRoot(url: string): boolean {
  const repo = asRepositoryUrl(url);
  if (!repo) return false;
  try {
    return new URL(url).pathname.split('/').filter(Boolean).length === 2;
  } catch {
    return false;
  }
}
