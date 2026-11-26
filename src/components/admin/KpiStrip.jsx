import React from "react";

export function KpiStrip({ items }) {
  return (
    <section className="kpi-strip" aria-label="Organization metrics">
      {items.map((kpi) => (
        <div className="kpi-card" key={kpi.label}>
          <div className="kpi-label">{kpi.label}</div>
          <div className="kpi-value-row">
            <span className="kpi-value">{kpi.value}</span>
            {kpi.delta && <span className="kpi-delta">{kpi.delta}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}
