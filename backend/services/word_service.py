import random
import re
from db.database import connect_db

# Clean up DB text 
def clean_option(text: str):
    if not text: return ""
    text = re.sub(r'\(.*?\)', '', text)
    parts = re.split(r'[/;]', text)
    return parts[0].strip()


# Get level ID
def get_level_id(cursor, level_name: str):
    if not level_name or level_name == "All":
        return None
    cursor.execute("SELECT id FROM levels WHERE level = %s", (level_name,))
    result = cursor.fetchone()
    return result['id'] if result else None


# GENERATE VOCABULARY QUIZ
def get_word_with_options(level: str = None, seen: str = None):
    conn = connect_db()
    if not conn: return None
    cursor = conn.cursor(dictionary=True)

    try:
        level_id = None

        if level and level != "All":
            level_id = get_level_id(cursor, level)
            if not level_id:
                return None

        where_clauses = ["w.wort_en != ''"]
        params = []
        
        if level_id:
            where_clauses.append("w.level_id = %s")
            params.append(level_id)
            
        # Filter out words that were already shown in this session
        if seen:
            seen_ids = [int(x) for x in seen.split(',') if x.isdigit()]
            if seen_ids:
                format_strings = ','.join(['%s'] * len(seen_ids))
                where_clauses.append(f"w.id NOT IN ({format_strings})")
                params.extend(seen_ids)
                
        base_query = """
            SELECT w.id, w.wort_de, w.wort_en 
            FROM words w
            LEFT JOIN user_word_stats uws ON w.id = uws.word_id AND uws.user_id = 1
            WHERE 
        """ + " AND ".join(where_clauses)
        
        query_target = base_query + """
            ORDER BY 
                (COALESCE(uws.times_correct, 0) / GREATEST(COALESCE(uws.times_seen, 1), 1)) ASC,
                COALESCE(uws.times_seen, 0) ASC,
                RAND() 
            LIMIT 1
        """
        
        cursor.execute(query_target, tuple(params))
        target = cursor.fetchone()
        
        if not target: return None

        # Get distractors
        query_dist = "SELECT wort_en FROM words WHERE id != %s AND wort_en != ''"
        dist_params = [target['id']]
        
        if level_id:
            query_dist += " AND level_id = %s"
            dist_params.append(level_id)
            
        query_dist += " ORDER BY RAND() LIMIT 3"
        
        cursor.execute(query_dist, tuple(dist_params))
        distractors = cursor.fetchall()

        # Format options
        correct_option = clean_option(target['wort_en'])
        options = [correct_option]
        for d in distractors:
            options.append(clean_option(d['wort_en']))
        
        random.shuffle(options)

        return {
            "word_id": target['id'],
            "german_word": target['wort_de'],
            "options": options
        }

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


# GENERATE ARTICLE QUIZ
def get_random_word_article(level: str = None, seen: str = None):
    conn = connect_db()
    if not conn: return None
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if Level exists
        level_id = None
        if level and level != "All":
            level_id = get_level_id(cursor, level)
            if not level_id: return None
            
        query = """
        SELECT w.id, w.wort_de, w.wort_en, a.artikel 
        FROM words w 
        JOIN articles a ON w.artikel_id = a.id 
        LEFT JOIN user_word_stats uws ON w.id = uws.word_id AND uws.user_id = 1
        """
        
        where_clauses = []
        params = []

        if level_id:
            where_clauses.append("w.level_id = %s")
            params.append(level_id)

        # Filter out words that were already shown in this session
        if seen:
            seen_ids = [int(x) for x in seen.split(',') if x.isdigit()]
            if seen_ids:
                format_strings = ','.join(['%s'] * len(seen_ids))
                where_clauses.append(f"w.id NOT IN ({format_strings})")
                params.extend(seen_ids)

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += """
            ORDER BY 
                (COALESCE(uws.times_correct, 0) / GREATEST(COALESCE(uws.times_seen, 1), 1)) ASC,
                COALESCE(uws.times_seen, 0) ASC,
                RAND() 
            LIMIT 1
        """

        cursor.execute(query, tuple(params))
        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()


# WORD STATISTICS
def update_word_stats(word_id: int, is_correct: bool):
    conn = connect_db()
    if not conn: return
    cursor = conn.cursor()

    try:
        correct_int = 1 if is_correct else 0

        query = """
            INSERT INTO user_word_stats (user_id, word_id, times_seen, times_correct)
            VALUES (1, %s, 1, %s)
            ON DUPLICATE KEY UPDATE 
            times_seen = times_seen + 1,
            times_correct = times_correct + %s
        """
        cursor.execute(query, (word_id, correct_int, correct_int))
        conn.commit()

    except Exception as e:
        print(f"Error updating stats: {e}")

    finally:
        cursor.close()
        conn.close()


# CHECK THE BUTTON CLICK - VOCABULARY
def check_translation_option(word_id: int, selected_option: str):
    """
    Checks if the button the user clicked matches the DB translation.
    """
    conn = connect_db()
    if not conn: return {"error": "Connection failed"}
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT wort_en FROM words WHERE id = %s", (word_id,))
        result = cursor.fetchone()

        if not result:
            return {"correct": False, "error": "Word not found"}

        full_db_translation = result[0]

        expected_option = clean_option(full_db_translation)
        is_correct = (selected_option.strip().lower() == expected_option.lower())

        update_word_stats(word_id, is_correct)

        return {
            "correct": is_correct,
            "correct_answer": expected_option,
            "user_selected": selected_option
        }

    except Exception as e:
        print(f"Error checking option: {e}")
        return {"error": str(e)}
    
    finally:
        cursor.close()
        conn.close()


# CHECK ARTICLE
def check_answer_article(word_id: int, user_answer: str):
    """
    Checks if the user's selected article is correct.
    """
    conn = connect_db()
    if not conn:
        return {"error": "Database connection failed"}

    cursor = conn.cursor()

    try:
        query = """
        SELECT a.artikel 
        FROM words w 
        JOIN articles a ON w.artikel_id = a.id 
        WHERE w.id = %s
        """
        cursor.execute(query, (word_id,))
        result = cursor.fetchone()

        if not result:
            return {"valid": False, "message": "Word not found"}

        correct_article = result[0]

        is_correct = (user_answer.strip().lower() == correct_article.lower())

        update_word_stats(word_id, is_correct)

        return {
            "correct": is_correct,
            "correct_article": correct_article,
            "user_answer": user_answer
        }

    except Exception as e:
        print(f"Error checking answer: {e}")
        return {"error": str(e)}
    
    finally:
        cursor.close()
        conn.close()
