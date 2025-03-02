import React, { useState } from "react";
import { Layout, List, Avatar, Badge, Row, Col, Menu, Dropdown } from "antd";
import {
  VideoCameraOutlined,
  PhoneOutlined,
  NotificationOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "./UserList.css";

import SearchBar from "../Common/SearchBar";
import ComponentLeftSearch from "./ComponentLeftSearch";

const { Content } = Layout;

// Dữ liệu mẫu cho danh sách mục
const listItems = [
  { id: 1, image: "user1", name: "Triệu Quốc An" },
  { id: 2, image: "cloud", name: "Nguyễn Thanh Cường" },
  { id: 3, image: "user2", name: "Lê Phước Nguyên" },
  { id: 4, image: "user3", name: "Đình Nguyễn Chung" },
  { id: 5, image: "cloud_plus", name: "Cloud của tôi" },
];

// Component HeaderTabs: Hiển thị các tab và dropdown menu
const HeaderTabs = ({ menu }) => (
  <div className="chat-header-user-list">
    <span className="active">Tất cả</span>
    <span>Chưa đọc</span>
    <span>Phân loại ⌄</span>
    <Dropdown overlay={menu} trigger={["click"]}>
      <MoreOutlined className="more-icon" />
    </Dropdown>
  </div>
);

// Component ChatItem: Render từng mục trong danh sách chat
const ChatItem = ({ item, onSelectUser }) => (
  <List.Item className="chat-item" onClick={() => onSelectUser(item)}>
    <div className="avatar-container">
      <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
    </div>
    <div className="chat-info">
      <Row justify="space-between">
        <Col>
          <span className="chat-name">{item.name}</span>
        </Col>
        <Col>
          <span className="chat-time">{item.time}</span>
        </Col>
      </Row>
      <Row justify="space-between">
        <Col>
          <span className={`last-message ${item.type}`}>
            {item.type === "video" && <VideoCameraOutlined />}
            {item.type === "audio" && <PhoneOutlined />}
            {item.type === "notification" && <NotificationOutlined />}
            {item.lastMessage}
          </span>
        </Col>
        <Col>
          <Badge count={item.unread} offset={[0, 0]} />
        </Col>
      </Row>
    </div>
  </List.Item>
);

// Component ChatList: Hiển thị danh sách các ChatItem
const ChatList = ({ filteredChatList, onSelectUser }) => (
  <List
    itemLayout="horizontal"
    dataSource={filteredChatList}
    renderItem={(item) => <ChatItem item={item} onSelectUser={onSelectUser} />}
  />
);

// Component chính: ComponentLeft
const ComponentLeft = ({ userList, onSelectUser }) => {
  const [searchText] = useState("");
  const [showInterface, setShowInterface] = useState(false);

  // Hàm xử lý khi nhấn vào SearchBar
  const handleFocus = () => {
    setShowInterface(true); // Mở giao diện mới
  };

  const handleClose = () => {
    setShowInterface(false);
  };

  // Lọc danh sách chat dựa trên searchText
  const filteredChatList = userList.filter((chat) =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Menu cho Dropdown
  const menu = (
    <Menu
      items={[
        { key: "1", label: "Xóa cuộc trò chuyện" },
        { key: "2", label: "Đánh dấu là chưa đọc" },
      ]}
    />
  );

  return (
    <>
      {showInterface ? (
        <ComponentLeftSearch onClose={handleClose} />
      ) : (
        <Layout className="chat-sidebar">
          <SearchBar onFocus={handleFocus} />
          <HeaderTabs menu={menu} />
          <Content className="chat-list">
            <ChatList
              filteredChatList={filteredChatList}
              onSelectUser={onSelectUser}
            />
          </Content>
        </Layout>
      )}
    </>
  );
};

export default ComponentLeft;
