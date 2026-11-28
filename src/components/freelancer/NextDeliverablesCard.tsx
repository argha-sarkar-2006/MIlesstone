import React from "react";
import { StatusPill } from "../shared/StatusPill";
import type { FreelancerDeliverable } from "../../types/dashboard";

export function NextDeliverablesCard({ deliverables, onAction }: { deliverables: FreelancerDeliverable[]; onAction: (item: FreelancerDeliverable) => void }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Your next deliverables</h2>
        <span className="card-header-meta">Ordered by what needs you first</span>
      </div>

      <div className="list-rows">
        {deliverables.map((item) => (
          <div className="deliverable-item" key={item.id}>
            <div className="deliverable-main">
              <div className="deliverable-title-row">
                <span className="row-title">{item.title}</span>
                <StatusPill label={item.status.label} tone={item.status.tone} />
              </div>

              <div className="row-sub" style={{ marginTop: 4 }}>
                {item.projectLine}
              </div>

              {item.quote && <div className="feedback-quote">{item.quote}</div>}
              {item.note && <div className="deliverable-note">{item.note}</div>}
            </div>

            <div className="deliverable-right">
              <div className="amount-stack">
                <div className="amount-main">{item.amount}</div>
                <div className="amount-sub">{item.dueText}</div>
              </div>

              <button
                type="button"
                className={`btn btn-sm ${
                  item.actionVariant === "primary" ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => onAction(item)}
              >
                {item.actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
