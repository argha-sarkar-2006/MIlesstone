import React from "react";
import { Icon } from "../shared/Icons";
import { ADMIN_DATA } from "../../data/adminData";

export function EscrowOverviewCard({ escrow }: { escrow: typeof ADMIN_DATA.escrow }) {
  return (
    <div className="escrow-pane">
      <div className="escrow-kicker">
        <Icon name="lock" size={14} />
        <span>Funds held by payment partner</span>
      </div>

      <div className="escrow-hero">{escrow.totalHeld}</div>
      <div className="escrow-sub">
        {escrow.fundedAgreementsNote} · {escrow.unfundedNote}
      </div>

      <div className="stacked-bar" aria-label="Escrow allocation breakdown">
        {escrow.segments.map((seg, idx) => (
          <span
            key={idx}
            className="stacked-bar-seg"
            style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>

      <div className="breakdown-list">
        {escrow.breakdown.map((row) => (
          <div className="breakdown-row" key={row.label}>
            <div className="breakdown-left">
              <span className="legend-dot" style={{ backgroundColor: row.color }} />
              <span>{row.label}</span>
            </div>
            <span className="breakdown-val">{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
