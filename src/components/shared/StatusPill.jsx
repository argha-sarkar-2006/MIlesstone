import React from "react";

export function StatusPill({ label, tone = "neutral", showDot = true }) {
  return (
    <span className={`status-pill status-${tone}`}>
      {showDot && <span className="status-dot" />}
      <span>{label}</span>
    </span>
  );
}
