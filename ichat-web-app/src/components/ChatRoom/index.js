import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import "./ChatScreen.css";

const { Content } = Layout;

// Mock data
const chatList = [
  {
    id: 1,
    name: "George Alan",
    lastMessage: "I'll take it. Can you ship it?",
    time: "2:30 PM",
    unread: 0,
    online: true,
    type: "text",
  },
  {
    id: 2,
    name: "Uber Cars",
    lastMessage: "Allen: Your ride is 2 minutes away...",
    time: "1:45 PM",
    unread: 2,
    online: false,
    type: "notification",
  },
  {
    id: 3,
    name: "Safiya Fareena",
    lastMessage: "Video",
    time: "Yesterday",
    unread: 0,
    online: true,
    type: "video",
  },
  {
    id: 4,
    name: "Epic Game",
    lastMessage: "John Paul: 🌟Robert! Your team scored...",
    time: "11:30 AM",
    unread: 3,
    online: false,
    type: "game",
  },
  {
    id: 5,
    name: "Scott Franklin",
    lastMessage: "Audio",
    time: "9:15 AM",
    unread: 1,
    online: true,
    type: "audio",
  },
];

const ChatScreen = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <Layout className="chat-container">
      <Sidebar chatList={chatList} onSelectChat={handleSelectChat} />
      <ChatWindow selectedChat={selectedChat} />
    </Layout>
  );
};

export default ChatScreen;