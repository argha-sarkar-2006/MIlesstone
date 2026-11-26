import React from "react";
import { ROLES } from "../../data/navigationData";
import { Icon } from "../shared/Icons";

export function SectionPlaceholderView({ activeRole, activeNav, onBackToOverview }) {
  const role = ROLES[activeRole];
  const allItems = role.navGroups.flatMap((g) => g.items);
  const current = allItems.find((item) => item.id === activeNav);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{current?.label || "Section"}</h1>
          <p className="page-subtitle">
            {role.workspaceName} · {role.roleBadge} workspace
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onBackToOverview}>
          <span>Back to Overview</span>
        </button>
      </div>

      <section className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span className="row-icon-badge badge-blue-soft">
            <Icon name={current?.icon || "folder"} size={16} />
          </span>
          <h2 className="card-title">{current?.label} workspace view</h2>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--text-secondary)" }}>
          This navigation route is wired for the {role.label} dashboard. Return to{" "}
          <strong>Overview</strong> to inspect the full Figma-matched dashboard layout.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={onBackToOverview}>
          Return to Overview
        </button>
      </section>
    </div>
  );
}
