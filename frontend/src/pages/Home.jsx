import React, { useState, useEffect } from "react";
import "../styles/Home.css"; 
import flag from "../assets/flag.png";
import { Link, useNavigate } from "react-router-dom"


function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const levels = [
    { id: "A1", label: "A1", subtitle: "Beginner", enabled: true },
    { id: "A2", label: "A2", subtitle: "Elementary", enabled: true },
    { id: "B1", label: "B1", subtitle: "Intermediate", enabled: true }, // Disabled for now, coming soon
    { id: "B2", label: "B2", subtitle: "Upper Intermediate", enabled: true }, // Disabled for now, coming soon
  ];

function handleLevelSelect(level) {
  if (!level.enabled) return
  navigate(`/level/${level.id}`)
}


  return (
    <div className="home">
      
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-logo">
          <span className="brand-name">Willo.</span>
          <span className="tagline">Practice made easy</span> 
        </div>
        <div className="navbar-menu">
          <Link to="/stats" className="nav-link">Statistics</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      <header className="home-header">
        <div className="home-header-container">
          <div className="home-text-content">
            <h1 className="home-title">
              Practice your German<br />
              interactively with <span>Willo.</span>
            </h1>
          </div>
          
          <img
          src={flag} 
          alt="German flag"
          className="home-flag"
        /> 
        </div>
        </header>


      <main className="home-main">
        <div className="levels-header">
          <h2 className="section-title">Choose your proficiency</h2>
          <p className="section-subtitle">Select a level to start your interactive practice!</p>
        </div>

        <div className="levels-grid">
          {levels.map((level) => (
            <button
              key={level.id}
              className={`level-button ${level.enabled ? level.id.toLowerCase() : "disabled"}`}
              onClick={() => handleLevelSelect(level)}
              disabled={!level.enabled}
            >
              <span className="level-title">{level.label}</span>
              <span className="level-subtitle">{level.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="level-guide-container">
          <p className="guide-intro">
            Unsure about your level? <span className="highlight">Check the guide below:</span>
          </p>
          
          <div className="guide-grid">
            <div className="guide-card">
              <div className="guide-badge a1">A1</div>
              <div className="guide-content">
                <h4>Absolute Beginner</h4>
                <p>You can understand familiar words and basic phrases. You can introduce yourself and ask simple questions.</p>
              </div>
            </div>

            <div className="guide-card">
              <div className="guide-badge a2">A2</div>
              <div className="guide-content">
                <h4>Elementary</h4>
                <p>You can understand sentences about daily life (shopping, family, work). You can communicate in simple, routine tasks.</p>
              </div>
            </div>

            <div className="guide-card">
              <div className="guide-badge b1">B1</div>
              <div className="guide-content">
                <h4>Intermediate</h4>
                <p>You can deal with most travel situations. You can describe experiences, dreams, and give reasons for opinions.</p>
              </div>
            </div>

            <div className="guide-card">
              <div className="guide-badge b2">B2</div>
              <div className="guide-content">
                <h4>Upper Intermediate</h4>
                <p>You can understand complex texts and abstract topics. You can speak fluently and interact spontaneously with natives.</p>
              </div>
            </div>
          </div>
        </div>
      </main>


      <footer className="home-footer">
        <div className="footer-container">
          
          <div className="footer-section brand-section">
            <h3 className="footer-logo">Willo.</h3>
            <p className="footer-mission">
              Making German language practice accessible, dynamic, and effective for everyone.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Learn</h4>
            <ul className="footer-links">
              <li><a href="level/A1">A1 Beginner</a></li>
              <li><a href="level/A2">A2 Elementary</a></li>
              <li><a href="level/B1">B1 Intermediate</a></li>
              <li><a href="level/B2">B2 Upper Intermediate</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Project</h4>
            <ul className="footer-links">
              <li><a href="about">About</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;