from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from services.word_service import (
    get_word_with_options, 
    get_random_word_article, 
    check_translation_option, 
    check_answer_article
)
from core.game_logic import GameEngine
from db.database import connect_db

router = APIRouter(prefix="/api", tags=["game"])

class AnswerPayload(BaseModel):
    word_id: int
    answer: str
    mode: str = "Infinite"
    lives: int = 3

# GET QUIZ WORDS 
@router.get("/word/quiz")
def get_quiz(level: str = Query(None), seen: str = Query(None)):
    data = get_word_with_options(level, seen)
    if not data:
        raise HTTPException(status_code=404, detail=f"No words found for level {level}")
    return data

# GET ARTICLE WORD
@router.get("/word/article")
def get_article_question(level: str = Query(None), seen: str = Query(None)):
    data = get_random_word_article(level, seen)
    if not data:
        raise HTTPException(status_code=404, detail=f"No words found for level {level}")
    return data

# SUBMIT ANSWER - VOCABULARY GAME
@router.post("/answer/translation")
def answer_vocab(payload: AnswerPayload):
    db_result = check_translation_option(payload.word_id, payload.answer)
    if "error" in db_result:
        raise HTTPException(status_code=500, detail=db_result["error"])

    # Game logic - Lives
    game = GameEngine(mode=payload.mode, lives=payload.lives)
    game_state = game.evaluate(db_result["correct"])

    return {
        **game_state, 
        "correct_answer": db_result.get("correct_answer"),
        "german_word": db_result.get("german_word")
    }

# SUBMIT ANSWER - ARTICLE GAME
@router.post("/answer/article")
def answer_article(payload: AnswerPayload):
    db_result = check_answer_article(payload.word_id, payload.answer)
    if "error" in db_result:
        raise HTTPException(status_code=500, detail=db_result["error"])
    if "valid" in db_result and not db_result["valid"]:
        raise HTTPException(status_code=404, detail=db_result["message"])

    # Game logic - Lives
    game = GameEngine(mode=payload.mode, lives=payload.lives)
    game_state = game.evaluate(db_result["correct"])

    return {
        **game_state,
        "correct_article": db_result.get("correct_article")
    }

# GET OVERALL STATS SUMMARY
@router.get("/stats/summary")
def get_stats_summary():
    conn = connect_db()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get total words, seen words, and accuracy per level
        query = """
            SELECT 
                l.level,
                COUNT(w.id) as total_words,
                COALESCE(SUM(CASE WHEN uws.times_seen > 0 THEN 1 ELSE 0 END), 0) as words_seen,
                COALESCE(SUM(uws.times_correct), 0) as total_correct,
                COALESCE(SUM(uws.times_seen), 0) as total_seen
            FROM levels l
            LEFT JOIN words w ON w.level_id = l.id
            LEFT JOIN user_word_stats uws ON uws.word_id = w.id AND uws.user_id = 1
            GROUP BY l.level
            ORDER BY l.level ASC;
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        summary = []
        for row in results:
            accuracy = 0
            if row['total_seen'] > 0:
                accuracy = round((row['total_correct'] / row['total_seen']) * 100)
            
            summary.append({
                "level": row['level'],
                "total_words": row['total_words'],
                "words_seen": int(row['words_seen']),
                "accuracy": accuracy
            })
            
        return summary
    finally:
        cursor.close()
        conn.close()

# GET TOP AND BOTTOM WORDS
@router.get("/stats/level/{level_name}")
def get_level_stats(level_name: str):
    conn = connect_db()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = conn.cursor(dictionary=True)
    
    try:
        top_query = """
            SELECT w.wort_de, uws.times_seen, uws.times_correct, 
                   ROUND((uws.times_correct / uws.times_seen) * 100) as accuracy
            FROM words w
            JOIN user_word_stats uws ON w.id = uws.word_id
            JOIN levels l ON w.level_id = l.id
            WHERE l.level = %s 
              AND uws.user_id = 1 
              AND uws.times_seen > 0
              AND (uws.times_correct / uws.times_seen) >= 0.5
            ORDER BY (uws.times_correct / uws.times_seen) DESC, uws.times_seen DESC
            LIMIT 10;
        """
        cursor.execute(top_query, (level_name,))
        top_words = cursor.fetchall()
        
        bottom_query = """
            SELECT w.wort_de, uws.times_seen, uws.times_correct, 
                   ROUND((uws.times_correct / uws.times_seen) * 100) as accuracy
            FROM words w
            JOIN user_word_stats uws ON w.id = uws.word_id
            JOIN levels l ON w.level_id = l.id
            WHERE l.level = %s 
              AND uws.user_id = 1 
              AND uws.times_seen > 0
              AND (uws.times_correct / uws.times_seen) < 0.5
            ORDER BY (uws.times_correct / uws.times_seen) ASC, uws.times_seen DESC
            LIMIT 10;
        """
        cursor.execute(bottom_query, (level_name,))
        bottom_words = cursor.fetchall()
        
        return {"top": top_words, "bottom": bottom_words}
    
    finally:
        cursor.close()
        conn.close()