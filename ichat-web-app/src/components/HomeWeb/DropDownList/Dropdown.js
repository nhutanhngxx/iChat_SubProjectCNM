import React, { useState, useEffect } from "react";
import { Menu, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./Dropdown.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../redux/slices/authSlice";
import ClipLoader from "react-spinners/ClipLoader";
import { setUserRedux } from "../../../redux/slices/userSlide";

import ProfileModal from "./ProfileModal/ProfileModal";
import SettingsModal from "./SettingsModal/SettingsModal";

const ProfileDropdown = ({ onOpenSettings }) => {
  const dispatch = useDispatch();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 🔥 State để kiểm soát loader
  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate();
  // console.log("user from Dropdown: ", user);
  useEffect(() => {
    // console.log("User mới đã cập nhật tereeb dropdown: ", user);
  }, [user]);

  // Đăng xuất
  const handleLogout = async () => {
    setIsLoading(true); // Bắt đầu hiển thị loader
    try {
      if (!user?.id) {
        console.error("User ID not found");
        // If no user ID, just clear local state and redirect
        navigate("/");
        return;
      }
      // console.log("Đang thực hiện đăng xuất...");
      // console.log("user from Dropdown: ", user.id);

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

  // console.log("user from Dropdown: ", user);

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
  const getInitials = (fullName) => {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <div className="avatar-container-sidebar">
          {/* <img src={user?.avatar_path || ""} alt="Avatar"></img> */}
          {user?.avatar_path ? (
            <img src={user.avatar_path} alt="Avatar" />
          ) : (
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#007bff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
                textTransform: "uppercase",
              }}
            >
              {getInitials(user?.full_name)}
            </div>
          )}
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
