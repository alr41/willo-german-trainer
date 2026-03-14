import mysql.connector

def connect_db():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="german_db"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None