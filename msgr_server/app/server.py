import sqlite3
import bcrypt
import hashlib
from datetime import datetime, timezone, timedelta
import time


def connect_and_get_cursor_and_connection(database_path):
    """ Connects to provided database and returns cursor """

    # Connect to the database
    connection = sqlite3.connect(database_path)

    # Get cursor to the database
    cursor = connection.cursor()

    return (cursor, connection)


def commit_and_close_connection(connection):
    # Commit changes
    connection.commit()

    # Close the connection
    connection.close()


def init_db():
    """ Initializes database and creates tables"""

    # Get cursor to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("msgrdb.db")

    # Create user table
    cursor.execute(
        '''CREATE TABLE users (username text, hash_pswd text, date_of_creation text)''')

    # Create chats table
    cursor.execute(
        '''CREATE TABLE chats (usr_1 text, usr_2 text, chat_id INTEGER PRIMARY KEY AUTOINCREMENT)''')

    # Create messages table
    cursor.execute(
        '''CREATE TABLE messages (chat_id INTEGER, sender text, message text, time text)''')

    # Commit changes and close connection
    commit_and_close_connection(connection)


def hash_password(password):
    """ Hash password with generated bcrypt salt """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


def check_password(password, hashed):
    """ Check if password is correct """
    return bcrypt.checkpw(password.encode('utf-8'), hashed)


def register_user(name, password):
    """ Register user """

    print(f"New user registration {name}")

    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Check if user already exists
    cursor.execute("select username from users where username=(:username)", {
                   "username": name})
    result = cursor.fetchall()
    if (result != []):
        print("User already exists")
        return False

    # Hash password
    hashed_password = hash_password(password)

    # Current date
    date = datetime.now(timezone.utc) + timedelta(hours=3)

    # Add username and hashed password to the user's table
    cursor.execute("INSERT INTO users(username, hash_pswd, date_of_creation) VALUES (:username, :hashed_password, :date_of_creation)", {
        'username': name, 'hashed_password': hashed_password, 'date_of_creation': date})

    commit_and_close_connection(connection)

    return True


def login(name, password):
    """ Logs in a user """

    print(f"User attempt of login {name}")

    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Search for username in the table of users
    cursor.execute("select username from users where username = (:username)", {
                   "username": name})
    result = cursor.fetchall()
    if result == []:
        return False

    # Get available hash from the database
    cursor.execute("select hash_pswd from users where username = (:username)", {
                   "username": name})
    hashed_password_orig = cursor.fetchall()[0][0]

    # Check if password is correct
    if check_password(password, hashed_password_orig):
        return True
    else:
        return False

    commit_and_close_connection(connection)


def search_user(username):
    """ Search username by its name """

    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Get all users with matching pattern
    cursor.execute("select username from users where username like :username", {
                   "username": "%" + username + "%"})
    results = cursor.fetchall()

    # Commit and close
    commit_and_close_connection(connection)

    return results


def create_chat(user_1, user_2):
    """ Register new chat with two users """

    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Create chat id
    chat_id = hashlib.sha256(bytearray(user_1 + user_2, "utf-8"))
    chat_id = chat_id.digest().hex()

    # Insert info about the dialog to the database
    cursor.execute('insert into chats(usr_1, usr_2) values (:user_1, :user_2)', {
                   "user_1": user_1, "user_2": user_2})

    # Commit and close
    commit_and_close_connection(connection)


def get_chats_by_user(username):
    """ Fetch all chats in which user participates """

    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Find all users with whom current user chatted
    cursor.execute('select usr_1, usr_2, chat_id from chats where usr_1=:username or usr_2=:username', {
                   "username": username})
    chats = cursor.fetchall()

    for i in range(0, len(chats)):
        chat = chats[i]
        message = get_last_message_from_chat(chat[2])
        if message == []:
            chat += ("", "", "", )
        chats[i] = chat

    # Commit and close
    commit_and_close_connection(connection)

    return chats


def get_last_message_from_chat(chat_id):
    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Find all users with whom current user chatted
    cursor.execute('SELECT * FROM messages ORDER BY chat_id DESC LIMIT 1', {
                   "chat_id": chat_id})

    return cursor.fetchall()


def save_message(message, chat_id, sender):
    """ Save sent message to the database """

    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Current date
    cur_time = time.strftime('%H:%M')
    print(cur_time)

    # Insert message to the database
    cursor.execute('insert into messages(chat_id, sender, message, time) values (:chat_id, :sender, :message, :time)', {
                   "chat_id": chat_id, "sender": sender, "message": message, "time": cur_time})

    # Commit and close
    commit_and_close_connection(connection)

def get_messages_by_chat_id(chat_id):
    # Connect to the database
    (cursor, connection) = connect_and_get_cursor_and_connection("app/msgrdb.db")

    # Find all users with whom current user chatted
    cursor.execute('SELECT * FROM messages where chat_id=:chat_id', {
                   "chat_id": chat_id})
    results = cursor.fetchall()
    
    return results

if __name__ == '__main__':
    init_db()
