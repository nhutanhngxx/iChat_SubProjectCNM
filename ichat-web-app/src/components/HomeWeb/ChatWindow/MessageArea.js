import React, { useState, useEffect } from "react";
import { Layout, Avatar, Input, Button } from "antd";
import {
  VideoCameraOutlined,
  PhoneOutlined,
  NotificationOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Message from "./Message";
import MessageInput from "./MessageInput";
import "./MessageArea.css";

const { Header, Content } = Layout;

const MessageArea = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  // Mock data for messages
  const mockMessages = [
    {
      id: 1,
      text: "Hi, is the watch still up for sale?",
      sender: "George Alan",
      timestamp: "2:30 PM",
      type: "received",
    },
    {
      id: 2,
      text: "Awesome! Can I see a couple of pictures?",
      sender: "You",
      timestamp: "2:31 PM",
      type: "sent",
    },
  ];

  useEffect(() => {
    // Fetch messages from API or Socket.io
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "You",
        timestamp: new Date().toLocaleTimeString(),
        type: "sent",
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  return (
    <Layout className="chat-window">
      <Header className="chat-header">
        <div className="user-profile">
          <div className="avatar-container">
            <Avatar
              size={40}
              src="https://i.pravatar.cc/300?img=5"
              className="profile-avatar"
            />
            <div className="online-dot"></div>
          </div>
          <div className="user-info">
            <h4 className="user-name">George Alan</h4>
            <span className="online-status">Online</span>
          </div>
        </div>
        <div className="action-icons">
          <VideoCameraOutlined />
          <PhoneOutlined />
          <NotificationOutlined />
        </div>
      </Header>

      <Content className="message-area">
        <div className="message-container">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
        />
      </Content>
    </Layout>
  );
};

export default MessageArea;
