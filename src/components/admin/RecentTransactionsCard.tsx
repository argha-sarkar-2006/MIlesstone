import React from "react";
import { Icon } from "../shared/Icons";
import { StatusPill } from "../shared/StatusPill";
import type { AdminTransaction } from "../../types/dashboard";

const TXN_ICON_MAP = {
  release: "arrowUpRight",
  funding: "arrowDownLeft",
  pending: "clock",
  failed: "alert",
  refund: "rotateCcw",
};

export function RecentTransactionsCard({ transactions, onViewAll }: { transactions: AdminTransaction[]; onViewAll: () => void }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Recent transactions</h2>
        <button type="button" className="card-link" onClick={onViewAll}>
          <span>Escrow &amp; Payments</span>
          <Icon name="chevronRight" size={14} />
        </button>
      </div>

      <div className="list-rows">
        {transactions.map((txn, idx) => (
          <div className="list-row" key={idx}>
            <div className="list-row-left">
              <span className={`row-icon-badge badge-${txn.iconTone}-soft`}>
                <Icon name={TXN_ICON_MAP[txn.type as keyof typeof TXN_ICON_MAP] || "clock"} size={14} />
              </span>
              <div className="row-text">
                <div className="row-title">{txn.title}</div>
                <div className="row-sub">{txn.sub}</div>
              </div>
            </div>

            <div className="row-right">
              <StatusPill label={txn.status.label} tone={txn.status.tone} />
              <div className="amount-stack">
                <div className="amount-main">{txn.amount}</div>
                <div className="amount-sub">{txn.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
