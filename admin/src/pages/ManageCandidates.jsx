import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function ManageCandidates() {
  const { admin } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    experience: "",
    bio: "",
    skills: ""
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

  const fetchCandidates = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/candidates`, {
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load candidates");
        return res.json();
      })
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
        setServerOffline(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading candidates:", err);
        setServerOffline(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      setErrorMsg("Candidate Name and Professional Role are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Leadership", "Enterprise Strategy"];

      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@enterprise.org`,
        experience: formData.experience.trim() || "5+ Years Executive Experience",
        bio: formData.bio.trim() || "Experienced corporate practitioner in global environments.",
        skills: skillsArray,
        avatar: formData.name.substring(0, 2).toUpperCase()
      };

      const res = await fetch(`${API_BASE_URL}/api/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(admin?.token ? { Authorization: `Bearer ${admin.token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to create candidate");

      setSuccessMsg("Candidate added to directory successfully!");
      setFormData({ name: "", role: "", email: "", experience: "", bio: "", skills: "" });
      setServerOffline(false);
      fetchCandidates();

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
    if (!window.confirm(`Are you sure you want to permanently delete candidate "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
        method: "DELETE",
        headers: {
          ...(admin?.token ? { Authorization: `Bearer ${admin.token}` } : {})
        },
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to delete candidate");
      }

      setCandidates((prev) => prev.filter((c) => c._id !== id));
      setServerOffline(false);
    } catch (err) {
      alert(`Error deleting candidate: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = candidates.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.role || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1>Executive Candidate Management</h1>
          <p>Supervise leadership talent, specialist engineers, and industry advisors.</p>
        </div>

        <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Candidate
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
            onClick={fetchCandidates}
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
              placeholder="Search candidates by name, role, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "13px", color: "var(--color-slate-600)", fontWeight: "600" }}>
            Total Candidates: {candidates.length}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-600)" }}>
            Loading candidate records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-slate-600)" }}>
            {search ? "No matching candidates found." : "No candidates listed yet. Click 'Add New Candidate' above."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Professional Role</th>
                <th>Corporate Email</th>
                <th>Skills & Competencies</th>
                <th>Likes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cand) => (
                <tr key={cand._id}>
                  <td>
                    <strong>{cand.name}</strong>
                  </td>
                  <td>{cand.role}</td>
                  <td>{cand.email || "N/A"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {cand.skills?.slice(0, 3).map((sk, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            background: "#f1f5f9",
                            borderRadius: "4px",
                            color: "var(--color-slate-600)",
                            fontWeight: "600"
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", color: "#e11d48" }}>
                      ❤️ {cand.likes || 0}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action-delete"
                      disabled={deletingId === cand._id}
                      onClick={() => handleDelete(cand._id, cand.name)}
                    >
                      {deletingId === cand._id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Candidate Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Executive Candidate</h3>
              <button className="btn-modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCandidate}>
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
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Dr. Priya Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Professional Role *</label>
                  <input
                    type="text"
                    name="role"
                    className="form-control"
                    placeholder="e.g. Chief Technology Officer"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Corporate Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="priya.sharma@enterprise.org"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Experience Duration</label>
                  <input
                    type="text"
                    name="experience"
                    className="form-control"
                    placeholder="e.g. 10+ Years Cloud & AI Strategy"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Key Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    className="form-control"
                    placeholder="e.g. Distributed Systems, Kubernetes, Go, Generative AI"
                    value={formData.skills}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Professional Bio</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    rows="3"
                    placeholder="Summary of domain expertise and leadership background..."
                    value={formData.bio}
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
                  {submitting ? "Saving..." : "Add Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCandidates;
