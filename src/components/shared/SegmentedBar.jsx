import React from "react";

export function SegmentedBar({
  completed = 0,
  active = 0,
  total = 4,
  activeTone = "active",
  segments: explicitSegments,
  label,
}) {
  const segList =
    explicitSegments ||
    Array.from({ length: total }, (_, idx) => {
      if (idx < completed) return "done";
      if (idx < completed + active) return activeTone;
      return "empty";
    });

  return (
    <div className="milestone-bar-wrap">
      <div className="milestone-segments">
        {segList.map((state, index) => (
          <span
            key={index}
            className={`milestone-seg ${state !== "empty" ? state : ""}`}
          />
        ))}
      </div>
      {label && <span className="milestone-ratio">{label}</span>}
    </div>
  );
}
