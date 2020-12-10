from flask import Flask, request
from flask_cors import CORS
import json
app = Flask(__name__, static_folder="../../msgrjs/build/", static_url_path="/")
CORS(app)

from app import server

@app.route('/')
def index():
  return app.send_static_file('index.html')

@app.route('/register', methods=['POST'])
def register():
  registered = server.register_user(request.form['username'], request.form['password'])
  
  if registered:
    return {
      "status": "success"
    }
  else:
    return {
      "status": "failed"
    }

@app.route('/login', methods=['POST'])
def login():
  logged_in = server.login(request.form['username'], request.form['password'])

  if logged_in:
    return {
      "status": "success"
    } 
  else:
    return {
      "status": "failed"
    }

@app.route('/msg', methods=['POST'])
def send_msg():
  message = json.loads(request.data)['message']
  chat_id = json.loads(request.data)['chat_id']
  sender = json.loads(request.data)['sender']
  print(message, chat_id, sender)
  server.save_message(message, chat_id, sender)
  return {"status": 200}

@app.route('/get_chats_by_user', methods=['GET'])
def get_chats_by_user_id():
  username = request.args.get('username')
  chats = server.get_chats_by_user(username)
  return { "chats": chats }

@app.route('/get_messages_by_chat_id', methods=['GET'])
def get_messages_by_chat_id():
  chat_id = request.args.get('chat_id')
  print("Get messages from chat", chat_id)
  messages = server.get_messages_by_chat_id(chat_id)
  return { "messages": messages }

@app.route('/search', methods=['POST'])
def search_user():
  username = json.loads(request.data)['username']
  print("Find request", username)
  results = server.search_user(username)
  return { "users": results }

@app.route("/create_chat", methods=['POST'])
def create_chat():
  usr_1 = json.loads(request.data)['username_1']
  usr_2 = json.loads(request.data)['username_2']
  server.create_chat(usr_1, usr_2)
  return { "status": "200" }