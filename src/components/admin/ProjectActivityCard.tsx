import React from "react";
import type { AdminActivity } from "../../types/dashboard";

export function ProjectActivityCard({ activities }: { activities: AdminActivity[] }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Project activity</h2>
      </div>

      <div className="list-rows">
        {activities.map((item, idx) => (
          <div className="activity-row" key={idx}>
            <span className={`avatar-sm ${item.tone}`}>{item.initials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="activity-body">
                <strong>{item.actor}</strong> {item.action} <strong>{item.target}</strong>
              </div>
              <div className="activity-meta">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
