import React from "react";
import { Icon } from "../shared/Icons";
import type { ClientReview } from "../../types/dashboard";

export function WaitingForReviewCard({ items, onReview }: { items: ClientReview[]; onReview: (item: ClientReview) => void }) {
  return (
    <section className="card">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Waiting for your review</h2>
          <span className="count-chip count-chip-blue">{items.length}</span>
        </div>
        <span className="card-header-meta tabular">$30,300 awaiting your decision</span>
      </div>

      <div className="list-rows">
        {items.map((item) => (
          <div className="review-item" key={item.id}>
            <div className="review-item-left">
              <span className="review-circle" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" fill="#CBD5E1" />
                </svg>
              </span>

              <div className="row-text">
                <div className="row-title">{item.title}</div>
                <div className="row-sub">
                  {item.project} · {item.freelancer} · {item.submittedText}
                </div>
                <div className="review-progress-line">
                  <div className="mini-track">
                    <div
                      className="mini-fill-amber"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <Icon name="clock" size={12} />
                  <span>{item.metaText}</span>
                </div>
              </div>
            </div>

            <div className="row-right">
              <div className="amount-stack">
                <div className="amount-main">{item.amount}</div>
                <div className="amount-sub">released on approval</div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onReview(item)}
              >
                <span>Review</span>
                <Icon name="arrowRight" size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
