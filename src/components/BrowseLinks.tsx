import { useI18n } from '../i18n';
import { AWESOME_LISTS, DIRECTORIES, GITHUB_TOPICS, githubSearchUrl, type CuratedLink } from '../sources/links';
import { ExternalIcon } from './Icons';
import { ExternalLink } from './Link';

function LinkGroup({ title, links }: { title: string; links: CuratedLink[] }) {
  return (
    <div className="link-group">
      <h3 className="link-group-title">{title}</h3>
      <ul className="link-list">
        {links.map((link) => (
          <li key={link.id}>
            <ExternalLink href={link.url} className="pill-link" dir="ltr">
              {link.name}
              <ExternalIcon />
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Curated links for places VibeYaab does not query directly. */
export function BrowseLinks({ query }: { query?: string }) {
  const { t } = useI18n();
  return (
    <div className="browse">
      {query && (
        <ExternalLink href={githubSearchUrl(query)} className="button button-secondary browse-github">
          {t('browse.searchGithub', { q: query })}
          <ExternalIcon />
        </ExternalLink>
      )}
      <LinkGroup title={t('browse.directories')} links={DIRECTORIES} />
      <LinkGroup title={t('browse.topics')} links={GITHUB_TOPICS} />
      <LinkGroup title={t('browse.awesome')} links={AWESOME_LISTS} />
    </div>
  );
}
