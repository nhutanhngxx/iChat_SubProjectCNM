import React, { useState } from "react";
import { Layout, List, Avatar, Badge, Row, Col, Input, Menu, Dropdown} from "antd";
import {
  VideoCameraOutlined,
  PhoneOutlined,
  NotificationOutlined,
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "./UserList.css";

const { Header, Content } = Layout;

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
      <Content className="chat-list">
        <div className="search-container">
          <Input
            prefix={<SearchOutlined className="search-icon" />}
            placeholder="Tìm kiếm"
            className="search-bar"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="icons">
            <UserOutlined className="user-icon" />
            <UsergroupAddOutlined className="group-icon" />
          </div>
        </div>
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
                  <Col >
                    <span className={`last-message ${item.type}`}>
                      {item.type === "video" && <VideoCameraOutlined />}
                      {item.type === "audio" && <PhoneOutlined />}
                      {item.type === "notification" && <NotificationOutlined />}
                      {item.lastMessage}
                    </span>
                  </Col>
                  <Col><Badge count={item.unread} offset={[0, 0]}></Badge></Col>
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
