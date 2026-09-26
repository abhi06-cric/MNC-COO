import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function DashboardOverview() {
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("Checking...");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/companies`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${API_BASE_URL}/api/candidates`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${API_BASE_URL}/api/health`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    ])
      .then(([comp, cand, api]) => {
        setCompanies(Array.isArray(comp) ? comp : []);
        setCandidates(Array.isArray(cand) ? cand : []);
        setDbStatus(api ? "Connected & Healthy" : "Offline / Check Server");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Executive Operations Dashboard</h1>
          <p>Real-time corporate registry telemetry, candidate pipelines, and enterprise systems oversight.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/companies" className="btn-primary-action">
            + Manage Companies
          </Link>
          <Link to="/candidates" className="btn-primary-action" style={{ background: "var(--color-primary-light)" }}>
            + Manage Candidates
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Registered Enterprises</h3>
            <div className="stat-value">{loading ? "..." : companies.length}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Executive Candidates</h3>
            <div className="stat-value">{loading ? "..." : candidates.length}</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Boardroom Meetings</h3>
            <div className="stat-value">3</div>
          </div>
          <div className="stat-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>MongoDB Database</h3>
            <div style={{ fontSize: "14px", fontWeight: "700", color: dbStatus.includes("Healthy") ? "var(--color-success)" : "var(--color-danger)", marginTop: "8px" }}>
              {dbStatus}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ color: dbStatus.includes("Healthy") ? "var(--color-success)" : "var(--color-danger)", background: "#ecfdf5" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Two Column Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Companies Summary */}
        <div className="table-card">
          <div className="table-toolbar">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", color: "var(--color-primary)" }}>
              Recently Listed Enterprises
            </h3>
            <Link to="/companies" style={{ fontSize: "13px", color: "var(--color-accent)", textDecoration: "none", fontWeight: "600" }}>
              View All ({companies.length}) →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 4).map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.industry || "Enterprise"}</td>
                  <td>{c.location || "Global"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Candidates Summary */}
        <div className="table-card">
          <div className="table-toolbar">
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", color: "var(--color-primary)" }}>
              Executive Candidates
            </h3>
            <Link to="/candidates" style={{ fontSize: "13px", color: "var(--color-accent)", textDecoration: "none", fontWeight: "600" }}>
              View All ({candidates.length}) →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Likes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 4).map((cand) => (
                <tr key={cand._id}>
                  <td><strong>{cand.name}</strong></td>
                  <td>{cand.role}</td>
                  <td>❤️ {cand.likes || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
