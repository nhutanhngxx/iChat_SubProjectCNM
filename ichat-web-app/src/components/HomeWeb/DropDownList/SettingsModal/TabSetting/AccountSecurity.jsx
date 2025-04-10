import React, { useState } from "react";
import "./css/AccountSecurity.css"; // Import file CSS
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../../../../redux/slices/authSlice"; // đường dẫn tới slice của bạn


const SecuritySettings = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth); // Lấy thông tin người dùng từ Redux store
  const [lockScreenEnabled, setLockScreenEnabled] = useState(false);
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // State cho input
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State cho validate
  const [newPasswordValid, setNewPasswordValid] = useState(null); // true/false/null
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);

  // 👁️ State để toggle hiển thị mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    resetForm();
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordValid(null);
    setConfirmPasswordValid(null);
  };

  const validateNewPassword = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[\d\W]).{8,32}$/;
    return regex.test(password);
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setNewPasswordValid(validateNewPassword(value));
    setConfirmPasswordValid(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordValid(value === newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateNewPassword(newPassword) && confirmPassword === newPassword) {
      try {
        console.log("UserId of change password:", user.id);

        await dispatch(changePassword({ userId: user.id, currentPassword, newPassword })).unwrap();

        alert("Đổi mật khẩu thành công!");
        resetForm();
        setShowChangePassword(false);
      } catch (err) {
        alert(`Lỗi: ${err}`);
        console.error("Lỗi thay đổi mật khẩu", err);

      }
    } else {
      alert("Vui lòng kiểm tra lại các trường nhập!");
    }

  };

  return (
    <div className="security-settings-container">
      <div className={`main-content ${showChangePassword ? "shift-left" : ""}`}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Mật khẩu đăng nhập</h2>
        <button
          className="button-changePass"
          onClick={handleChangePasswordClick}
          style={{ marginTop: "20px" }}
        >
          <div>Đổi mật khẩu</div>
          <div><FiChevronRight size={20} /></div>
        </button>

        {/* <h2>Bảo mật 2 lớp</h2>
        <p>
          Sau khi bật, bạn sẽ được yêu cầu nhập mã OTP hoặc xác thực từ thiết bị
          di động sau khi đăng nhập trên thiết bị lạ.
        </p>
        <button className="button-security" onClick={toggleTwoFactorAuth}>
          <p>Bảo mật 2 lớp</p>
          <p>{twoFactorAuthEnabled ? "Đã bật" : "Đã tắt"}</p>
        </button> */}
      </div>

      <div className={`change-password-content ${showChangePassword ? "slide-in" : ""}`}>
        <div className="header-changPassWord">
          <div onClick={handleBackClick}>
            <FiChevronLeft className="icon-backleft" size={20} />
          </div>
          <h2 style={{ paddingBottom: "5px", fontSize: "18px" }}>Đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <p>
            <strong>Lưu ý:</strong> Mật khẩu bao gồm chữ kèm theo số hoặc ký tự
            đặc biệt, tối thiểu 8 ký tự & tối đa 32 ký tự.
          </p>

          <label>Mật khẩu hiện tại:</label>
          <div className="input-password-group">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <span onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="eye-icon">
              {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </span>
          </div>

          <label>Mật khẩu mới:</label>
          <div className="input-password-group">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              className={
                newPasswordValid === null
                  ? ""
                  : newPasswordValid
                    ? "input-valid"
                    : "input-invalid"
              }
            />
            <span onClick={() => setShowNewPassword(!showNewPassword)} className="eye-icon">
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </span>
          </div>

          <label>Xác nhận mật khẩu mới:</label>
          <div className="input-password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={
                confirmPasswordValid === null
                  ? ""
                  : confirmPasswordValid
                    ? "input-valid"
                    : "input-invalid"
              }
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="eye-icon">
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </span>
          </div>

          <button type="submit">Lưu thay đổi</button>
        </form>
        {/* <button onClick={handleBackClick}>Huỷ</button> */}
      </div>
    </div>
  );
};

export default SecuritySettings;
