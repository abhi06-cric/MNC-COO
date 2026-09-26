import { useEffect, useState } from "react";
import microsoft from "../assets/image/microsoft.jpg";
import google from "../assets/image/google.jpg";
import amazon from "../assets/image/amazon.jpg";
import { API_BASE_URL } from "../config/api";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const reloadCompanies = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/companies`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch companies");
        return res.json();
      })
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE_URL}/api/companies`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch companies");
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setCompanies(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Error fetching companies:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Helper to render company logo or royal navy monogram
  const renderCompanyLogo = (name) => {
    const n = (name || "").toLowerCase().trim();
    if (n.includes("microsoft")) {
      return <img src={microsoft} alt="Microsoft" />;
    }
    if (n.includes("google")) {
      return <img src={google} alt="Google" />;
    }
    if (n.includes("amazon")) {
      return <img src={amazon} alt="Amazon" />;
    }
    // Apple
    if (n.includes("apple")) {
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="var(--color-primary)" aria-label="Apple">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.57-.7.97-1.68.86-2.67-.84.03-1.85.56-2.44 1.26-.53.61-.99 1.6-.87 2.57.94.07 1.88-.46 2.45-1.16z" />
        </svg>
      );
    }
    // Meta
    if (n.includes("meta") || n.includes("facebook")) {
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="var(--color-primary)" aria-label="Meta">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      );
    }

    // Default classic royal navy monogram
    return (
      <span className="company-monogram">
        {name ? name.charAt(0).toUpperCase() : "C"}
      </span>
    );
  };

  const filteredCompanies = companies.filter((c) => {
    const query = search.toLowerCase();
    return c.name && c.name.toLowerCase().includes(query);
  });

  return (
    <div className="page-container">
      {/* Header Row */}
      <div className="page-header-row">
        <div className="page-header-title">
          <p className="section-tag" style={{ margin: 0, marginBottom: "6px" }}>
            ENTERPRISE DIRECTORY
          </p>
          <h1>Multinational Companies</h1>
          <p>
            Curated directory of global enterprise corporations and market leaders.
          </p>
        </div>

        <div className="page-actions">
          <div className="search-bar-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <h3>Loading Companies...</h3>
          <p>Connecting to enterprise database...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state">
          <h3 style={{ color: "#000000" }}>Connection Notice</h3>
          <p>Could not load companies from API: {error}</p>
          <button className="btn-secondary" onClick={reloadCompanies} style={{ marginTop: "12px" }}>
            Retry Connection
          </button>
        </div>
      )}

      {/* Companies Grid (ONLY Company Name and Icon) */}
      {!loading && !error && (
        <>
          {filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <h3>{search ? "No matching companies found" : "No Companies Listed Yet"}</h3>
              <p>
                {search
                  ? "Try searching for a different company name."
                  : "No companies have been added to the directory yet."}
              </p>
            </div>
          ) : (
            <div className="company-grid">
              {filteredCompanies.map((company) => (
                <div key={company._id} className="company-card glass-card">
                  {/* Strictly Company Icon */}
                  <div className="company-logo">
                    {renderCompanyLogo(company.name)}
                  </div>

                  {/* Strictly Company Name */}
                  <h3>{company.name}</h3>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Companies;