import { useI18n } from '../i18n';
import { bookmarkIdFor, toggleBookmark, useBookmarks } from '../lib/bookmarks';
import { pushToast } from '../lib/toast';
import { cx } from '../lib/utils';
import type { SearchResult } from '../sources/types';
import { BookmarkIcon } from './Icons';

export function BookmarkButton({ result }: { result: SearchResult }) {
  const { t } = useI18n();
  const { ids } = useBookmarks();
  const saved = ids.has(bookmarkIdFor(result.url));
  const label = t(saved ? 'card.unbookmark' : 'card.bookmark', { title: result.title });

  return (
    <button
      type="button"
      className={cx('icon-button bookmark-button', saved && 'is-saved')}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => {
        const added = toggleBookmark(result);
        pushToast(t(added ? 'toast.added' : 'toast.removed'), 'success');
      }}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}
