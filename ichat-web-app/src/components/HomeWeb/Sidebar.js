import React, { useState } from "react";
import { Layout } from "antd";
import {
  MessageOutlined,
  ContactsOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  ScissorOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";
import ProfileDropdown from "./DropDownList/Dropdown";

const { Sider } = Layout;

const Sidebar = ({ onIconClick }) => {
  const [selectedIcon, setSelectedIcon] = useState("chatwindow");
  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName);
    onIconClick(iconName);
  };
  return (
    <Sider width={60} className="custom-sidebar">
      {/* Avatar */}
      <ProfileDropdown />
      <div className="sidebar-content">
        {/* Nhóm icon trên */}
        <div className="icon-group">
          <MessageOutlined
            className={`sidebar-icon ${
              selectedIcon === "chatwindow" ? "active" : ""
            }`}
            onClick={() => handleIconClick("chatwindow")} // Truyền giá trị "chatwindow"
          />
          <ContactsOutlined
            className={`sidebar-icon ${
              selectedIcon === "book" ? "active" : ""
            }`}
            onClick={() => handleIconClick("book")} // Truyền giá trị "book"
          />
          {/* <CheckSquareOutlined
            className="sidebar-icon"
            onClick={() => onIconClick("check")} // Truyền giá trị "check"
          /> */}
        </div>

        {/* Nhóm icon dưới */}
        <div className="icon-group bottom">
          <CloudOutlined
            className={`sidebar-icon ${
              selectedIcon === "cloud" ? "active" : ""
            }`}
            onClick={() => handleIconClick("cloud")} // Truyền giá trị "cloud"
          />
          {/* <ScissorOutlined
            className="sidebar-icon"
            onClick={() => onIconClick("scissor")} // Truyền giá trị "scissor"
          /> */}
          <SettingOutlined
            className={`sidebar-icon ${
              selectedIcon === "setting" ? "active" : ""
            }`}
            onClick={() => handleIconClick("setting")} // Truyền giá trị "setting"
          />
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
