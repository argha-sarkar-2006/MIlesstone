import React from "react";
import { ADMIN_DATA } from "../../data/adminData";

type ChartData = (typeof ADMIN_DATA.escrow.chartByRange)["30d"];
export function FundedReleasedChart({ data, policyNote }: { data: ChartData; policyNote: string }) {
  return (
    <div className="chart-pane">
      <div className="chart-header">
        <h2 className="card-title">Funded vs released</h2>
        <div className="chart-legend">
          <span className="chart-legend-item">
            <span className="legend-dot" style={{ backgroundColor: "#0F9D6E" }} />
            <span>Funded</span>
          </span>
          <span className="chart-legend-item">
            <span className="legend-dot" style={{ backgroundColor: "#1D5CE5" }} />
            <span>Released</span>
          </span>
        </div>
      </div>

      <div className="bar-chart" role="img" aria-label="Monthly funded versus released funds">
        {data.map((item) => (
          <div className="bar-group" key={item.month}>
            <div className="bar-pair">
              <div
                className="bar-col bar-funded"
                style={{ height: `${item.funded}%` }}
                title={`${item.month} Funded: ${item.funded}%`}
              />
              <div
                className="bar-col bar-released"
                style={{ height: `${item.released}%` }}
                title={`${item.month} Released: ${item.released}%`}
              />
            </div>
            <span className="bar-month">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="info-callout">{policyNote}</div>
    </div>
  );
}
