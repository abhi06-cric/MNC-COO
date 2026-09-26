import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="portal-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-crest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </span>
            <span className="logo-text">MNC PORTAL</span>
            <span className="logo-accent">.</span>
          </div>
          <p className="footer-desc">
            The premier corporate directory and executive convening portal, facilitating global industry collaboration, leadership governance, and enterprise discovery.
          </p>
          <div className="footer-badge">
            <span className="badge-dot"></span>
            Enterprise Grade Directory
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Directory & Operations</h4>
            <ul>
              <li><Link to="/companies">Featured Enterprises</Link></li>
              <li><Link to="/meetings">Executive Briefings</Link></li>
              <li><Link to="/candidates">Candidate Directory</Link></li>
              <li><Link to="/admin">Admin Management</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Corporate Governance</h4>
            <ul>
              <li><a href="#charter">Enterprise Charter</a></li>
              <li><a href="#security">Data Governance</a></li>
              <li><a href="#compliance">Regulatory Compliance</a></li>
              <li><a href="#terms">Terms of Access</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Global Portals</h4>
            <ul>
              <li><a href="#north-america">North America Hub</a></li>
              <li><a href="#emea">EMEA Regional Desk</a></li>
              <li><a href="#asia-pacific">Asia-Pacific Directorate</a></li>
              <li><a href="#global-summit">Global Executive Summit</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 MNC Enterprise Portal. Independent corporate intelligence system. All rights reserved.</p>
        <div className="footer-legal">
          <span>Confidentiality Protected</span>
          <span>•</span>
          <span>ISO/IEC 27001 Certified Infrastructure</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
