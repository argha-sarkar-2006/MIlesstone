import React from "react";
import { Icon } from "../shared/Icons";
import type { AdminAttention } from "../../types/dashboard";

export function NeedsAttentionCard({ items, onViewAll, onSelectItem }: { items: AdminAttention[]; onViewAll: () => void; onSelectItem: (item: AdminAttention) => void }) {
  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Needs attention</h2>
          <span className="count-chip count-chip-red">{items.length}</span>
        </div>
        <button type="button" className="card-link" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="list-rows">
        {items.map((item, idx) => (
          <div
            className="list-row"
            key={idx}
            style={{ cursor: "pointer" }}
            onClick={() => onSelectItem(item)}
          >
            <div className="list-row-left">
              <span className={`row-icon-badge badge-${item.tone}-soft`}>
                <Icon name={item.icon === "card" ? "creditCard" : item.icon} size={14} />
              </span>
              <div className="row-text">
                <div className="row-title">{item.title}</div>
                <div className="row-sub">{item.sub}</div>
              </div>
            </div>
            <div className="amount-main">{item.amount}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
