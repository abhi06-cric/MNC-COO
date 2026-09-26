import { Link } from "react-router-dom";
import CompanySlideshow from "../components/CompanySlideshow";
import mncCollage from "../assets/image/mnc_collage.jpg";

function About() {
  return (
    <div className="page-container about-page">
      {/* Executive Page Header */}
      <div className="page-header-row about-header">
        <div className="page-header-title">
          <p className="section-tag">ABOUT THE MNC PORTAL</p>
          <h1>Powering Global Corporate Intelligence</h1>
          <p className="page-subtitle">
            An institutional gateway and corporate directory tracking the multinational enterprises,
            visionary talent, and executive meetings that shape the global economy.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/companies" className="btn btn-primary">
            Explore Directory
            <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link to="/meetings" className="btn btn-ghost">
            Executive Meetings
            <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* SECTION 1: The Master MNC Collage Showcase */}
      <section className="about-section collage-showcase-section">
        <div className="about-card-hero glass-card">
          <div className="collage-grid">
            {/* Visual Column: Uploaded Collage Image */}
            <div className="collage-image-container">
              <div className="collage-frame">
                <img
                  src={mncCollage}
                  alt="Global Multinational Enterprises Mosaic - Goldman Sachs, Meta, Apple, Microsoft, LinkedIn, Google, Deloitte, Amazon, JPMorgan Chase, IBM"
                  className="collage-image"
                />
                <div className="collage-watermark-badge">
                  <span className="badge-dot-gold"></span>
                  Official Enterprise Mosaic
                </div>
              </div>
              <p className="collage-caption-sub">
                Corporate headquarters and iconic brand identities of the world's 10 foremost multinational market leaders.
              </p>
            </div>

            {/* Narrative Column */}
            <div className="collage-narrative-col">
              <span className="narrative-tag">GLOBAL ENTERPRISE ECOSYSTEM</span>
              <h2 className="narrative-heading">
                The Architects of Modern Global Industry
              </h2>
              <p className="narrative-lead">
                From Silicon Valley and Seattle to Wall Street and global financial capitals,
                multinational corporations orchestrate the critical infrastructure that connects,
                finances, and propels modern civilization.
              </p>
              <p className="narrative-body">
                Our portal catalogs the profound impact of these vanguard institutions. Whether through
                cloud hyperscaling (AWS & Azure), foundational AI (Google & Meta), consumer silicon
                mastery (Apple), institutional capital flow (Goldman Sachs & JPMorgan Chase), professional
                economic graphing (LinkedIn), strategic enterprise advisory (Deloitte), or mission-critical
                hybrid cloud systems (IBM), these enterprises define the standards of global excellence.
              </p>

              {/* Statistical Proofpoints */}
              <div className="collage-stats-row">
                <div className="stat-pill">
                  <span className="stat-pill-num">₹15T+</span>
                  <span className="stat-pill-label">Combined Market Cap</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill-num">190+</span>
                  <span className="stat-pill-label">Countries Served</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill-num">3M+</span>
                  <span className="stat-pill-label">Global Workforce</span>
                </div>
              </div>

              <div className="narrative-bullet-list">
                <div className="narrative-bullet">
                  <span className="bullet-icon">✦</span>
                  <div>
                    <strong>Cloud & AI Sovereignty:</strong> Hyperscale cloud networks delivering mission-critical computing power to enterprise and government workloads worldwide.
                  </div>
                </div>
                <div className="narrative-bullet">
                  <span className="bullet-icon">✦</span>
                  <div>
                    <strong>Financial Capital Deployment:</strong> Safeguarding assets and providing institutional liquidity across international commercial exchanges.
                  </div>
                </div>
                <div className="narrative-bullet">
                  <span className="bullet-icon">✦</span>
                  <div>
                    <strong>Professional Connectivity:</strong> Mapping global talent pools, employment opportunities, and specialized technical skill sets.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Interactive Individual Company Slideshows */}
      <section className="about-section slideshow-showcase-section">
        <div className="section-header-centered">
          <p className="section-tag">MULTINATIONAL SHOWCASE</p>
          <h2 className="section-title-large">Interactive Enterprise Slideshow</h2>
          <p className="section-subtitle-centered">
            Navigate through individual headquarters, corporate histories, and high-impact descriptions
            of the world's most influential corporations.
          </p>
        </div>

        {/* The Slideshow Component */}
        <CompanySlideshow initialIndex={0} />
      </section>

      {/* SECTION 3: Portal Mission & Governance */}
      <section className="about-section mission-section">
        <div className="section-header-centered">
          <p className="section-tag">PORTAL CAPABILITIES</p>
          <h2 className="section-title-large">Built for Executive Clarity & Diligence</h2>
          <p className="section-subtitle-centered">
            MNC Portal bridges enterprise directory management, verified candidate profiles, and executive meeting orchestration.
          </p>
        </div>

        <div className="mission-cards-grid">
          <div className="mission-card glass-card">
            <div className="mission-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Curated Enterprise Registry</h3>
            <p>
              A clean, verified database of multinational organizations with rigorous enterprise governance,
              ensuring reliable business intelligence and corporate profiling.
            </p>
            <Link to="/companies" className="mission-link">Explore Companies →</Link>
          </div>

          <div className="mission-card glass-card">
            <div className="mission-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Leadership & Talent Pipeline</h3>
            <p>
              Showcasing specialized engineers, founders, and researchers with verified skills and community recognition
              to accelerate professional alignment.
            </p>
            <Link to="/candidates" className="mission-link">Discover Candidates →</Link>
          </div>

          <div className="mission-card glass-card">
            <div className="mission-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Executive Meeting Scheduling</h3>
            <p>
              Coordinate high-level discussions, corporate briefings, and partnership evaluations
              with intuitive scheduling and boardroom management tools.
            </p>
            <Link to="/meetings" className="mission-link">Schedule Meeting →</Link>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Card */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <div className="about-cta-content">
            <h2>Ready to Explore Global Enterprise Intelligence?</h2>
            <p>
              Discover corporate directories, connect with vetted industry talent, or schedule executive consultations today.
            </p>
          </div>
          <div className="about-cta-buttons">
            <Link to="/companies" className="btn btn-primary btn-lg">
              Explore Enterprise Directory
              <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/candidates" className="btn btn-ghost btn-lg">
              View Candidates
              <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
