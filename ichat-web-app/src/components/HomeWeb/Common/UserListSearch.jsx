import React from "react";
import "./SearchDropdown.css";
import { Layout, Content, List } from "antd";

const listItems = [
  { id: 1, image: "user1", name: "Triệu Quốc An" },
  { id: 2, image: "cloud", name: "Nguyễn Thanh Cường" },
  { id: 3, image: "user2", name: "Lê Phước Nguyên" },
  { id: 4, image: "user3", name: "Đình Nguyễn Chung" },
  { id: 5, image: "cloud_plus", name: "Cloud của tôi" },
];

const renderItem = (item) => (
  <List.Item className="search-item">
    <div className="avatar-container">
      <img
        src={`https://i.pravatar.cc/150?img=${item.id}`}
        alt="avatar"
        className="avatar"
      />
    </div>
    <span className="name">{item.name}</span>
  </List.Item>
);

const SearchDropdown = ({ recentSearches, onClose }) => {
  return (
    <Layout className="chat-sidebar">
      <Content className="list-user-search">
        <List dataSource={listItems} renderItem={renderItem} />
      </Content>
    </Layout>
  );
};

export default SearchDropdown;
