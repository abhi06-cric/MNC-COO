import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        document.getElementById("burger")?.focus();
      }
    }

    function handleClickOutside(e) {
      const menu = document.getElementById("menu");
      const burger = document.getElementById("burger");
      if (menuOpen && menu && !menu.contains(e.target) && burger && !burger.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="nav">
        <Link to="/" className="logo">
          <span className="logo-crest">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </span>
          <span className="logo-text">MNC PORTAL</span>
          <span className="logo-accent">.</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/meetings">Meetings</Link>
          <Link to="/candidates">Candidates</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/companies" className="btn btn-nav-start">
            Explore Directory
          </Link>

          <button
            id="burger"
            className="burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
          </button>
        </div>
      </header>

      <nav className={`menu ${menuOpen ? "open" : ""}`} id="menu" aria-label="Mobile">
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/companies" onClick={() => setMenuOpen(false)}>Companies</Link>
        <Link to="/meetings" onClick={() => setMenuOpen(false)}>Meetings</Link>
        <Link to="/candidates" onClick={() => setMenuOpen(false)}>Candidates</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <div className="divider"></div>
        <Link to="/companies" className="m-start" onClick={() => setMenuOpen(false)}>
          Explore Directory
        </Link>
      </nav>
    </>
  );
}

export default Navbar;