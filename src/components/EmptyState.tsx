import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="state-icon">{icon}</div>
      <h2 className="state-title">{title}</h2>
      <p className="state-body">{body}</p>
      {children && <div className="state-actions">{children}</div>}
    </div>
  );
}
