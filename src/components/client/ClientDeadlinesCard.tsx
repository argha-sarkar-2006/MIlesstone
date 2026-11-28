import React from "react";
import { StatusPill } from "../shared/StatusPill";
import type { ClientDeadline } from "../../types/dashboard";

export function ClientDeadlinesCard({ deadlines }: { deadlines: ClientDeadline[] }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Upcoming deadlines</h2>
      </div>

      <div className="list-rows">
        {deadlines.map((item, idx) => (
          <div className="deadline-row" key={idx}>
            <span className="deadline-date-label">{item.date}</span>
            <div className="row-text">
              <div className="row-title">{item.title}</div>
              <div className="row-sub">{item.project}</div>
            </div>
            <StatusPill label={item.owner.label} tone={item.owner.tone} />
          </div>
        ))}
      </div>
    </section>
  );
}
