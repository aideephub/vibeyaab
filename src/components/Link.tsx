import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../lib/router';

/** Internal link: plain left-clicks navigate without a page reload; modified clicks behave natively. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...rest} />;
}

/** Link to an external page: always a new tab, never leaking the opener. */
export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}
