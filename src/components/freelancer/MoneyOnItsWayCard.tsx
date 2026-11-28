import React from "react";
import { FREELANCER_DATA } from "../../data/freelancerData";

export function MoneyOnItsWayCard({ data, onViewEarnings }: { data: typeof FREELANCER_DATA.moneyOnItsWay; onViewEarnings: () => void }) {
  return (
    <section className="card" style={{ padding: "16px 20px 18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 className="card-title">Money on its way</h2>
        <button type="button" className="card-link" onClick={onViewEarnings}>
          Earnings
        </button>
      </div>

      <div className="meta-label">Pending payouts</div>
      <div className="payout-hero">{data.pendingAmount}</div>
      <div className="payout-upside">{data.upsideText}</div>

      <div className="breakdown-list" style={{ gap: 12 }}>
        {data.items.map((item) => (
          <div className="breakdown-row" style={{ alignItems: "flex-start" }} key={item.label}>
            <div className="breakdown-left" style={{ alignItems: "flex-start" }}>
              <span
                className="legend-dot"
                style={{ backgroundColor: item.dotColor, marginTop: 5 }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 12.5 }}>
                  {item.label}
                </div>
                <div className="row-sub">{item.sub}</div>
              </div>
            </div>
            <span className="breakdown-val">{item.amount}</span>
          </div>
        ))}
      </div>

      <div className="payout-divider">
        <span style={{ color: "var(--text-muted)" }}>Approved this year</span>
        <strong className="tabular" style={{ color: "var(--text-primary)" }}>
          {data.approvedYear}
        </strong>
      </div>
    </section>
  );
}
