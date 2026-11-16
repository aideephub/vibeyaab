import { useI18n } from '../i18n';
import { ExternalLink } from './Link';
import { BookmarkButton } from './BookmarkButton';
import { CodeIcon, ExternalIcon } from './Icons';
import { SourceBadge } from './SourceBadge';
import type { SearchResult } from '../sources/types';

/** One result. Facts such as "live" or "open source" are shown only when the source provided them. */
export function ResultCard({ result, savedAt }: { result: SearchResult; savedAt?: string }) {
  const { t, formatRelative, formatNumber } = useI18n();

  const freshness = (() => {
    const [iso, key] = savedAt
      ? ([savedAt, 'card.saved'] as const)
      : result.createdAt
        ? ([result.createdAt, 'card.added'] as const)
        : ([result.updatedAt, 'card.updated'] as const);
    const when = formatRelative(iso);
    return when ? t(key, { when }) : null;
  })();

  const upvotes =
    typeof result.upvotes === 'number' && result.upvotes > 0
      ? result.upvotes === 1
        ? t('card.upvote1')
        : t('card.upvotes', { n: formatNumber(result.upvotes) })
      : null;

  const hasTags =
    Boolean(result.category || result.aiTool || result.repositoryUrl) ||
    typeof result.isLive === 'boolean' ||
    result.isOpenSource === true;
  const hasRepoLink = Boolean(result.repositoryUrl) && result.repositoryUrl !== result.url;
  const secondaryHref = hasRepoLink ? result.repositoryUrl : result.sourceUrl;

  return (
    <article className="card" data-source={result.source}>
      <div className="card-top">
        <SourceBadge source={result.source} rawLabel={result.sourceLabel} via={result.via} />
        <BookmarkButton result={result} />
      </div>

      <h3 className="card-title" dir="auto">
        <ExternalLink href={result.url} className="card-title-link">
          {result.title}
          <ExternalIcon className="card-title-icon" />
          <span className="sr-only"> {t('card.newTab')}</span>
        </ExternalLink>
      </h3>

      {result.description && (
        <p className="card-description" dir="auto">
          {result.description}
        </p>
      )}

      {hasTags && (
        <ul className="tags">
          {result.category && (
            <li className="tag" dir="auto">
              {result.category}
            </li>
          )}
          {result.aiTool && (
            <li className="tag" dir="auto">
              {result.aiTool}
            </li>
          )}
          {result.isLive === true && <li className="tag tag-positive">{t('card.tagLive')}</li>}
          {result.isLive === false && <li className="tag tag-warning">{t('card.tagOffline')}</li>}
          {result.isOpenSource === true && <li className="tag tag-positive">{t('card.tagOss')}</li>}
          {result.repositoryUrl && <li className="tag">{t('card.tagRepo')}</li>}
        </ul>
      )}

      {(freshness || upvotes) && (
        <p className="card-meta">
          {freshness && <span>{freshness}</span>}
          {freshness && upvotes && <span aria-hidden="true">·</span>}
          {upvotes && <span>{upvotes}</span>}
        </p>
      )}

      <div className="card-actions">
        <ExternalLink
          href={result.url}
          className="button button-primary button-sm"
          aria-label={t('card.openLabel', { title: result.title })}
        >
          {t('card.open')}
          <ExternalIcon />
        </ExternalLink>
        {secondaryHref && (
          <ExternalLink href={secondaryHref} className="button button-secondary button-sm">
            {hasRepoLink && <CodeIcon />}
            {hasRepoLink ? t('card.repository') : t('card.listing')}
            <ExternalIcon />
          </ExternalLink>
        )}
      </div>
    </article>
  );
}
