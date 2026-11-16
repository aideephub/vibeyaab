import type { ReactNode, SVGProps } from 'react';
import { cx } from '../lib/utils';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Mirror horizontally in right-to-left layouts (directional icons). */
  mirror?: boolean;
};

function Icon({ mirror, className, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cx('icon', mirror && 'icon-mirror', className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => (
  <Icon mirror {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const ExternalIcon = (props: IconProps) => (
  <Icon mirror {...props}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Icon>
);

export const BookmarkIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <Icon {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6 4h12v17l-6-4-6 4z" />
  </Icon>
);

export const SettingsIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ChevronIcon = (props: IconProps) => (
  <Icon mirror {...props}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const CodeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
  </Icon>
);

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 10v4M12 17.5v.01" />
  </Icon>
);

export const OfflineIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-8.5-3.7M5 12.9a10 10 0 0 1 3-1.9M19 12.9a10 10 0 0 0-3.4-2M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
  </Icon>
);

export const InboxIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 13 6.5 5h11L20 13M4 13v6h16v-6M4 13h5l1 2h4l1-2h5" />
  </Icon>
);

export const DownloadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
  </Icon>
);

export const UploadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 16V5M7 9l5-5 5 5M5 20h14" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Icon>
);

export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5v.01" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12 5 5 9-10" />
  </Icon>
);

export const SendIcon = (props: IconProps) => (
  <Icon mirror {...props}>
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
  </Icon>
);
