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
import SearchRight from "./SearchRight";
import { set } from "lodash";

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
};

const MessageArea = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  // Hiển thị thông tin hội thoại
  const [showConversation, setShowConversation] = useState(false);
  const [showSearchRight, setShowSearchRight] = useState(false);
  const handleShowSearchRight = () => {
    setShowSearchRight(!showSearchRight);
    setShowConversation(false);
  };
  const handleShowConversation = () => {
    setShowConversation(!showConversation);
    setShowSearchRight(false);
  };
  useEffect(() => {
    if (selectedChat) {
      // Fetch messages based on selected chat
      const userMessages = mockMessagesByUser[selectedChat.id] || [];
      setMessages(userMessages);
    }
  }, [selectedChat]);

  // Hàm xử lý gửi tin nhắn
  const handleSendMessage = (text = "") => {
    if (
      (text.trim() || messages.some((m) => m.image || m.file)) &&
      selectedChat
    ) {
      const newMessage = {
        id: messages.length + 1,
        text: text || "",
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }), // Định dạng thời gian giống "16:34"
        type: "sent",
        image: messages.some((m) => m.image) ? null : undefined, // Reset image nếu có văn bản
        file: messages.some((m) => m.file) ? null : undefined, // Reset file nếu có văn bản
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
    }
  };

  // Hàm xử lý khi tải ảnh lên từ MessageInput
  const handleImageUpload = (imageUrl) => {
    if (selectedChat) {
      const newMessage = {
        id: messages.length + 1,
        text: "",
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }), // Định dạng thời gian giống "16:34"
        type: "sent",
        image: imageUrl, // Lưu URL ảnh
      };
      setMessages([...messages, newMessage]);
    }
  };

  // Hàm xử lý khi tải file lên từ MessageInput
  const handleFileUpload = (file) => {
    if (selectedChat) {
      const newMessage = {
        id: messages.length + 1,
        text: "",
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }), // Định dạng thời gian giống "16:34"
        type: "sent",
        file: {
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB", // Chuyển kích thước sang KB
          type: file.type || "application/octet-stream", // Loại file mặc định
        },
      };
      setMessages([...messages, newMessage]);
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
            <SearchOutlined
              className="header-icon"
              onClick={handleShowSearchRight}
            />
            <ProfileOutlined
              className="header-icon"
              onClick={handleShowConversation}
            />
          </div>
        </Header>

        <Content className="message-area-content">
          <div className="message-container">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                selectedChat={selectedChat}
              />
            ))}
          </div>
        </Content>
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          onImageUpload={handleImageUpload} // Truyền callback để xử lý ảnh
          onFileUpload={handleFileUpload} // Truyền callback để xử lý file
        />
      </Layout>
      {showConversation && (
        <Layout className="conversation-details">
          <ConversationDetails
            isVisible={showConversation}
            selectedChat={selectedChat}
          />
        </Layout>
      )}
      {/* Hiển thị tìm kiếm bên thông tin hội thoại */}
      {showSearchRight && (
        <Layout className="layout-search-right">
          <SearchRight setShowSearchRight={setShowSearchRight} />
        </Layout>
      )}
    </div>
  );
};

export default MessageArea;
