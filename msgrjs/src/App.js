import "./App.css";
import { useEffect, useState } from "react";
import { Affix, Form, Layout } from "antd";
import { useForm } from "antd/lib/form/Form";
import Logo from "./logo_transparent.png";
import Axios from "axios";

const URL = "localhost:3000";

/**
 * Fetch all messages by chat identifier
 */
function getAllMessagesByChatID(chat_id) {
  return [];
}

/**
 *  Renders chat item
 */
const Chat = (props) => {
  return (
    <div onClick={() => props.chooseChat(props.chat)} className="flex bg-gray-50 h-16 hover:bg-yellow-200 cursor-pointer">
      <div className="flex-none">
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white m-3" alt="user_avatar">
          <div className="text-bold">{props.chat.name.toLocaleUpperCase()[0]}</div>
        </div>
      </div>
      <div className="flex-1 mt-3 overflow-auto">
        <div className="font-bold flex justify-start subpixel-antialiased">{props.chat.name}</div>
        <div className="font-medium truncate subpixel-antialiased">{props.chat.message}</div>
      </div>
      <div className="mt-3 mr-2 subpixel-antialiased sm:hidden md:block">{props.chat.time}</div>
    </div>
  );
};

/**
 * Renders list of all available chat for a user
 */
function ListOfChats(props) {
  const [allChats, setAllChats] = useState([]);

  // Fetch all chats for a current user
  useEffect(() => {
    Axios({
      method: "get",
      url: `http://localhost:5000/get_chats_by_user?username=${props.username}`,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Content-Type": "application/json",
      },
    }).then((res) => {
      // sender message time
      const new_data = res.data.chats.map((chat) => {
        return {
          key: chat[2],
          name: chat[0] === props.username ? chat[1] : chat[0],
          message: chat[4],
          time: chat[5],
        };
      });
      setAllChats(new_data);
    });
    const interval = setInterval(() => {
      Axios({
        method: "get",
        url: `http://localhost:5000/get_chats_by_user?username=${props.username}`,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
        },
      }).then((res) => {
        // sender message time
        const new_data = res.data.chats.map((chat) => {
          return {
            key: chat[2],
            name: chat[0] === props.username ? chat[1] : chat[0],
            message: chat[4],
            time: chat[5],
          };
        });
        setAllChats(new_data);
      });
      return () => clearInterval(interval);
    }, 5000);
  }, [setAllChats, props]);

  /**Chooses chat on click and sets its id to current chosen chat
    @param chat info about current chat
  */
  const chooseChat = (chat) => {
    // Set current chat
    console.log(chat);
    props.setChosenChat(chat);
  };

  console.log(allChats);
  return (
    <div className="flex-col">
      {allChats.map((chat) => (
        <Chat chooseChat={chooseChat} key={chat.key} chat={chat} />
      ))}
    </div>
  );
}

