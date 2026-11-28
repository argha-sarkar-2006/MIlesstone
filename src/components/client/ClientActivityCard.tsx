import React from "react";
import type { ClientActivity } from "../../types/dashboard";

export function ClientActivityCard({ activities }: { activities: ClientActivity[] }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Recent activity</h2>
      </div>

      <div className="list-rows">
        {activities.map((item, idx) => (
          <div className="activity-time-row" key={idx}>
            <span className="activity-time-label">{item.time}</span>
            <div>
              {item.segments.map((seg, i) =>
                seg.bold ? (
                  <strong key={i}>{seg.text}</strong>
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
