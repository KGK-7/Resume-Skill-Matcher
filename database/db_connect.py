import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",   # XAMPP default
        user="root",        # default in XAMPP
        password="",        # empty by default
        database="ats_system"
    )