function ListOfMessagesByChatID(props) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      Axios({
        method: "get",
        url: `http://localhost:5000/get_messages_by_chat_id?chat_id=${props.chat_id}`,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/json",
        },
      }).then((res) => {
        const new_data = res.data.messages.map((message) => {
          return {
            name: message[1],
            message: message[2],
            time: message[3],
          };
        });

        setMessages(new_data);
      });
    }, 100);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="flex-col overflow-y-scroll message-list">
      {messages.map((message) => (
        <div className="flex bg-gray-50 h-auto hover:bg-yellow-300 ml-10">
          <div className="flex-1 mt-3 whitespace-normal text-left">
            <div className="font-bold subpixel-antialiased inline-block">{message.name}</div>
            <div className="font-normal inline-block ml-4">{message.time}</div>
            <div className="font-normal truncate subpixel-antialiased text-left whitespace-normal pr-16 mt-2">{message.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders list of found users
 */
const ListOfUsers = (props) => {
  // Create chat with selected user
  const createChat = (selected_user) => {
    console.log(selected_user[0]);
    console.log(props.username);
    Axios({
      method: "post",
      url: "http://localhost:5000/create_chat",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
      data: {
        username_1: props.username,
        username_2: selected_user[0],
      },
    });
  };

  return (
    <div>
      {props.users.map((user) => (
        <div key={user} className="flex bg-gray-50 h-16 hover:bg-yellow-200 cursor-pointer" onClick={() => createChat(user)}>
          <div className="flex-none">
            <div className={`inline-block h-10 w-10 rounded-full ring-2 ring-white m-3 bg-${"yellow"}-300`} alt="user_avatar">
              <div className="font-bold mt-2.5">{user[0].toLocaleUpperCase()[0]}</div>
            </div>
          </div>
          <div className="flex-1 mt-4 overflow-auto">
            <div className="font-medium flex justify-start subpixel-antialiased text-lg">{user}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [chosenChat, setChosenChat] = useState();

  const [form] = useForm();

  // Login screen
  const [login, setLogin] = useState(true);
  // Is authenticated
  const [authenticated, setAuthenticated] = useState(false);
  // Failed to login error message
  const [failedToLogin, setFailedToLogin] = useState(false);
  // Failed to register error message
  const [failedToRegister, setFailedToRegister] = useState(false);
  // Password and confirmation password doesn't match
  const [passwordsDontMatch, setPasswordDontMatch] = useState(false);
  // Current user username
  const [username, setUsername] = useState("");
  // Search results
  const [searchResults, setSearchResults] = useState([]);
  // Search
  const [search, setSearch] = useState(false);

  // Send message and reset field to zero
  const sendMessage = (msg) => {
    form.resetFields(["sent_message"]);

    // Empty messages don't get sent
    if (msg.sent_message === "") {
      return;
    }

    // Sent message to the server
    Axios({
      method: "post",
      url: "http://localhost:5000/msg",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
      data: { message: msg.sent_message, chat_id: chosenChat.key, sender: username },
    });
  };

  // Sent request on login
  const onLogin = (values) => {
    setUsername("");
    setPasswordDontMatch(false);
    setFailedToRegister(false);
    setFailedToLogin(false);

    if (values.login === "" || values.password === "") {
      return;
    }

    // Construct form-data
    const data = new FormData();
    data.append("username", values.login);
    data.append("password", values.password);

    // Make a request to the server
    Axios({
      method: "post",
      url: "http://localhost:5000/login",
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Content-Type": "multipart/form-data",
      },
      data: data,
    }).then((res) => {
      // We're successfully logged in
      if (res.data.status === "success") {
        setAuthenticated(true);
        setUsername(values.login);
      } else {
        setFailedToLogin(true);
      }
    });
  };

  // Registers user
  const onRegistration = (values) => {
    setUsername("");
    setPasswordDontMatch(false);
    setFailedToRegister(false);
    setFailedToLogin(false);

    if (values.login === "" || values.password === "") {
      return;
    }

    // Check if password and confirmation password match
    if (values.password !== values.password_confirmation) {
      setPasswordDontMatch(true);
      return;
    }

    // Construct form-data
    const data = new FormData();
    data.append("username", values.login);
    data.append("password", values.password);

    // Make a request to the server
    Axios({
      method: "post",
      url: "http://localhost:5000/register",
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Content-Type": "multipart/form-data",
      },
      data: data,
    }).then((res) => {
      if (res.data.status === "success") {
        // We are successfully registered
        setAuthenticated(true);
        setUsername(values.login);
      } else {
        setFailedToRegister(true);
      }
    });
  };

  // Search user by name
  const onSearch = (values) => {
    Axios({
      method: "post",
      url: "http://localhost:5000/search",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      },
      data: {
        username: values.search,
      },
    }).then((res) => {
      setSearchResults(res.data.users);
    });
  };

  // Checks if search query is empty
  const onSearchChange = (str) => {
    if (str.target.value !== "") {
      setSearch(true);
    } else {
      setSearch(false);
    }
  };

  return (
    <div className={`App flex-none h-screen overflow-hidden`} style={{ backgroundColor: !authenticated ? "#FCD34D" : "white" }}>
      {authenticated ? (
        <Layout style={{ minHeight: "100%" }}>
          <Layout.Sider theme="light" width="18%" className="" style={{ backgroundColor: "white" }}>
            <div className="text-xl text-left ml-4 font-bold">{username}</div>
            <Form onFinish={(values) => onSearch(values)}>
              <Form.Item name="search" noStyle>
                <input
                  placeholder="Поиск собеседника..."
                  onChange={(str) => onSearchChange(str)}
                  className="w-full inline-block pl-4 ring-2 ring-gray-300 rounded-lg focus:outline-none"
                  style={{ height: "40px" }}
                />
              </Form.Item>
              <button type="submit"></button>
            </Form>
            {!search && <ListOfChats setChosenChat={setChosenChat} chosenChatId={chosenChat?.key} username={username} />}
            {search && <ListOfUsers users={searchResults} username={username} />}
          </Layout.Sider>
          <Layout className="h-screen" style={{ backgroundColor: "#F9FAFB" }}>
            {chosenChat && (
              <div className="h-screen overflow-hidden max-h-screen">
                <Affix offsetTop={0}>
                  <div className="flex h-1/8 font-semibold text-2xl" style={{ backgroundColor: "#22B2DA" }}>
                    <div className="m-3 flex flex-row">
                      <div className="w-8 h-8 align-baseline cursor-pointer" onClick={() => setChosenChat(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                      <div className="pt-0.5" style={{ color: "#3B4A6B" }}>
                        {chosenChat.name}
                      </div>
                    </div>
                  </div>
                </Affix>

                <ListOfMessagesByChatID chat_id={chosenChat.key} />

                <Form onFinish={(msg) => sendMessage(msg)} form={form}>
                  <Affix offsetBottom={18}>
                    <div>
                      <div className="bg-gray-200 flex flex-row p-2 mt-4">
                        <Form.Item name="sent_message" noStyle>
                          <input
                            autoFocus
                            autoComplete="off"
                            value=""
                            type="text"
                            placeholder="Введите свое сообщение..."
                            className="w-full rounded-2xl h-10 focus:outline-none inline-flex p-2"
                          />
                        </Form.Item>
                        <button className="inline-block w-8 h-8 mt-1 transform rotate-90 focus:outline-none " type="submit">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="text-gray-600 cursor-pointer">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Affix>
                </Form>
              </div>
            )}
          </Layout>
        </Layout>
      ) : (
        <div>
          <img className="w-1/5 h-1/5" style={{ marginLeft: "39%" }} src={Logo} alt="" />
          <div className="flex-col justify-center" style={{ marginLeft: "40%" }}>
            <div className="flex flex-row">
              <div
                onClick={() => setLogin(true)}
                className="text-4xl text-left subpixel-antialiased font-sans font-black underline cursor-pointer w-1/16"
                style={{ color: login ? "#3B4A6B" : "#22B2DA" }}>
                Вход
              </div>
              <div
                onClick={() => setLogin(false)}
                className="ml-3 text-4xl text-left subpixel-antialiased font-sans font-black underline cursor-pointer w-10"
                style={{ color: !login ? "#3B4A6B" : "#22B2DA" }}>
                Регистрация
              </div>
            </div>
            <div>
              {login && (
                <Form onFinish={(values) => onLogin(values)}>
                  <Form.Item name="login" noStyle>
                    <input
                      name="login"
                      className="flex w-4/12 ring-4 ring-yellow-300 h-10 rounded-2xl p-2 focus:outline-none text-lg focus:ring-blue-400"
                      placeholder="Логин"
                      style={{ marginTop: "30px" }}
                    />
                  </Form.Item>
                  <Form.Item name="password" noStyle>
                    <input
                      name="password"
                      className="flex w-4/12 ring-4 ring-yellow-300 h-10 rounded-2xl p-2 focus:outline-none text-lg focus:ring-blue-400 mt-4"
                      placeholder="Пароль"
                      type="password"
                    />
                  </Form.Item>
                  {failedToLogin && <div className="font-semibold text-xl text-left text-red-500">Неверное имя пользователя или пароль</div>}
                  <button
                    type="submit"
                    className="mt-6 ml-0 flex justify-start focus:outline-none bg-yellow-500 rounded-full h-9 w-16 text-xl p-1 hover:bg-yellow-600">
                    Войти
                  </button>
                </Form>
              )}
              {!login && (
                <Form onFinish={(values) => onRegistration(values)}>
                  <Form.Item name="login" noStyle>
                    <input
                      name="login"
                      className="flex w-4/12 ring-4 ring-yellow-300 h-10 rounded-2xl p-2 focus:outline-none text-lg focus:ring-blue-400"
                      placeholder="Логин"
                      style={{ marginTop: "30px" }}
                    />
                  </Form.Item>
                  <Form.Item name="password" noStyle>
                    <input
                      className="flex w-4/12 ring-4 ring-yellow-300 h-10 rounded-2xl p-2 focus:outline-none text-lg focus:ring-blue-400 mt-4"
                      placeholder="Пароль"
                      type="password"
                    />
                  </Form.Item>
                  <Form.Item name="password_confirmation" noStyle>
                    <input
                      className="flex w-4/12 ring-4 ring-yellow-300 h-10 rounded-2xl p-2 focus:outline-none text-lg focus:ring-blue-400 mt-4"
                      placeholder="Подтверждение пароля"
                      type="password"
                    />
                  </Form.Item>
                  {failedToRegister && <div className="font-semibold text-xl text-left text-red-500">Имя пользователя занято</div>}
                  {passwordsDontMatch && <div className="font-semibold text-xl text-left text-red-500">Пароли не совпадают</div>}
                  <button
                    type="submit"
                    className="mt-6 ml-0 flex justify-start focus:outline-none bg-yellow-500 rounded-full h-9 w-1/7 text-xl p-1 hover:bg-yellow-600">
                    Регистрация
                  </button>
                </Form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
