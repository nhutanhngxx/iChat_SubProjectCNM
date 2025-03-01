import React, { useState } from "react";
import { Menu, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Dropdown.css";

import ProfileModal from "./ProfileModal/ProfileModal";
import SettingsModal from "./SettingsModal/SettingsModal";

const ProfileDropdown = () => {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

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

  const menu = (
    <Menu className="profile-menu">
      <Menu.Item key="0">
        <strong>Đinh Nguyên Chung</strong>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" onClick={handleOpenProfile}>
        Hồ sơ của bạn
      </Menu.Item>

      <Menu.Item key="2" onClick={handleOpenSettings}>
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
          <img src="https://i.ibb.co/7Njf5HW0/avt.jpg"></img>
        </div>
      </Dropdown>
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={handleCloseProfile}
      />
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={handleCloseSettings}
      />
    </>
  );
};

export default ProfileDropdown;
