import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/About.css";

export default function AboutPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-page">

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <span className="brand-name">Willo.</span>
          <span className="tagline">Dein Deutsch-Trainer</span>
        </div>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/stats" className="nav-link">Statistics</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="about-header">
        <div className="about-header-container">
          <h1 className="about-title">About <span>Willo.</span></h1>
          <p className="about-subtitle">A practical tool built by a student, for students.</p>
        </div>
      </header>

      {/* Content */}
      <main className="about-container">

        <section className="about-section">
          <h2 className="about-section-title">What is Willo?</h2>
          <p>
            Willo is a German vocabulary training app built around the official Goethe
            Institut word lists for levels A1 through B2. The idea is simple: instead of
            passively reading a vocabulary list, you actively test yourself, track which
            words you know, and see exactly where your gaps are. Each session pulls words
            from the level you choose, shows you the German word, and asks you to recall
            its meaning, helping you build real, lasting memory rather than short-term
            recognition.
          </p>
          <p>
            The app also tracks your accuracy per word over time. This means you can
            always come back to your progress page and get an honest picture of which
            words you have truly mastered and which ones still need work.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">A Word of Caution</h2>
          <p>
            Willo is a vocabulary trainer. Learning a language is a
            rich, complex process that involves listening, speaking, reading, writing,
            understanding grammar, and immersing yourself in real-world context. No
            flashcard app can replace that. This tool will not teach you German on its
            own, and it was never meant to.
          </p>
          <p>
            It is a practical complement to your broader learning journey: use it alongside
            classes, textbooks, podcasts, and conversations.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Who Built This?</h2>
          <p>
            Willo was built by a Computer Science student who is also learning German.
            The project started as a practical exercise, and as someone working through German
            vocabulary herself.
          </p>
        </section>

      </main>
    </div>
  );
}