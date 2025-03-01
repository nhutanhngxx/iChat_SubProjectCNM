import React, { useState } from "react";
import {
  Layout,
  List,
  Avatar,
  Tabs,
  Dropdown,
  Button,
  Select,
  Badge,
} from "antd";
import {
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { MdMoreHoriz } from "react-icons/md"; // Ngang (⋯)
import "./ComponentLeftSearch.css";

import SearchComponent from "./SearchComponent";
import MenuMdMoreHoriz from "./MenuMdMoreHoriz";

const { Content } = Layout;
const { TabPane } = Tabs;

const contacts = [
  {
    id: 1,
    name: "Nhà thuốc FPT Long Châu",
    avatar: "https://via.placeholder.com/40",
    type: "business",
  },
  {
    id: 2,
    name: "FSoft Tour (7h00 ngày 22/0...)",
    avatar: "https://via.placeholder.com/40",
    type: "group",
  },
  {
    id: 3,
    name: "✨ CHAT HACK MAP LIÊN QUÂN ✨",
    avatar: "https://via.placeholder.com/40",
    type: "gaming",
  },
  {
    id: 4,
    name: "HACK LQ FREE",
    avatar: "https://via.placeholder.com/40",
    type: "gaming",
  },
  {
    id: 5,
    name: "Cloud của tôi",
    avatar: "https://via.placeholder.com/40",
    subtitle: "Tên cũ: Truyền File",
    type: "cloud",
  },
];

const messages = [
  {
    id: 1,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content: "@Ngo Trung Dung sai thì về làm lại tiếp kk",
    avatar: "https://i.pravatar.cc/40?img=1",
    unread: 5,
  },
  {
    id: 2,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "@Ngo Trung Dung khảo sát để có dữ liệu từ dữ liệu đó mới phân tích...",
    avatar: "https://i.pravatar.cc/40?img=2",
    unread: 5,
  },
  {
    id: 3,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "Ngo Trung Dung: vậy thì làm khảo sát với phân tích dữ liệu có ý nghĩa gì nữa",
    avatar: "https://i.pravatar.cc/40?img=3",
    unread: 5,
  },
  {
    id: 4,
    name: "Thực hành TTDT",
    time: "1 giờ",
    content:
      "Bạn: chân dung khách hàng là khách hàng mình muốn hướng tới, nếu chung...",
    avatar: "https://i.pravatar.cc/40?img=4",
    unread: 5,
  },
];

const renderItemRecently = (item, handleDelete) => {
  return (
    <List.Item className="list-item">
      <div className="avatar-container">
        <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
      </div>
      <div className="chat-info">
        <span className="chat-name">{item.name}</span>
      </div>
      <div className="delete-button" onClick={() => handleDelete(item.id)}>
        <CloseOutlined />
      </div>
    </List.Item>
  );
};

const renderItemSearch = (item) => {
  return (
    <List.Item className="list-item">
      <div className="avatar-container">
        <Avatar size={48} src={`https://i.pravatar.cc/150?img=${item.id}`} />
      </div>
      <div className="chat-info">
        <span className="chat-name">{item.name}</span>
      </div>
      <div className="delete-button">
        <Dropdown overlay={<MenuMdMoreHoriz />} trigger={["click"]}>
          <Button type="text" icon={<MdMoreHoriz size={24} color="#333" />} />
        </Dropdown>
      </div>
    </List.Item>
  );
};

const ComponentLeftSearch = ({ userList, onSelectUser }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredRecentlyUser, setFilteredRecentlyUser] = useState(userList);

  const handleDelete = (id) => {
    setFilteredRecentlyUser(
      filteredRecentlyUser.filter((item) => item.id !== id)
    );
  };

  const filteredSearchUser = contacts.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout className="chat-sidebar">
      <SearchComponent searchText={searchText} setSearchText={setSearchText} />

      {searchText ? (
        <Content className="chat-list">
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{ margin: "0px 0px 4px 0px", padding: "0 20px" }}
            style={{ fontWeight: "bold" }}
          >
            <TabPane tab="Tất cả" key="1">
              Nội dung
            </TabPane>
            <TabPane tab="Liên hệ" key="2">
              <div className="title-tabpane">
                Cá nhân ({filteredSearchUser.length})
              </div>
              <List
                itemLayout="horizontal"
                dataSource={filteredSearchUser}
                renderItem={(item) => renderItemSearch(item, handleDelete)}
              />
            </TabPane>
            <TabPane tab="Tin nhắn" key="3">
              <div className="filter-container">
                <span className="filter-item">Lọc theo:</span>
                <Select
                  defaultValue="Người gửi"
                  className="filter-select"
                  suffixIcon={<UserOutlined />}
                />
              </div>
            </TabPane>
            <TabPane tab="File" key="4">
              Nội dung4
            </TabPane>
          </Tabs>
        </Content>
      ) : (
        <div>
          <div className="title-chat-sidebar">Tìm gần đây</div>
          <Content className="chat-list">
            <List
              itemLayout="horizontal"
              dataSource={filteredRecentlyUser}
              renderItem={(item) => renderItemRecently(item, handleDelete)}
            />
          </Content>
        </div>
      )}
    </Layout>
  );
};

export default ComponentLeftSearch;
