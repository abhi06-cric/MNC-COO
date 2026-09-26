import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Globe from "../components/Globe";
import CompanySlideshow from "../components/CompanySlideshow";
import google from "../assets/image/google.jpg";
import amazon from "../assets/image/amazon.jpg";
import microsoft from "../assets/image/microsoft.jpg";
import mncCollage from "../assets/image/mnc_collage.jpg";
import { API_BASE_URL } from "../config/api";

function Home() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE_URL}/api/candidates`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setCandidates(data);
        }
      })
      .catch((err) => console.error("Home candidate fetch error:", err));

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    // Entrance animations for Hero
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    document.documentElement.classList.add('anim');
    
    let armed = false;
    let safeT = null;
    
    function clean() {
      if (!armed) return;
      clearTimeout(safeT);
      document.removeEventListener('animationend', onEnd, true);
      document.documentElement.classList.remove('anim', 'go');
      armed = false;
    }
    
    function onEnd(e) {
      if (e.animationName === 'pillIn' && e.target.classList.contains('btn-ghost')) {
        clean();
      }
    }
    
    function start() {
      if (armed) return;
      clearTimeout(safeT);
      armed = true;
      document.addEventListener('animationend', onEnd, true);
      safeT = setTimeout(clean, 2600);
      document.documentElement.classList.add('go');
    }
    
    let bootT = setTimeout(start, 900);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start, start);
    } else {
      start();
    }
    
    return () => {
      clean();
      clearTimeout(bootT);
    };
  }, []);

  return (
    <main>

      {/* Hero Section */}
      <section className="hero">
        <div className="bg" aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Globe />
        </div>
        
        <div className="hero-inner">
          <p className="hero-tag">MNC INFORMATION PORTAL</p>
          <h1>
            <span className="ln"><span className="ln-i">Explore Companies.</span></span>
            <span className="ln"><span className="ln-i">Executive Meetings.</span></span>
          </h1>
          <p className="sub">
            Curated directory of global enterprise corporations<br/>
            and professional corporate meeting management.
          </p>
          <div className="ctas">
            <Link to="/companies" className="btn btn-lg btn-primary">
              Search Companies
              <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/meetings" className="btn btn-lg btn-ghost">
              Corporate Meetings
              <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Sections Wrapper */}
      <div className="content-wrapper">

        {/* Companies Section (ONLY Company Name & Icon) */}
        <section className="section">

          <div className="section-header">
            <div>
              <p className="section-tag">COMPANIES</p>

              <h2>
                Featured Enterprises
              </h2>
            </div>

            <Link to="/companies" className="view-button">
              View All Companies →
            </Link>
          </div>

          <div className="company-grid">

            <div className="company-card glass-card">
              <div className="company-logo microsoft">
                <img src={microsoft} alt="Microsoft" />
              </div>
              <h3>Microsoft</h3>
            </div>

            <div className="company-card glass-card">
              <div className="company-logo google">
                <img src={google} alt="Google" />
              </div>
              <h3>Google</h3>
            </div>

            <div className="company-card glass-card">
              <div className="company-logo amazon">
                <img src={amazon} alt="Amazon" />
              </div>
              <h3>Amazon</h3>
            </div>

          </div>

        </section>

        {/* About Section: Master Collage & Slideshow Showcase */}
        <section className="section about-home-section">
          <div className="section-header">
            <div>
              <p className="section-tag">ABOUT THE PORTAL</p>
              <h2>The Global Enterprise Spotlight</h2>
              <p className="section-desc-lead">
                Exploring the multinational corporations powering the modern cloud, financial systems, and global technology infrastructure.
              </p>
            </div>
            <Link to="/about" className="view-button">
              View Full About Page →
            </Link>
          </div>

          {/* Master Collage Card Spotlight */}
          <div className="home-collage-spotlight glass-card">
            <div className="home-collage-row">
              <div className="home-collage-img-wrapper">
                <img
                  src={mncCollage}
                  alt="Multinational Corporations Collage"
                  className="home-collage-img"
                />
                <div className="home-collage-badge">
                  <span>✦ 10 Global Titans</span>
                </div>
              </div>

              <div className="home-collage-text">
                <span className="narrative-tag">GLOBAL ENTERPRISE ECOSYSTEM</span>
                <h3 className="home-collage-title">Connecting Industry Leaders & Visionary Talent</h3>
                <p>
                  From Redmond, Mountain View, and Cupertino to Wall Street and global financial hubs,
                  multinational enterprises pioneer the solutions that drive international commerce.
                  MNC Portal provides verified corporate records, executive meeting coordination,
                  and professional networking across Fortune 500 ecosystems.
                </p>
                <div className="home-collage-metrics">
                  <div className="h-metric">
                    <strong>₹15T+</strong>
                    <span>Combined Capitalization</span>
                  </div>
                  <div className="h-metric">
                    <strong>190+</strong>
                    <span>Countries Operating</span>
                  </div>
                  <div className="h-metric">
                    <strong>3M+</strong>
                    <span>Specialized Workforce</span>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <Link to="/about" className="btn btn-primary">
                    Learn More About MNCs
                    <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                      <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Company Slideshow */}
          <div style={{ marginTop: "40px" }}>
            <div className="slideshow-intro-bar">
              <h3 className="slideshow-intro-title">Featured Enterprise Slideshow</h3>
              <p className="slideshow-intro-subtitle">
                Select or auto-play through each corporation to view their headquarters, corporate overview, and strategic pillars.
              </p>
            </div>
            <CompanySlideshow initialIndex={0} />
          </div>
        </section>

        {/* Candidates Section */}
        <section className="section candidates-section">

          <div className="section-header">

            <div>
              <p className="section-tag">CANDIDATES</p>

              <h2>
                Discover Professional Profiles
              </h2>
            </div>

            <Link to="/candidates" className="view-button">
              View All Candidates →
            </Link>

          </div>


          <div className="candidate-grid">
            {(candidates.length > 0 ? candidates : [
              {
                _id: "seed-1",
                name: "Shiv Kumar",
                role: "Founder, CEO",
                avatar: "SK",
                skills: ["Silicon Switch Approach", "Semiconductor"],
                likes: 42
              },
              {
                _id: "seed-2",
                name: "Rahul Kumar",
                role: "Software Developer",
                avatar: "RK",
                skills: ["React", "Node.js", "MongoDB"],
                likes: 28
              },
              {
                _id: "seed-3",
                name: "Mohammad Faizan",
                role: "AI Researcher",
                avatar: "MF",
                skills: ["Reinforcement Learning", "Large Language Models", "Generative AI"],
                likes: 35
              }
            ]).slice(0, 3).map((cand) => (
              <div key={cand._id} className="candidate-card glass-card">
                <div className="candidate-avatar" style={{ overflow: "hidden" }}>
                  {cand.avatar || cand.name.substring(0, 2).toUpperCase()}
                </div>
                <h3>{cand.name}</h3>
                <p>{cand.role}</p>
                <div className="skills">
                  {cand.skills?.slice(0, 3).map((sk, i) => (
                    <span key={i}>{sk}</span>
                  ))}
                </div>
                <Link to="/candidates" className="btn-candidate-view" style={{ textDecoration: "none", textAlign: "center" }}>
                  View Profile →
                </Link>
              </div>
            ))}
          </div>

        </section>
      
      </div>

    </main>
  );
}

export default Home;