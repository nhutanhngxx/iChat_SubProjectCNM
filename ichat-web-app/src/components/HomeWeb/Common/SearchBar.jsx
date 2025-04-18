import React, { useState } from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import "./SearchBar.css";
import AddFriend from "../ChatWindow/AddFriend";

const SearchBar = ({ onFocus ,onSelectUser}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };
  return (
    <div className="search-container">
      <Input
        prefix={<SearchOutlined className="search-icon" />}
        className="search-bar"
        placeholder="Tìm kiếm"
        onFocus={onFocus}
      />
      <div className="icons">
        <UserOutlined className="user-icon" onClick={showModal} />
        <AddFriend visible={isModalVisible} onClose={handleClose} onSelectUser={onSelectUser} />

        <UsergroupAddOutlined className="group-icon" />
      </div>
    </div>
  );
};

export default SearchBar;
