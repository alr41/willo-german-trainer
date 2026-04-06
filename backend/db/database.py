import mysql.connector

def connect_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root"
        )
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS german_db")
        cursor.execute("USE german_db")
        cursor.close()
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None
