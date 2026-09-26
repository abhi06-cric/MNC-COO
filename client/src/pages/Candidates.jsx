import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [likedMap, setLikedMap] = useState(() => {
    try {
      const stored = localStorage.getItem("mnc_liked_candidates");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });


  const fetchCandidates = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/candidates`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load candidates");
        return res.json();
      })
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading candidates:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE_URL}/api/candidates`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load candidates");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setCandidates(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Error loading candidates:", err);
          setLoading(false);
        }
      });

    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem("mnc_user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      ignore = true;
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/candidates/${id}/like`, {
        method: "PATCH"
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c._id === id ? { ...c, likes: updated.likes } : c))
        );
        const newMap = { ...likedMap, [id]: true };
        setLikedMap(newMap);
        localStorage.setItem("mnc_liked_candidates", JSON.stringify(newMap));
      }
    } catch (err) {
      console.error("Failed to like candidate:", err);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(q);
    const roleMatch = c.role?.toLowerCase().includes(q);
    const skillMatch = c.skills?.some((s) => s.toLowerCase().includes(q));
    return nameMatch || roleMatch || skillMatch;
  });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div className="page-header-title">
          <p className="section-tag" style={{ margin: 0, marginBottom: "6px" }}>
            TALENT DIRECTORY
          </p>
          <h1>Executive Candidates</h1>
          <p>
            Curated roster of industry leaders, principal architects, and technical innovators.
          </p>
        </div>

        <div className="page-actions">
          <div className="search-bar-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, role, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "9px 16px", fontSize: "13px" }}
            onClick={fetchCandidates}
            title="Refresh candidates"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading candidate directory from server...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="empty-state">
          <p>No candidate profiles found matching your query.</p>
          <button className="btn-secondary" onClick={() => setSearchQuery("")}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="candidate-grid" style={{ marginTop: "24px" }}>
          {filteredCandidates.map((candidate) => {
            const isLiked = !!likedMap[candidate._id];
            return (
              <div
                key={candidate._id}
                className="candidate-card glass-card"
                style={{ position: "relative" }}
              >
                {/* Like Button on Card */}
                <button
                  type="button"
                  className={`candidate-like-btn ${isLiked ? "liked" : ""}`}
                  onClick={(e) => handleLike(candidate._id, e)}
                  title={isLiked ? "Endorsed" : "Endorse this candidate"}
                  aria-label="Endorse candidate"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={isLiked ? "#e11d48" : "none"}
                    stroke={isLiked ? "#e11d48" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="like-count">{candidate.likes || 0}</span>
                </button>

                <div className="candidate-avatar">
                  {candidate.avatar || candidate.name.substring(0, 2).toUpperCase()}
                </div>

                <h3>{candidate.name}</h3>
                <p className="candidate-role-text">{candidate.role}</p>

                {candidate.experience && (
                  <p className="candidate-exp-text">{candidate.experience}</p>
                )}

                <div className="skills">
                  {candidate.skills &&
                    candidate.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx}>{skill}</span>
                    ))}
                </div>

                <button
                  type="button"
                  className="btn-candidate-view"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  View Profile →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="modal-backdrop" onClick={() => setSelectedCandidate(null)}>
          <div
            className="modal-container candidate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px" }}
          >
            <div className="modal-header">
              <h3>Executive Profile</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCandidate(null)}
              >
                ✕
              </button>
            </div>

            <div className="candidate-modal-body">
              <div className="candidate-modal-top">
                <div className="candidate-avatar large">
                  {selectedCandidate.avatar || selectedCandidate.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--color-primary)", margin: 0 }}>
                    {selectedCandidate.name}
                  </h2>
                  <p style={{ color: "var(--color-accent)", fontWeight: 700, margin: "4px 0" }}>
                    {selectedCandidate.role}
                  </p>
                  <span className="badge-status upcoming">
                    ● Verified Enterprise Candidate
                  </span>
                </div>
              </div>

              {selectedCandidate.bio && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-slate-600)", letterSpacing: "1px", marginBottom: "6px" }}>
                    Professional Background
                  </h4>
                  <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: "var(--color-charcoal)" }}>
                    {selectedCandidate.bio}
                  </p>
                </div>
              )}

              <div style={{ marginTop: "18px" }}>
                <h4 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-slate-600)", letterSpacing: "1px", marginBottom: "8px" }}>
                  Technical Competencies & Specialties
                </h4>
                <div className="skills" style={{ gap: "8px" }}>
                  {selectedCandidate.skills?.map((s, idx) => (
                    <span key={idx} style={{ padding: "6px 12px", fontSize: "13px" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCandidate.email && (
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-slate-600)", letterSpacing: "1px", marginBottom: "4px" }}>
                    Executive Contact
                  </h4>
                  <p style={{ fontSize: "14px", color: "var(--color-primary)", fontWeight: 600 }}>
                    {selectedCandidate.email}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedCandidate(null)}
              >
                Close Profile
              </button>
              <button
                type="button"
                className={`btn btn-primary ${likedMap[selectedCandidate._id] ? "liked" : ""}`}
                style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
                onClick={(e) => handleLike(selectedCandidate._id, e)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={likedMap[selectedCandidate._id] ? "#ffffff" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likedMap[selectedCandidate._id] ? "Endorsed" : "Endorse Candidate"} ({selectedCandidate.likes || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;
