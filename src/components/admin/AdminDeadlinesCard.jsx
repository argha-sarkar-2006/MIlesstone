import React from "react";

const STATUS_COLOR = {
  red: "#DC2626",
  blue: "#1D5CE5",
  amber: "#D97706",
  green: "#0F9D6E",
};

export function AdminDeadlinesCard({ deadlines }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Upcoming deadlines</h2>
        <span className="card-header-meta">Next 21 days</span>
      </div>

      <div className="list-rows">
        {deadlines.map((item, idx) => (
          <div className="list-row" key={idx}>
            <div className="list-row-left">
              <div className="date-chip">
                <div className="date-chip-day">{item.day}</div>
                <div className="date-chip-num">{item.num}</div>
                <div className="date-chip-mon">{item.mon}</div>
              </div>
              <div className="row-text">
                <div className="row-title">{item.title}</div>
                <div className="row-sub">{item.project}</div>
              </div>
            </div>

            <div className="amount-stack">
              <div className="amount-main">{item.amount}</div>
              <div
                className="amount-sub"
                style={{ color: STATUS_COLOR[item.statusTone] || "var(--text-muted)", fontWeight: 500 }}
              >
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
