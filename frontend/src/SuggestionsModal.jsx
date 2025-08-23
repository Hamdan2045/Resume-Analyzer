import React from "react";

export function SuggestionsModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h4>{row.resumeName}</h4>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          {row.suggestions?.length ? (
            <ul className="bullets">
              {row.suggestions.map((s, i) => <li key={i}>💡 {s}</li>)}
            </ul>
          ) : (
            <p className="muted">No suggestions stored.</p>
          )}
        </div>
      </div>
    </div>
  );
}
