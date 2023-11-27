import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
var socket;
const ENDPOINT = "http://localhost:5000";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useNavigate();

  useEffect(() => {
    socket = io(ENDPOINT);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);



    if (!userInfo) history("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const ChatState = () => {
  return useContext(ChatContext);
};

export { ChatProvider, ChatContext, ChatState };
