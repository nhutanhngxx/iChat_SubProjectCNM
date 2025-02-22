import React, { useState } from "react";
import { Layout, Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import UserList from "./UserList";
import HelloWindow from "./HelloWindow";
import MessageArea from "./MessageArea";
import MessageList from "./MessageList";
import FileManager from "./FileManager";
import "./ChatWindow.css";

const { Sider, Content } = Layout;

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



const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [files, setFiles] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);
  
    const handleSelectChat = (chat) => {
      setSelectedChat(chat);
    };


  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "You",
        senderAvatar: "https://i.pravatar.cc/300",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const newFile = {
      id: files.length + 1,
      name: file.name,
      url: URL.createObjectURL(file),
    };
    setFiles([...files, newFile]);
  };

  return (
    <Layout className="chat-window">
      <UserList chatList={chatList} onSelectChat={handleSelectChat} />
      <HelloWindow />
      {/* <MessageArea selectedChat = {selectedChat}/>
      <Sider width={340} className="file-manager">
        <FileManager files={files} />
      </Sider> */}
    </Layout>
  );
};

export default ChatWindow;
