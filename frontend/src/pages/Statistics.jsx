import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStatsSummary, getLevelStats } from "../services/api";
import "../styles/Statistics.css"; 

function Statistics() {
  const [summaries, setSummaries] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [levelDetails, setLevelDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      const data = await getStatsSummary();
      setSummaries(data);
      setLoading(false);
    };
    loadSummary();
  }, []);

  const handleLevelClick = async (levelName) => {
    if (expandedLevel === levelName) {
      setExpandedLevel(null); 
      return;
    }
    
    setExpandedLevel(levelName);
    
    if (!levelDetails[levelName]) {
      const details = await getLevelStats(levelName);
      setLevelDetails(prev => ({ ...prev, [levelName]: details }));
    }
  };

  return (
    <div className="home stats-page">
      <div className="level-header">
        <Link to="/" className="back-arrow-container">
          <button className="back-arrow">←</button>
        </Link>
        <h1 className="mode-title">YOUR PROGRESS STATISTICS</h1>
      </div>

      <div className="stats-container">
        {loading ? (
          <p className="loading-text">Loading stats...</p>
        ) : (
          <div className="stats-list">
            {summaries.map((stat) => (
              <div key={stat.level} className="stat-card-wrapper">
                
                {/* Main Level Card */}
                <div 
                  className={`stat-card theme-${stat.level.toLowerCase()}`}
                  onClick={() => handleLevelClick(stat.level)}
                >
                  <div className="stat-header">
                    <h2>Level {stat.level}</h2>
                    <span className="expand-icon">
                      {expandedLevel === stat.level ? '▲' : '▼'}
                    </span>
                  </div>
                  
                  <div className="stat-metrics">
                    <div className="metric">
                      <span className="metric-label">Words Seen</span>
                      <span className="metric-value">{stat.words_seen} / {stat.total_words}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Accuracy</span>
                      <span className="metric-value">{stat.accuracy}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${stat.total_words > 0 ? (stat.words_seen / stat.total_words) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dropdown: Top/Bottom Words */}
                {expandedLevel === stat.level && levelDetails[stat.level] && (
                  <div className="stat-details">
                    
                    <div className="details-column best-words">
                      <h3>Strongest</h3>
                      {levelDetails[stat.level].top.length === 0 ? (
                        <p className="empty-state">Play to see stats!</p>
                      ) : (
                        <ul>
                          {levelDetails[stat.level].top.map((w, i) => (
                            <li key={i}>
                              <span className="word-text">{w.wort_de}</span>
                              <span className="word-acc">{w.accuracy}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="details-column worst-words">
                      <h3>Needs Practice</h3>
                      {levelDetails[stat.level].bottom.length === 0 ? (
                        <p className="empty-state">Play to see stats!</p>
                      ) : (
                        <ul>
                          {levelDetails[stat.level].bottom.map((w, i) => (
                            <li key={i}>
                              <span className="word-text">{w.wort_de}</span>
                              <span className="word-acc">{w.accuracy}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;