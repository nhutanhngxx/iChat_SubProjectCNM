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

const { Content } = Layout;

// Dữ liệu mẫu cho danh sách mục (dựa trên hình ảnh 1)
const listItems = [
  { id: 1, image: "user1", name: "Triệu Quốc An" },
  { id: 2, image: "cloud", name: "Nguyễn Thanh Cường" },
  { id: 3, image: "user2", name: "Lê Phước Nguyên" },
  { id: 4, image: "user3", name: "Đình Nguyễn Chung" },
  { id: 5, image: "cloud_plus", name: "Cloud của tôi" },
];

const UserList = ({ userList, onSelectUser }) => {
  const [searchText, setSearchText] = useState("");

  const filteredChatList = userList.filter((chat) =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const menu = (
    <Menu
      items={[
        { key: "1", label: "Xóa cuộc trò chuyện" },
        { key: "2", label: "Đánh dấu là chưa đọc" },
      ]}
    />
  );

  return (
    <Layout className="chat-sidebar">
      <SearchBar searchText={searchText} setSearchText={setSearchText} />
      <Content className="chat-list">
        {/* Header Tabs */}
        <div className="chat-header-user-list">
          <span className="active">Tất cả</span>
          <span>Chưa đọc</span>
          <span>Phân loại ⌄</span>
          <Dropdown overlay={menu} trigger={["click"]}>
            <MoreOutlined className="more-icon" />
          </Dropdown>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={filteredChatList}
          renderItem={(item) => (
            <List.Item className="chat-item" onClick={() => onSelectUser(item)}>
              <div className="avatar-container">
                <Avatar
                  size={48}
                  src={`https://i.pravatar.cc/150?img=${item.id}`}
                />
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
                    <Badge count={item.unread} offset={[0, 0]}></Badge>
                  </Col>
                </Row>
              </div>
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default UserList;
