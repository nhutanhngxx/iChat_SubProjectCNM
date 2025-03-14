import React, { useState, useEffect } from "react";
import { Layout, Avatar, Dropdown, Menu, Button, Modal } from "antd";
import {
  VideoCameraOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
  ProfileOutlined,
  EditOutlined,
  TagOutlined,
  SettingOutlined,
  MenuOutlined,
  PlusOutlined,
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
};

const CategoryMenu = () => {
  const [visible, setVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const categories = [
    { name: "Khách hàng", color: "#e74c3c" },
    { name: "Gia đình", color: "#e84393" },
    { name: "Công việc", color: "#f39c12" },
    { name: "Bạn bè", color: "#f1c40f" },
    { name: "Trả lời sau", color: "#2ecc71" },
    { name: "Đồng nghiệp", color: "#3498db" },
  ];

  const handleManageCategories = () => {
    setVisible(false);
    setIsModalVisible(true);
  };

  const menu = (
    <Menu className="category-menu">
      {categories.map((category, index) => (
        <Menu.Item key={index} className="category-item">
          <div className="category-content">
            <div
              className="category-dot"
              style={{ backgroundColor: category.color }}
            ></div>
            <span>{category.name}</span>
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        key="manage"
        className="manage-item"
        onClick={handleManageCategories}
      >
        <div className="manage-content">
          <SettingOutlined />
          <span>Quản lý thể phân loại</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="category-dropdown-container">
      <Dropdown
        overlay={menu}
        visible={visible}
        onVisibleChange={setVisible}
        trigger={["click"]}
        placement="bottomLeft"
      >
        <Button className="category-button">
          <TagOutlined />
        </Button>
      </Dropdown>

      <Modal
        title="Quản lý thể phân loại"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
        className="category-management-modal"
      >
        <div className="category-management-content">
          <h4>Danh sách thể phân loại</h4>
          <div className="category-list">
            {categories.map((category, index) => (
              <div key={index} className="category-list-item">
                <div className="category-drag-handle">
                  <MenuOutlined />
                </div>
                <div
                  className="category-tag"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>
          <Button
            type="text"
            className="add-category-button"
            icon={<PlusOutlined />}
          >
            Thêm phân loại
          </Button>
        </div>
      </Modal>
    </div>
  );
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
              <CategoryMenu />
            </div>
          </div>
          <div className="action-buttons-message-area">
            <UsergroupAddOutlined className="header-icon-message-area" />
            <VideoCameraOutlined className="header-icon-message" />
            <SearchOutlined className="header-icon" />
            <ProfileOutlined
              className="header-icon"
              onClick={() => setShowConversation(!showConversation)}
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
    </div>
  );
};

export default MessageArea;
