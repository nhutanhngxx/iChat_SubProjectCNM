import React, { useState } from "react";
import { Layout, List, Avatar, Badge, Row, Col, Input } from "antd";
import {
  VideoCameraOutlined,
  PhoneOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import "./UserList.css";

const { Header, Content } = Layout;

const UserList = ({ chatList, onSelectChat }) => {
  const [searchText, setSearchText] = useState("");

  const filteredChatList = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout.Sider width={320} className="chat-sidebar">
      <Header className="sidebar-header">
        <h1>Chats</h1>
      </Header>

      <Content className="chat-list">
        <Input.Search
          placeholder="Search messages"
          className="search-bar"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <List
          itemLayout="horizontal"
          dataSource={filteredChatList}
          renderItem={(item) => (
            <List.Item className="chat-item" onClick={() => onSelectChat(item)}>
              <div className="avatar-container">
                <Avatar
                  size={45}
                  src={`https://i.pravatar.cc/150?img=${item.id}`}
                />
                {item.online && <div className="online-status"></div>}
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
                <Row>
                  <Col span={24}>
                    <span className={`last-message ${item.type}`}>
                      {item.type === "video" && <VideoCameraOutlined />}
                      {item.type === "audio" && <PhoneOutlined />}
                      {item.type === "notification" && (
                        <NotificationOutlined />
                      )}
                      {item.lastMessage}
                      <Badge count={item.unread} offset={[0, 0]}></Badge>
                    </span>
                  </Col>
                </Row>
              </div>
            </List.Item>
          )}
        />
      </Content>
    </Layout.Sider>
  );
};

export default UserList;