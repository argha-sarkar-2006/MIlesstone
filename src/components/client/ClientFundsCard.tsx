import React from "react";
import { Icon } from "../shared/Icons";
import { CLIENT_DATA } from "../../data/clientData";

export function ClientFundsCard({ funds, onFundClick }: { funds: typeof CLIENT_DATA.funds; onFundClick: () => void }) {
  return (
    <section className="card" style={{ padding: "16px 20px 18px" }}>
      <h2 className="card-title" style={{ marginBottom: 10 }}>
        Your funds
      </h2>

      <div className="escrow-kicker">
        <Icon name="lock" size={13} />
        <span>Held by payment partner</span>
      </div>

      <div className="escrow-hero" style={{ marginBottom: 12 }}>
        {funds.heldAmount}
      </div>

      <div className="stacked-bar" aria-label="Client escrow allocation">
        {funds.segments.map((seg, idx) => (
          <span
            key={idx}
            className="stacked-bar-seg"
            style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>

      <div className="breakdown-list">
        {funds.breakdown.map((row) => (
          <div className="breakdown-row" key={row.label}>
            <div className="breakdown-left">
              <span className="legend-dot" style={{ backgroundColor: row.color }} />
              <span>{row.label}</span>
            </div>
            <span className="breakdown-val">{row.amount}</span>
          </div>
        ))}
      </div>

      <button type="button" className="funding-alert-box" onClick={onFundClick}>
        <div>
          <div className="funding-alert-title">{funds.alertTitle}</div>
          <div className="funding-alert-sub">{funds.alertSubtitle}</div>
        </div>
        <Icon name="chevronRight" size={16} />
      </button>
    </section>
  );
}
