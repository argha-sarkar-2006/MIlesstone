import React from "react";

export function StatusPill({ label, tone = "neutral", showDot = true }: { label: string; tone?: string; showDot?: boolean }) {
  return (
    <span className={`status-pill status-${tone}`}>
      {showDot && <span className="status-dot" />}
      <span>{label}</span>
    </span>
  );
}
