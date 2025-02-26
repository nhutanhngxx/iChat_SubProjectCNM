import React, { useState, useEffect } from "react";
import { Layout, Avatar, Input, Button, Badge } from "antd";
import {
  VideoCameraOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  ProfileOutlined,
  InboxOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Message from "./Message";
import MessageInput from "./MessageInput";
import "./MessageArea.css";
import ConversationDetails from "./ConversationDetails";

const { Header, Content } = Layout;

// Mock messages for different users
const mockMessagesByUser = {
  1: [
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
  ],
  2: [
    {
      id: 3,
      text: "Your ride is arriving",
      sender: "Uber Cars",
      timestamp: "1:45 PM",
      type: "received",
    },
  ],
  // Add messages for other users...
};

const MessageArea = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showConversation, setShowConversation] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      // Fetch messages based on selected chat
      const userMessages = mockMessagesByUser[selectedChat.id] || [];
      setMessages(userMessages);
    }
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedChat) {
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

  if (!selectedChat) return null;

  return (
    <div className="message-wrapper">
      <Layout className="message-area-container">
        <Header className="chat-header-message">
          <div className="user-profile-message">
            <div className="avatar-message">
              <Avatar
                size={48}
                src={`https://i.pravatar.cc/300?img=${selectedChat.id}`}
                className="profile-avatar-message"
              />
            </div>
            <div className="user-info-message">
              <h3 className="user-name-message">
                {selectedChat.name} <EditOutlined />
              </h3>
              <InboxOutlined />
            </div>
          </div>
          <div className="action-buttons-message-area">
            <UsergroupAddOutlined className="header-icon-message-area" />
            <VideoCameraOutlined className="header-icon-message" />
            <SearchOutlined className="header-icon" />
            <ProfileOutlined
              className="header-icon"
              onClick={() => setShowConversation(!showConversation)}
            ></ProfileOutlined>
          </div>
        </Header>

        <Content className="message-area-content">
          <div className="message-container">
            {messages.map((message) => (
              <Message key={message.id} message={message} selectedChat={selectedChat} />
            ))}
          </div>
        </Content>
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
        />
      </Layout>
      {showConversation && (
      <Layout className="conversation-details">
        <ConversationDetails isVisible={showConversation} selectedChat={selectedChat} />
      </Layout>
    )}
    </div>
  );
};

export default MessageArea;
