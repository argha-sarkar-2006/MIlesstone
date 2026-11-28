import React from "react";
import { Icon } from "../shared/Icons";
import { SegmentedBar } from "../shared/SegmentedBar";
import { StatusPill } from "../shared/StatusPill";
import type { AdminProject } from "../../types/dashboard";

export function ActiveProjectsTable({ projects, onViewAll }: { projects: AdminProject[]; onViewAll: () => void }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Active projects</h2>
        <button type="button" className="card-link" onClick={onViewAll}>
          <span>All 24 projects</span>
          <Icon name="chevronRight" size={14} />
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Milestones</th>
              <th>Funded / Value</th>
              <th>Next due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.name}>
                <td>
                  <div className="cell-title">{proj.name}</div>
                  <div className="cell-sub">{proj.client}</div>
                </td>
                <td style={{ minWidth: 130 }}>
                  <SegmentedBar
                    completed={proj.completed}
                    active={proj.active}
                    total={proj.total}
                    activeTone={proj.activeTone || "active"}
                    label={proj.ratio}
                  />
                </td>
                <td className="tabular" style={{ whiteSpace: "nowrap" }}>
                  <strong>{proj.funded}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>/ {proj.totalValue}</span>
                </td>
                <td className="tabular" style={{ whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                  {proj.nextDue}
                </td>
                <td>
                  <StatusPill label={proj.status.label} tone={proj.status.tone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
