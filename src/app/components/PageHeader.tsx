import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-description">{description}</div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
