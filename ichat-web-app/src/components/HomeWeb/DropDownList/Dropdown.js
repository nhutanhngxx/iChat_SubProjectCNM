import React, { useState } from "react";
import { Menu, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Dropdown.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../redux/slices/authSlice";
import ClipLoader from "react-spinners/ClipLoader";

import ProfileModal from "./ProfileModal/ProfileModal";
import SettingsModal from "./SettingsModal/SettingsModal";

const ProfileDropdown = ({ onOpenSettings }) => {
  const dispatch = useDispatch();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 🔥 State để kiểm soát loader
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Đăng xuất
  const handleLogout = async () => {
    setIsLoading(true); // Bắt đầu hiển thị loader
    try {
      console.log("Đang thực hiện đăng xuất...");
      console.log("user from Dropdown: ", user.id);
      
      
      await dispatch(logoutUser(user.id)).unwrap();

      navigate("/"); // Chuyển hướng sau khi logout thành công
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      setIsLoading(false); // Ẩn loader dù thành công hay thất bại
    }
  };

  const handleOpenProfile = () => setProfileModalVisible(true);
  const handleCloseProfile = () => setProfileModalVisible(false);
  const handleOpenSettings = () => setSettingsModalVisible(true);
  const handleCloseSettings = () => setSettingsModalVisible(false);

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
      <Menu.Item key="3" className="logout" onClick={handleLogout}>
        {isLoading ? (
          <ClipLoader
            size={100}
            color={"blue"}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "cornsilk",
              zIndex: 9999,
            }}
          />
        ) : (
          <span>Đăng xuất</span>
        )}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <div className="avatar-container-sidebar">
          <img src={user?.avatar_path || ""} alt="Avatar"></img>
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
