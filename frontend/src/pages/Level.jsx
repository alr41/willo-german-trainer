import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Level.css";
import { 
  getVocabQuestion, 
  submitVocabAnswer, 
  getArticleWord, 
  submitArticleAnswer 
} from "../services/api";

import heartPic from "../assets/pixel_heart.png";

function Level() {
  const { id } = useParams();
  
  // UI STATE
  const [activeTrainer, setActiveTrainer] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // VISUAL FEEDBACK STATES
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [correctAnswerText, setCorrectAnswerText] = useState(null);

  // GAME STATE
  const [currentWord, setCurrentWord] = useState(null);
  const [gameMode, setGameMode] = useState("Infinite");
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(false);
  
  const [seenWords, setSeenWords] = useState([]);

  // Score tracking
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const safeLevel = ["a1", "a2", "b1", "b2"].includes(id?.toLowerCase()) 
    ? id.toUpperCase() 
    : "A1";

  const gameModes = [
    { id: "article", label: "Article", subLabel: "Trainer", enabled: true },
    { id: "vocabulary", label: "Vocabulary", subLabel: "Trainer", enabled: true }
  ];

  // START GAME
  const handleGameStart = async (mode) => {
    setGameMode(mode);
    setLives(mode === "Survival" ? 3 : 999);
    setShowModal(false);
    setGameStarted(true);
    setShowSummary(false);
    
    // Reset visual states and scores
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCorrectAnswerText(null);
    setSeenWords([]); 
    setSessionScore(0);
    setSessionTotal(0);
    
    await loadNextQuestion([]); 
  };

  // QUIT TO MENU
  const quitToMenu = () => {
    setGameStarted(false);
    setShowSummary(false);
    setActiveTrainer(null);
  };

  const handleEndGame = () => {
    if (sessionTotal > 0) {
      setShowSummary(true);
    } else {
      quitToMenu();
    }
  };

  // FETCH QUESTION 
  const loadNextQuestion = async (currentSeen = seenWords) => {
    setLoading(true);
    let data = null;

    if (activeTrainer === "Vocabulary") {
      data = await getVocabQuestion(safeLevel, currentSeen);
    } else if (activeTrainer === "Article") {
      data = await getArticleWord(safeLevel, currentSeen);
    }

    if (!data && currentSeen.length > 0) {
      setSeenWords([]); 
      if (activeTrainer === "Vocabulary") {
        data = await getVocabQuestion(safeLevel, []);
      } else if (activeTrainer === "Article") {
        data = await getArticleWord(safeLevel, []);
      }
    }

    if (data) {
      setCurrentWord(data);
      const wordId = activeTrainer === "Vocabulary" ? data.word_id : data.id;
      setSeenWords(prev => [...prev, wordId]);
    } else {
      alert("Could not load words. Is the backend running?");
      quitToMenu();
    }
    setLoading(false);
  };

  // SUBMIT ANSWER 
  const handleAnswer = async (answer) => {
    if (!currentWord || selectedAnswer) return;

    setSelectedAnswer(answer);

    let result = null;

    if (activeTrainer === "Vocabulary") {
      result = await submitVocabAnswer(currentWord.word_id, answer, gameMode, lives);
    } else {
      result = await submitArticleAnswer(currentWord.id, answer, gameMode, lives);
    }

    const correctText = result.correct_answer || result.correct_article;
    setCorrectAnswerText(correctText);
    setIsAnswerCorrect(result.correct);
    setLives(result.lives);

    // Update score tracking immediately
    setSessionTotal(prev => prev + 1);
    if (result.correct) {
      setSessionScore(prev => prev + 1);
    }

    if (result.correct) {
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setCorrectAnswerText(null);
        loadNextQuestion(seenWords);
      }, 500); 
    } else {
      if (result.game_over) {
        setTimeout(() => {
          handleEndGame(); 
        }, 1500); 
      } else {
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsAnswerCorrect(null);
          setCorrectAnswerText(null);
          loadNextQuestion(seenWords);
        }, 1500); 
      }
    }
  };

  const renderGameContent = () => {
    if (!currentWord) return null;

    if (activeTrainer === "Vocabulary") {
      return (
        <div className="options-column">
          {currentWord.options.map((opt, i) => {
            let btnClass = "option-btn";
            if (selectedAnswer === opt) {
              btnClass += isAnswerCorrect ? " correct" : " wrong";
            } else if (selectedAnswer && !isAnswerCorrect && opt === correctAnswerText) {
              btnClass += " correct";
            }
            return (
              <button key={i} className={btnClass} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    if (activeTrainer === "Article") {
      return (
        <div className="options-column">
          {['der', 'die', 'das'].map((art) => {
            let btnClass = `option-btn article-${art}`;
            if (selectedAnswer === art) {
              btnClass += isAnswerCorrect ? " correct" : " wrong";
            } else if (selectedAnswer && !isAnswerCorrect && art === correctAnswerText) {
              btnClass += " correct";
            }
            return (
              <button key={art} className={btnClass} onClick={() => handleAnswer(art)}>
                {art.charAt(0).toUpperCase() + art.slice(1)}
              </button>
            );
          })}
        </div>
      );
    }
  };

  // --- MAIN RENDER ---
  return (
    <div className={`level-page theme-${safeLevel.toLowerCase()}`}>

      {!gameStarted && (
        <div className="level-header">
          <Link to="/" className="back-arrow-container">
            <div className="back-arrow">←</div>
          </Link>
        </div>
      )}

      {/* VIEW 1: SELECTION MENU */}
      {!gameStarted && (
        <div className={`mode-selection-container ${showModal ? "blurred" : ""}`}>
          <h1 className="mode-title">Choose your<br />practice mode!</h1>
          <div className="mode-buttons">
            {gameModes.map((mode) => (
              <button 
                key={mode.id}
                className="mode-btn"
                onClick={() => { setActiveTrainer(mode.label); setShowModal(true); }}
                disabled={!mode.enabled}
              >
                {mode.label}<br />{mode.subLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: GAME BOARD */}
      {gameStarted && !showSummary && (
        <>
          <div className="game-top-half">
            <button className="back-arrow" onClick={handleEndGame}>←</button>
            
            <div className="word-section">
              <h1 className="word-display">
                {activeTrainer === "Vocabulary" && currentWord ? currentWord.german_word : currentWord?.wort_de}
              </h1>
              <div className="lives-display">
                {gameMode === "Survival" ? (
                  Array.from({ length: lives }).map((_, i) => (
                    <img key={i} src={heartPic} alt="Life" className="heart-icon" />
                  ))
                ) : (
                  <div className="infinite-score">Score: {sessionScore}</div>
                )}
              </div>
            </div>
          </div>

          <div className="game-bottom-half">
            {renderGameContent()}
            <button className="end-game-btn" onClick={handleEndGame}>End Game</button>
          </div>
        </>
      )}

      {/* VIEW 3: PRACTICE SUMMARY */}
      {showSummary && (
        <div className="summary-container">
          <button className="back-arrow summary-back" onClick={quitToMenu}>←</button>
          
          <h1 className="summary-title">Practice summary</h1>
          
          <div className="summary-stats">
            <p className="summary-text">
              You practiced<br />
              <span className="summary-highlight">{sessionTotal} words</span>
            </p>
            <p className="summary-text">
              With a score of<br />
              <span className="summary-highlight">
                {sessionScore}/{sessionTotal} 
                <span style={{ fontSize: "1.5rem", color: "#666", marginLeft: "10px" }}>
                  ({Math.round((sessionScore / sessionTotal) * 100)}%)
                </span>
              </span>
            </p>
          </div>

          {/* Quick Return Home Button */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="summary-home-btn" onClick={() => setShowSummary(false)}>
              Return to Home
            </button>
          </Link>

        </div>
      )}

      {/* --- POPUP --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{activeTrainer} Trainer</h2>
            <p className="modal-subtitle">Select your challenge:</p>

            <div className="modal-actions">
              <button className="game-option-btn infinite" onClick={() => handleGameStart("Infinite")}>
                Infinite Mode
              </button>
              <button className="game-option-btn survival" onClick={() => handleGameStart("Survival")}>
                Survival Mode
              </button>
            </div>

            <button className="modal-close" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Level;