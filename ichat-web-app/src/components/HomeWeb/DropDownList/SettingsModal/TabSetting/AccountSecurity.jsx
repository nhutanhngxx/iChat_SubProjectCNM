import React, { useState } from "react";
import "./css/AccountSecurity.css"; // Import file CSS
import { FiChevronRight } from "react-icons/fi";
import { FiChevronLeft } from "react-icons/fi";
const SecuritySettings = () => {
  const [lockScreenEnabled, setLockScreenEnabled] = useState(false);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const toggleLockScreen = () => {
    setLockScreenEnabled(!lockScreenEnabled);
  };

  const toggleTwoFactorAuth = () => {
    setTwoFactorAuthEnabled(!twoFactorAuthEnabled);
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
  };

  const handleBackClick = () => {
    setShowChangePassword(false);
  };

  return (
    <div className="security-settings-container">
      <div className={`main-content ${showChangePassword ? "shift-left" : ""}`}>
        <h2>Mật khẩu đăng nhập</h2>
        <button
          className="button-changePass"
          onClick={handleChangePasswordClick}
        >
          <div> Đổi mật khẩu</div>
          <div>
            <FiChevronRight />
          </div>
        </button>

        {/* <h2>Khóa màn hình Ichat</h2>
        <p>Khóa màn hình Ichat của bạn, khi bạn không sử dụng máy tính.</p>
        <button onClick={toggleLockScreen}>
          {lockScreenEnabled
            ? "Khóa màn hình Zalo Đã bật"
            : "Khóa màn hình Zalo Đã tắt"}
        </button> */}

        <h2>Bảo mật 2 lớp</h2>
        <p>
          Sau khi bật, bạn sẽ được yêu cầu nhập mã OTP hoặc xác thực từ thiết bị
          di động sau khi đăng nhập trên thiết bị lạ.
        </p>
        <button className="button-security" onClick={toggleTwoFactorAuth}>
          {twoFactorAuthEnabled
            ? "Bảo mật 2 lớp Đã bật"
            : "Bảo mật 2 lớp Đã tắt"}
        </button>
      </div>

      <div
        className={`change-password-content ${
          showChangePassword ? "slide-in" : ""
        }`}
      >
        <div className="header-changPassWord">
          <div onClick={handleBackClick}>
            <FiChevronLeft className="icon-backleft" />
          </div>
          <h2>Đổi mật khẩu</h2>
        </div>
        <form>
          <p>
            <strong>Lưu ý:</strong> Mật khẩu bao gồm chữ kèm theo số hoặc ký tự
            đặc biệt, tối thiểu 8 ký tự trở lên & tối đa 32 ký tự{" "}
          </p>
          <label>Mật khẩu hiện tại:</label>
          <input type="password" />

          <label>Mật khẩu mới:</label>
          <input type="password" />

          <label>Xác nhận mật khẩu mới:</label>
          <input type="password" />

          <button type="submit">Lưu thay đổi</button>
        </form>
        <button onClick={handleBackClick}>Huỷ</button>
      </div>
    </div>
  );
};

export default SecuritySettings;
