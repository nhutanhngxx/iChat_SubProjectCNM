import React from "react";
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
  return (
    <Sider width={60} className="custom-sidebar">
      {/* Avatar */}
      <ProfileDropdown />
      {/* Nhóm icon trên */}
      <div className="icon-group">
        <MessageOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("chatwindow")} // Truyền giá trị "chatwindow"
        />
        <ContactsOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("book")} // Truyền giá trị "book"
        />
        <CheckSquareOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("check")} // Truyền giá trị "check"
        />
      </div>

      {/* Nhóm icon dưới */}
      <div className="icon-group bottom">
        <CloudOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("cloud")} // Truyền giá trị "cloud"
        />
        <ScissorOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("scissor")} // Truyền giá trị "scissor"
        />
        <SettingOutlined
          className="sidebar-icon"
          onClick={() => onIconClick("setting")} // Truyền giá trị "setting"
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
