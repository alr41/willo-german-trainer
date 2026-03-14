from db.database import connect_db

def create_tables(conn):
    cursor = conn.cursor()

    # Creates articles table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artikel ENUM('der', 'die', 'das')
    )
    ''')

    # Creates levels table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(255) NOT NULL UNIQUE
    )
    ''')

    # Creates words table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artikel_id INT,
        wort_de VARCHAR(255) NOT NULL,
        plural VARCHAR(255),
        wort_en VARCHAR(255) NOT NULL,
        level_id INT,
        FOREIGN KEY (artikel_id) REFERENCES articles(id),
        FOREIGN KEY (level_id) REFERENCES levels(id)
    )
    ''')

    # Creates sentences table 
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sentences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word_id INT,
        sentence_de TEXT,
        sentence_en TEXT,
        FOREIGN KEY (word_id) REFERENCES words(id)
    )
    ''')

    # Creates user progress table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_progress (
        word_id INT,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        FOREIGN KEY (word_id) REFERENCES words(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE user_word_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        word_id INT,
        times_seen INT DEFAULT 0,
        times_correct INT DEFAULT 0,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_word (user_id, word_id),
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    )
    ''')

    conn.commit()
    cursor.close()
    print("Tables created successfully.")

if __name__ == "__main__":
    print("Testing table creation...")
    conn = connect_db()
    if conn:
        create_tables(conn)
        conn.close()