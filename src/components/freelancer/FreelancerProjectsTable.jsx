import React from "react";
import { Icon } from "../shared/Icons";
import { SegmentedBar } from "../shared/SegmentedBar";
import { StatusPill } from "../shared/StatusPill";

export function FreelancerProjectsTable({ projects, onViewAll }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">My projects</h2>
        <button type="button" className="card-link" onClick={onViewAll}>
          <span>All</span>
          <Icon name="chevronRight" size={14} />
        </button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Agreement</th>
              <th>Milestones</th>
              <th>Deadline</th>
              <th>Funding</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.name}>
                <td>
                  <div className="cell-title">{proj.name}</div>
                  <div className="cell-sub">{proj.client}</div>
                </td>
                <td>
                  <StatusPill label={proj.agreement.label} tone={proj.agreement.tone} />
                </td>
                <td style={{ minWidth: 112 }}>
                  <SegmentedBar
                    completed={proj.completed}
                    active={proj.active}
                    total={proj.total}
                    label={proj.ratio}
                  />
                </td>
                <td className="tabular" style={{ whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                  {proj.deadline}
                </td>
                <td>
                  <StatusPill label={proj.funding.label} tone={proj.funding.tone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
