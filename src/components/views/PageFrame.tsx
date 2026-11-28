import { useMemo } from "react";
import { Icon } from "../shared/Icons";
import type { RolePageAction } from "../../roles/roleTypes";

export type PageRecord = {
  primary: string;
  secondary: string;
  status: string;
  amount?: string;
  detail?: string;
  actionLabel?: string;
};

export type WorkspacePageDefinition = {
  title: string;
  description: string;
  metrics: { label: string; value: string; note: string }[];
  records: PageRecord[];
  primaryAction?: { label: string; title: string; description: string; confirmLabel: string };
  rowAction?: { title: string; description: string; confirmLabel: string };
  icon?: string;
};

type Props = {
  page: WorkspacePageDefinition;
  searchQuery: string;
  onAction: (modal: RolePageAction) => void;
};

export function PageFrame({ page, searchQuery, onAction }: Props) {
  const records = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return query
      ? page.records.filter((record) => Object.values(record).some((value) => value?.toLocaleLowerCase().includes(query)))
      : page.records;
  }, [page.records, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{page.title}</h1><p className="page-subtitle">{page.description}</p></div>
        {page.primaryAction && <button className="btn btn-primary" onClick={() => onAction({
          title: page.primaryAction!.title,
          description: page.primaryAction!.description,
          confirmLabel: page.primaryAction!.confirmLabel,
        })}><Icon name="plus" size={14} /><span>{page.primaryAction.label}</span></button>}
      </div>
      <div className="role-page-summary">
        {page.metrics.map((metric) => <div className="card role-summary-card" key={metric.label}>
          <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small>
        </div>)}
      </div>
      <section className="card role-records-card">
        <div className="role-records-heading">
          <div><h2 className="card-title">{page.title}</h2><p>Workspace records · local demo data</p></div>
          <span className="role-demo-badge">DEMO DATA</span>
        </div>
        <div className="role-record-list">
          {records.length === 0 ? <div className="role-empty-state">No records match “{searchQuery}”. Try a different search.</div> : records.map((record, index) => (
            <article className="role-record-row" key={record.primary + "-" + index}>
              <div className="role-record-icon"><Icon name={page.icon ?? "folder"} size={16} /></div>
              <div className="role-record-main"><strong>{record.primary}</strong><span>{record.secondary}</span>{record.detail && <small>{record.detail}</small>}</div>
              <div className="role-record-meta"><span className="role-status-pill">{record.status}</span>{record.amount && <strong>{record.amount}</strong>}</div>
              {(record.actionLabel || page.rowAction) && <button className="btn btn-secondary btn-sm" onClick={() => onAction({
                title: (page.rowAction?.title ?? "Open record").replace("{record}", record.primary),
                description: (page.rowAction?.description ?? "Review this workspace record.").replace("{record}", record.primary).replace("{detail}", record.detail ?? record.secondary),
                confirmLabel: page.rowAction?.confirmLabel ?? record.actionLabel ?? "Open details",
              })}>{record.actionLabel ?? "Open"}</button>}
            </article>
          ))}
        </div>
      </section>
      <p className="role-integrity-note"><Icon name="lock" size={13} /> Demo actions are previews only. Settlement still requires its independent authorization workflow.</p>
    </div>
  );
}
