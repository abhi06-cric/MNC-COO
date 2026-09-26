import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { companyShowcase } from "../data/companyData";

function CompanySlideshow({ initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isClicking, setIsClicking] = useState(false);
  const timerRef = useRef(null);

  const current = companyShowcase[currentIndex];
  const total = companyShowcase.length;

  const resetAutoplayTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);
  }, [total]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    resetAutoplayTimer();
  }, [total, resetAutoplayTimer]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    resetAutoplayTimer();
  }, [total, resetAutoplayTimer]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    resetAutoplayTimer();
  };

  // Handle clicking on the picture to advance slide with feedback animation
  const handleImageClick = () => {
    setIsClicking(true);
    nextSlide();
    setTimeout(() => setIsClicking(false), 300);
  };

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Always Autoplay: continuous timer, never paused by hover
  useEffect(() => {
    resetAutoplayTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetAutoplayTimer]);

  return (
    <div className="company-slideshow-container">
      {/* Quick Navigation Chips */}
      <div className="slideshow-chips-bar" aria-label="Company quick selector">
        {companyShowcase.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            className={`slideshow-chip ${idx === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(idx)}
            aria-label={`View slide for ${c.shortName}`}
          >
            <span className="chip-indicator"></span>
            {c.shortName}
          </button>
        ))}
      </div>

      {/* Main Side-by-Side Slide Stage */}
      <div className="slideshow-stage glass-card">
        {/* Left Column: Visual Media Box (No dark/black background) */}
        <div className="slideshow-media-col">
          <div
            className={`slideshow-image-frame ${isClicking ? "clicked" : ""}`}
            onClick={handleImageClick}
            title="Click picture to advance to next company"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick();
              }
            }}
          >
            <img
              key={current.id}
              src={current.image}
              alt={`${current.name} Corporate Presence`}
              className="slideshow-image zoom-effect"
            />
            <div className="slideshow-image-overlay">
              <span className="slide-badge">
                <span className="badge-pulse"></span>
                Autoplay Active
              </span>
              <span className="slide-index-tag">
                {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="slide-click-hint">
              <span>✦ Click picture to advance</span>
            </div>
          </div>

          {/* Controller Bar underneath Image */}
          <div className="slideshow-controls">
            <button
              type="button"
              className="slide-nav-btn prev"
              onClick={prevSlide}
              aria-label="Previous Enterprise"
              title="Previous Enterprise (Left Arrow)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="slideshow-status-pill" title="Slideshow is continuously cycling">
              <span className="status-live-dot"></span>
              <span>Continuous Autoplay</span>
            </div>

            <button
              type="button"
              className="slide-nav-btn next"
              onClick={nextSlide}
              aria-label="Next Enterprise"
              title="Next Enterprise (Right Arrow)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: High-Grade Editorial Description */}
        <div className="slideshow-content-col" key={`desc-${current.id}`}>
          <div className="content-header">
            <div className="sector-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              {current.sector}
            </div>
            <h3 className="company-slide-title">{current.name}</h3>
            <p className="company-slide-hq">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {current.headquarters}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="company-slide-metrics">
            <div className="metric-box">
              <span className="metric-num">{current.founded}</span>
              <span className="metric-label">Founded</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{current.valuation}</span>
              <span className="metric-label">Valuation / Scale</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{current.metricValue}</span>
              <span className="metric-label">{current.metricLabel}</span>
            </div>
          </div>

          {/* Mission Tagline Quote */}
          <blockquote className="company-slide-tagline">
            "{current.tagline}"
          </blockquote>

          {/* Comprehensive Narrative Description */}
          <div className="company-slide-description">
            <p>{current.description}</p>
          </div>

          {/* Core Innovation Pillars */}
          <div className="company-pillars-container">
            <span className="pillars-label">Key Pillars:</span>
            <div className="pillars-tags">
              {current.pillars.map((pillar, i) => (
                <span key={i} className="pillar-badge">
                  {pillar}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="slide-actions-row">
            <Link to="/companies" className="btn btn-primary btn-slide-action">
              Explore in Directory
              <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href={current.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-slide-action"
            >
              Official Website
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="slideshow-pagination-dots" role="tablist">
        {companyShowcase.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            className={`pagination-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to ${c.shortName} slide`}
            role="tab"
            aria-selected={idx === currentIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default CompanySlideshow;
