import React from "react";
import { Icon } from "../shared/Icons";
import type { FreelancerAgreement } from "../../types/dashboard";

export function AgreementToReviewCard({ agreement, onReviewSign, onAskQuestion }: { agreement: FreelancerAgreement; onReviewSign: () => void; onAskQuestion: () => void }) {
  return (
    <section className="card" style={{ padding: "16px 20px 18px" }}>
      <h2 className="card-title" style={{ marginBottom: 14 }}>
        Agreement to review
      </h2>

      <div className="agreement-header-block">
        <span className="agreement-icon-tile">
          <Icon name="pen" size={16} />
        </span>
        <div>
          <div className="row-title">{agreement.title}</div>
          <div className="row-sub">{agreement.sub}</div>
        </div>
      </div>

      <div className="kv-list">
        {agreement.specs.map((spec) => (
          <div className="kv-row" key={spec.label}>
            <span className="kv-label">{spec.label}</span>
            <span className="kv-value">{spec.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onReviewSign}
        >
          Review &amp; sign
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onAskQuestion}
        >
          Ask a question
        </button>
      </div>
    </section>
  );
}
