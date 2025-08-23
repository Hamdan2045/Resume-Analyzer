import React, { useEffect, useState } from "react";
import { SuggestionsModal } from "./SuggestionsModal.jsx";
import "./ReportsTable.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ReportsTable() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchRows = async () => {
  try {
    const res = await fetch(`${API}/analysis`, { credentials: "include" });
    if (!res.ok) {
      setRows([]); // 401 when logged out
      return;
    }
    const data = await res.json().catch(() => ({}));
    const list = data.items || data.reports || []; // <-- accept both
    setRows(Array.isArray(list) ? list : []);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchRows();
    const onChanged = () => fetchRows();
    window.addEventListener("analysis:changed", onChanged);
    return () => window.removeEventListener("analysis:changed", onChanged);
  }, []);

  const remove = async (id) => {
    await fetch(`${API}/analysis/${id}`, { method: "DELETE", credentials: "include" });
    setRows((x) => x.filter((r) => r._id !== id));
  };

  if (loading) return null;

  return (
    <section className="reports">
      <h3 className="d-title" style={{ marginTop: 24, marginLeft:500}}>Your previous analyses</h3>

      {rows.length === 0 ? (
        <p className="muted">No reports yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Resume</th>
                <th>Score</th>
                <th>Download</th>
                <th>Details</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.resumeName}</td>
                  <td>{r.score}</td>
                  <td>
                    {r.improvedResumeUrl ? (
                      <a className="link" target="_blank" href={r.improvedResumeUrl} download>Download</a>
                    ) : "—"}
                  </td>
                  <td>
                    <button className="link" onClick={() => setOpen(r)}>
                      View Suggestions
                    </button>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => remove(r._id)} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SuggestionsModal row={open} onClose={() => setOpen(null)} />
    </section>
  );
}
