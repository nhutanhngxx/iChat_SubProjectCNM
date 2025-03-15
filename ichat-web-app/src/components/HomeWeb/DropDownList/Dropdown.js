import React, { useState } from "react";
import { Menu, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Dropdown.css";
import { useDispatch, useSelector } from "react-redux";

import ProfileModal from "./ProfileModal/ProfileModal";
import SettingsModal from "./SettingsModal/SettingsModal";

const ProfileDropdown = ({ onOpenSettings }) => {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const handleOpenProfile = () => {
    setProfileModalVisible(true);
  };

  const handleCloseProfile = () => {
    setProfileModalVisible(false);
  };

  const handleOpenSettings = () => {
    setSettingsModalVisible(true);
  };

  const handleCloseSettings = () => {
    setSettingsModalVisible(false);
  };
  console.log("user from Dropdown: ", user);

  const menu = (
    <Menu className="profile-menu">
      <Menu.Item key="0">
        <strong>{user?.full_name || ""}</strong>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" onClick={handleOpenProfile}>
        Hồ sơ của bạn
      </Menu.Item>

      <Menu.Item key="2" onClick={handleOpenSettings || onOpenSettings}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" className="logout">
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <div className="avatar-container-sidebar">
          <img src={user?.avatar_path || ""}></img>
        </div>
      </Dropdown>
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfile}
        user={user}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default ProfileDropdown;
