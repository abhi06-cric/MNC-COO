import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function ManageCompanies() {
  const { admin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [serverOffline, setServerOffline] = useState(false);

  const getErrorMessage = (err) => {
    if (
      err.message === "Load failed" ||
      err.message === "Failed to fetch" ||
      err.name === "TypeError"
    ) {
      return `Backend API server (${API_BASE_URL}) is offline or unreachable. Please verify that the backend server is running.`;
    }
    return err.message || "An unexpected error occurred.";
  };

  const fetchCompanies = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/companies`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load companies");
        return res.json();
      })
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setServerOffline(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading companies:", err);
        setServerOffline(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        name: formData.name.trim(),
        industry: formData.industry.trim() || "Multinational Enterprise",
        location: formData.location.trim() || "Global",
        website: formData.website.trim() || "",
        description: formData.description.trim() || ""
      };

      const res = await fetch(`${API_BASE_URL}/api/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(admin?.token ? { Authorization: `Bearer ${admin.token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to create company");

      setSuccessMsg("Company added to enterprise directory successfully!");
      setFormData({ name: "", industry: "", location: "", website: "", description: "" });
      setServerOffline(false);
      fetchCompanies();

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 700);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${name}" from the enterprise database?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
        method: "DELETE",
        headers: {
          ...(admin?.token ? { Authorization: `Bearer ${admin.token}` } : {})
        },
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to delete company");
      }

      setCompanies((prev) => prev.filter((c) => c._id !== id));
      setServerOffline(false);
    } catch (err) {
      alert(`Error deleting company: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = companies.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.location || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Enterprise Directory Management</h1>
          <p>Register, modify, inspect, or delete corporate entities stored in MongoDB.</p>
        </div>

        <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Company
        </button>
      </div>

      {serverOffline && (
        <div style={{
          padding: "12px 18px",
          background: "#fff1f2",
          border: "1px solid #fecdd3",
          color: "#be123c",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "14px"
        }}>
          <div>
            <strong>⚠️ Backend Server Offline:</strong> Unable to connect to <code>{API_BASE_URL}</code>. Please ensure the backend server is running.
          </div>
          <button
            onClick={fetchCompanies}
            style={{
              padding: "6px 14px",
              background: "#be123c",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              marginLeft: "12px"
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-field">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search companies by name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "13px", color: "var(--color-slate-600)", fontWeight: "600" }}>
            Total Registered: {companies.length}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-600)" }}>
            Loading enterprise records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-600)" }}>
            {search ? "No matching enterprises found." : "No companies registered yet. Click 'Add New Company' above."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Enterprise Name</th>
                <th>Industry Sector</th>
                <th>Global Headquarters</th>
                <th>Official Website</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.industry || "Multinational"}</td>
                  <td>{c.location || "Global"}</td>
                  <td>
                    {c.website ? (
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: "600" }}
                      >
                        Visit Link ↗
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-slate-400)" }}>None</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-action-delete"
                      disabled={deletingId === c._id}
                      onClick={() => handleDelete(c._id, c.name)}
                    >
                      {deletingId === c._id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Enterprise Corporation</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCompany}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ padding: "10px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div style={{ padding: "10px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>
                    {successMsg}
                  </div>
                )}

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. NVIDIA Corporation"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Industry Sector</label>
                  <input
                    type="text"
                    name="industry"
                    className="form-control"
                    placeholder="e.g. Semiconductor & Artificial Intelligence"
                    value={formData.industry}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Global Location / HQ</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Santa Clara, CA, USA"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Official Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-control"
                    placeholder="https://www.nvidia.com"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Description / Corporate Overview</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Brief corporate overview or strategic focus..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid var(--color-border)" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Add to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCompanies;
