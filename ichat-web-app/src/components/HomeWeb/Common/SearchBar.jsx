import React from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import "./SearchBar.css";

const SearchBar = ({ onFocus }) => {
  return (
    <div className="search-container">
      <Input
        prefix={<SearchOutlined className="search-icon" />}
        className="search-bar"
        placeholder="Tìm kiếm"
        onFocus={onFocus}
      />
      <div className="icons">
        <UserOutlined className="user-icon" />
        <UsergroupAddOutlined className="group-icon" />
      </div>
    </div>
  );
};

export default SearchBar;
