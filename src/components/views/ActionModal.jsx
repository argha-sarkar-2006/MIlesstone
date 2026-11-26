import React from "react";
import { Icon } from "../shared/Icons";

export function ActionModal({ modal, onClose, onConfirm }) {
  if (!modal) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">{modal.title}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: 30, padding: 0 }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: "0 0 12px" }}>{modal.description}</p>
          {modal.bullets && modal.bullets.length > 0 && (
            <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
              {modal.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {modal.meta && (
            <div className="info-callout" style={{ marginTop: 8 }}>
              {modal.meta}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {modal.secondaryLabel && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onConfirm(modal.secondaryLabel)}
            >
              {modal.secondaryLabel}
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onConfirm(modal.confirmLabel || "Done")}
          >
            {modal.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
