import React from "react";
import { Icon } from "../shared/Icons";
import { SegmentedBar } from "../shared/SegmentedBar";
import { StatusPill } from "../shared/StatusPill";

export function ClientProjectsGrid({ projects, onViewAll }) {
  return (
    <section>
      <div className="section-header-row">
        <h2 className="card-title">My projects</h2>
        <button type="button" className="card-link" onClick={onViewAll}>
          <span>All projects</span>
          <Icon name="chevronRight" size={14} />
        </button>
      </div>

      <div className="client-projects-grid">
        {projects.map((proj) => (
          <article className="card project-card" key={proj.name}>
            <div className="project-card-top">
              <div>
                <div className="cell-title">{proj.name}</div>
                <div className="cell-sub">{proj.organization}</div>
              </div>
              <div className="avatar-stack" aria-hidden="true">
                {Array.from({ length: proj.avatars }).map((_, i) => (
                  <span className="avatar-dot" key={i} />
                ))}
              </div>
            </div>

            <SegmentedBar segments={proj.segments} label={proj.percent} />

            <div className="project-meta-grid">
              <div>
                <div className="meta-label">Current</div>
                <div className="meta-value">{proj.current}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="meta-label">Next deadline</div>
                <div className="meta-value">{proj.nextDeadline}</div>
              </div>
            </div>

            <div className="project-card-footer">
              <StatusPill label={proj.status.label} tone={proj.status.tone} />
              <span className="milestone-ratio">{proj.fundingText}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
