import React, { useState } from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import "./SearchBar.css";
import AddFriend from "../ChatWindow/AddFriend";
import CreateGroupModal from "../ChatWindow/CreateGroupModal";

const SearchBar = ({ onFocus, onSelectUser }) => {
  const [isModalVisibleFriend, setIsModalVisibleFriend] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);

  const showModalFriend = () => {
    setIsModalVisibleFriend(true);
  };

  const showModalGroup = () => {
    setIsModalGroupVisible(true);
  };

  const handleClose = () => {
    setIsModalVisibleFriend(false);
    setIsModalGroupVisible(false);
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
        <UserOutlined className="user-icon" onClick={showModalFriend} />
        <AddFriend visible={isModalVisibleFriend} onClose={handleClose} onSelectUser={onSelectUser} />

        <UsergroupAddOutlined className="group-icon" onClick={showModalGroup} />
        <CreateGroupModal visible={isModalGroupVisible} onCancel={handleClose} />
      </div>
    </div>
  );
};

export default SearchBar;
